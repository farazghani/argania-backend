import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { createPaymentOrder } from "../controllers/createPaymentOrder.js";
import { verifyPayment } from "../controllers/verifyPayment.js";
import { razorpayWebhook } from "../controllers/razorpayWebhook.js";


const router = express.Router();

router.post("/create-payment", authMiddleware, createPaymentOrder);
router.post("/verify-payment", authMiddleware, verifyPayment);

// Webhooks must NOT use auth (Razorpay servers call this)
router.post("/webhook/razorpay", razorpayWebhook);

export default router;
