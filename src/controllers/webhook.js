import crypto from "crypto";
import prisma from "../services/prisma.js";

export const razorpayWebhook = async (req, res) => {
  try {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

    /* -------------------------------------------------- */
    /* 1️⃣ SIGNATURE VERIFICATION */
    /* -------------------------------------------------- */
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(req.rawBody)
      .digest("hex");

    const receivedSignature = req.headers["x-razorpay-signature"];

    if (expectedSignature !== receivedSignature) {
      console.log("❌ Invalid Signature");
      return res.status(400).send("Invalid signature");
    }

    console.log("✔️ Webhook Verified");

    /* -------------------------------------------------- */
    /* 2️⃣ EXTRACT PAYMENT DATA */
    /* -------------------------------------------------- */
    const event = req.body.event;
    const payment = req.body.payload.payment.entity;

    const razorpayPaymentId = payment.id;
    const razorpayOrderId = payment.order_id;
    const amount = payment.amount;
    const method = payment.method || null;
    const email = payment.email || null;
    const contact = payment.contact || null;

    /* -------------------------------------------------- */
    /* 3️⃣ LOAD ORDER + ITEMS */
    /* -------------------------------------------------- */
    const order = await prisma.order.findFirst({
      where: { razorpayOrderId },
      include: { orderItems: true },
    });

    if (!order) {
      console.log("❌ Order not found for:", razorpayOrderId);
      return res.status(200).send("OK");
    }

    /* -------------------------------------------------- */
    /* 4️⃣ PREVENT DUPLICATE PAYMENTS (webhook retry) */
    /* -------------------------------------------------- */
    const existingPayment = await prisma.payment.findFirst({
      where: { razorpayPaymentId },
    });

    if (existingPayment) {
      console.log("⚠️ Duplicate Webhook Ignored");
      return res.status(200).send("OK");
    }

    /* -------------------------------------------------- */
    /* 5️⃣ HANDLE EVENTS */
    /* -------------------------------------------------- */

    switch (event) {
      /* 🔵 PAYMENT AUTHORIZED */
      case "payment.authorized":
        console.log("🔵 Payment Authorized:", razorpayPaymentId);

        await prisma.payment.create({
          data: {
            orderId: order.id,
            razorpayOrderId,
            razorpayPaymentId,
            amount,
            status: "AUTHORIZED",
            method,
            email,
            contact,
          },
        });

        break;

      /* 🟢 PAYMENT CAPTURED (SUCCESS) */
      case "payment.captured":
        console.log("🟢 Payment Captured:", razorpayPaymentId);

        // Update order
        await prisma.order.update({
          where: { id: order.id },
          data: {
            status: "PROCESSING",
            razorpayPaymentId,
            razorpaySignature: receivedSignature,
          },
        });

        // Save payment
        await prisma.payment.create({
          data: {
            orderId: order.id,
            razorpayOrderId,
            razorpayPaymentId,
            amount,
            status: "CAPTURED",
            method,
            email,
            contact,
          },
        });

        // Reduce stock
        for (const item of order.orderItems) {
          await prisma.product.update({
            where: { id: item.productId },
            data: { stock: { decrement: item.quantity } },
          });
        }

        // Clear user cart
        await prisma.cartItem.deleteMany({
          where: { userId: order.userId },
        });

        console.log("✅ Order processed + stock updated + cart cleared");
        break;

      /* 🔴 PAYMENT FAILED */
      case "payment.failed":
        console.log("🔴 Payment Failed:", razorpayPaymentId);

        await prisma.order.update({
          where: { id: order.id },
          data: { status: "CANCELED" },
        });

        await prisma.payment.create({
          data: {
            orderId: order.id,
            razorpayOrderId,
            razorpayPaymentId,
            amount,
            status: "FAILED",
            email,
            contact,
          },
        });

        break;

      default:
        console.log("ℹ️ Unhandled event:", event);
        break;
    }

    return res.status(200).send("OK");

  } catch (err) {
    console.error("Webhook Error:", err);
    return res.status(500).send("Server error");
  }
};
