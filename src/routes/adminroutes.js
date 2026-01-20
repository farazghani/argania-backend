import express from "express";
import { registerAdmin, getAllOrders, createVoucher , getProfit } from "../controllers/admincontroller.js";
import { authMiddleware, isAdmin } from "../middlewares/auth.js";

const router = express.Router();

// Public route
router.post("/register-admin", registerAdmin);

// Admin-only routes
router.post("/get-all-orders", authMiddleware, isAdmin, getAllOrders);
router.post("/voucher", authMiddleware, isAdmin, createVoucher);

export default router
