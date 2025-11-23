import razorpay from "../services/razorpay.js";

export const createPaymentOrder = async (req, res) => {
    try {
        const { amount } = req.body; // amount in INR

        const options = {
            amount: amount * 100, // Razorpay expects paise
            currency: "INR",
            receipt: `receipt_${Date.now()}`
        };

        const order = await razorpay.orders.create(options);

        res.status(201).json({
            success: true,
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            key: process.env.RAZORPAY_KEY_ID
        });

    } catch (error) {
        console.error("Razorpay order error:", error);
        res.status(500).json({ success: false, message: "Payment order failed" });
    }
};
