import crypto from "crypto";
import prisma from "../prisma/client.js";

export const razorpayWebhook = async (req, res) => {
    try {
        const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

        const digest = crypto
            .createHmac("sha256", secret)
            .update(JSON.stringify(req.body))
            .digest("hex");

        if (digest !== req.headers["x-razorpay-signature"]) {
            return res.status(400).json({ success: false });
        }

        const payment = req.body.payload.payment.entity;

        const order = await prisma.order.findUnique({
            where: { razorpayOrderId: payment.order_id }
        });

        if (!order) {
            return res.status(404).json({ success: false });
        }

        if (order.status === "PAID") {
            return res.json({ status: "already processed" });
        }

        await prisma.order.update({
            where: { razorpayOrderId: payment.order_id },
            data: {
                status: "PAID",
                razorpayPaymentId: payment.id
            }
        });

        res.json({ status: "ok" });
    } catch (error) {
        console.error("Webhook error:", error);
        res.status(500).json({ status: "error" });
    }
};


