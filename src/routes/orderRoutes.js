import express from "express";
import {
    createOrder,
    getOrders,
    getPaidOrder,
    getOrderById,
    updateOrderStatus,
    createRazorpayOrder,
    deleteOrder
} from "../controllers/ordercontroller.js";
import { authMiddleware, isAdmin } from "../middlewares/auth.js";

const router = express.Router();

// ✅ Create a new order (user only)
router.post("/", authMiddleware, createOrder);

router.post("/razorpay" , authMiddleware , createRazorpayOrder);

// ✅ Get all orders of the logged-in user
router.get("/", authMiddleware, getOrders);

router.post("/paidorder" , authMiddleware , isAdmin , getPaidOrder);

// ✅ Get single order (user can get their own, admin can get any)
router.get("/:id", authMiddleware, getOrderById);

// ✅ Update order status (admin only)
router.patch("/:id/status", authMiddleware, isAdmin, updateOrderStatus);

// ✅ Delete an order (admin only)
router.delete("/:id", authMiddleware, isAdmin, deleteOrder);

export default router;
