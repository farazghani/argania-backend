import prisma from "../services/prisma.js";
import { orderSchema, updateOrderSchema } from "../validations/ordervalidation.js";
import Razorpay from "razorpay";
import crypto from "crypto";


// Initialize Razorpay instance (move to config file ideally)
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Create Order
export const createOrder = async (req, res) => {
  try {
    const { addressId, voucherCode } = req.body;
    const userId = req.user.id;

    // 1️⃣ Validate address
    const address = await prisma.address.findUnique({
      where: { id: addressId },
    });

    if (!address || address.userId !== userId) {
      return res.status(400).json({ error: "Invalid address" });
    }

    // 2️⃣ Fetch Cart Items From DB (NOT from req.body)
    const cartItems = await prisma.cartItem.findMany({
      where: { userId },
      include: { product: true },
    });

    if (!cartItems.length) {
      return res.status(400).json({ error: "Cart is empty" });
    }

    // 3️⃣ Calculate totals
    let total = 0;

    for (const item of cartItems) {
      if (!item.product || item.product.stock < item.quantity) {
        return res.status(400).json({
          error: `Product ${item.product.name} is out of stock`,
        });
      }
      total += item.product.price * item.quantity;
    }

    // 4️⃣ Apply voucher
    let discount = 0;
    let finalTotal = total;
    let voucherId = null;

    if (voucherCode) {
      const voucher = await prisma.voucher.findUnique({
        where: { code: voucherCode },
      });

      if (!voucher || !voucher.isActive || voucher.expiresAt < new Date()) {
        return res.status(400).json({ error: "Invalid or expired voucher" });
      }

      discount = (total * voucher.discount) / 100;
      finalTotal = total - discount;
      voucherId = voucher.id;
    }

    // 5️⃣ Create internal order + order items
    const order = await prisma.order.create({
      data: {
        userId,
        voucherId,
        addressId,
        total,
        discount,
        finalTotal,
        orderItems: {
          create: cartItems.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
        },
      },
      include: {
        orderItems: { include: { product: true } },
      },
    });

    // 6️⃣ Create Razorpay order
    const razorpayOrder = await razorpay.orders.create({
      amount: finalTotal * 100,
      currency: "INR",
      receipt: order.id,
      notes: {
        internalOrderId: order.id,
        userId,
      },
    });

    // 7️⃣ Save razorpayOrderId inside your DB
    await prisma.order.update({
      where: { id: order.id },
      data: { razorpayOrderId: razorpayOrder.id },
    });

    // 8️⃣ Return details to frontend
    return res.status(201).json({
      success: true,
      message: "Order created",
      orderId: order.id,
      razorpayOrderId: razorpayOrder.id,
      total,
      finalTotal,
      currency: "INR",
      items: order.orderItems,
    });

  } catch (error) {
    console.error("createOrder:", error);
    return res.status(500).json({ error: error.message });
  }
};


// Get all orders (admin can see all, user sees own)
export const getOrders = async (req, res) => {
    try {
        const { userId } = req.query;
        const orders = await prisma.order.findMany({
            where: userId ? { userId } : {},
            include: { orderItems: { include: { product: true } }, voucher: true, address: true },
            orderBy: { createdAt: "desc" },
        });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get order by ID
export const getOrderById = async (req, res) => {
    try {
        const order = await prisma.order.findUnique({
            where: { id: req.params.id }, // cuid → String
            include: { orderItems: { include: { product: true } }, voucher: true, address: true },
        });
        if (!order) return res.status(404).json({ error: "Order not found" });
        res.json(order);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update order status (Admin only)
export const updateOrderStatus = async (req, res) => {
    try {

        console.log("updateOrderStatus body:", req.body);
        const parsed = updateOrderSchema.safeParse(req.body);
        if (!parsed.success || !parsed.data.status) {
            return res.status(400).json({ error: "Status is required" });
        }

        const { status } = parsed.data;
        const order = await prisma.order.update({
            where: { id: req.params.id },
            data: { status },
        });

        res.json(order);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Delete order (optional - usually you'd "cancel" instead)
export const deleteOrder = async (req, res) => {
    try {
        await prisma.orderItem.deleteMany({ where: { orderId: req.params.id } });
        await prisma.order.delete({ where: { id: req.params.id } });
        res.json({ message: "Order deleted successfully" });
    } catch (error) {
        console.error("deleteOrder:", error);
        res.status(500).json({ error: error.message });
    }
};
