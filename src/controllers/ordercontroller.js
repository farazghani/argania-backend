import prisma from "../services/prisma.js";
import { orderSchema, updateOrderSchema } from "../validations/ordervalidation.js";

// Create Order
export const createOrder = async (req, res) => {
    try {
        const parsed = orderSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ errors: parsed.error.errors });
        }

        const { items, voucherCode, addressId } = req.body;
        const userId = req.user.id;

        // 1. Validate address
        const address = await prisma.address.findUnique({ where: { id: addressId } });
        if (!address || address.userId !== userId) {
            return res.status(400).json({ error: "Invalid address" });
        }

        // 2. Calculate totals
        let total = 0;
        for (const item of items) {
            const product = await prisma.product.findUnique({ where: { id: item.productId } });
            if (!product || product.stock < item.quantity) {
                return res.status(400).json({ error: `Product ${item.productId} unavailable or out of stock` });
            }
            total += product.price * item.quantity;
        }

        // 3. Apply voucher
        let discount = 0;
        let finalTotal = total;
        let voucherId = null;

        if (voucherCode) {
            const voucher = await prisma.voucher.findUnique({ where: { code: voucherCode } });
            if (!voucher || !voucher.isActive || voucher.expiresAt < new Date()) {
                return res.status(400).json({ error: "Invalid or expired voucher" });
            }

            discount = (total * voucher.discount) / 100;
            finalTotal = total - discount;
            voucherId = voucher.id;
        }

        // 4. Create order + order items
        const order = await prisma.order.create({
            data: {
                userId,
                voucherId,
                addressId,
                total,
                discount,
                finalTotal,
                orderItems: {
                    create: items.map(item => ({
                        productId: item.productId,
                        quantity: item.quantity,
                    })),
                },
            },
            include: { orderItems: { include: { product: true } }, voucher: true, address: true },
        });

        // 5. Reduce stock
        for (const item of items) {
            await prisma.product.update({
                where: { id: item.productId },
                data: { stock: { decrement: item.quantity } },
            });
        }

        res.json(order);
    } catch (error) {
        console.error("createOrder:", error);
        res.status(500).json({ error: error.message });
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
        const parsed = updateOrderSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ errors: parsed.error.errors });
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
        await prisma.order.delete({
            where: { id: req.params.id },
        });
        res.json({ message: "Order deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
