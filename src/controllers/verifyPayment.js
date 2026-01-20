import crypto from "crypto";
import prisma from "../services/prisma.js";

export const verifyPayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        const body = razorpay_order_id + "|" + razorpay_payment_id;

        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(body)
            .digest("hex");

        if (expectedSignature !== razorpay_signature) {
            return res.status(400).json({ success: false, message: "Invalid signature" });
        }

        const order = await prisma.order.findUnique({
            where: { razorpayOrderId: razorpay_order_id }
        });

        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }

        if (order.status === "PROCESSING") {
            return res.json({ success: true, message: "Already processed" });
        }

        await prisma.order.update({
            where: { razorpayOrderId: razorpay_order_id },
            data: {
                status: "PROCESSING",
                razorpayPaymentId: razorpay_payment_id
            }
        });

        res.json({ success: true, message: "Payment verified" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Server error" });
    }
};
