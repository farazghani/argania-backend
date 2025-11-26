import express from "express";
import { razorpayWebhook } from "../controllers/webhook.js";

const router = express.Router();

// IMPORTANT: raw body needed for Razorpay validation
router.post(
  "/webhook",
  express.json({
    verify: (req, res, buf) => {
      req.rawBody = buf;
    }
  }),
  razorpayWebhook
);

export default router;
