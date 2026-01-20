import express from "express";
import { 
    getCart, 
    addToCart, 
    updateCart, 
    removeFromCart, 
    clearCart, 
    getCartSummary 
} from "../controllers/cartcontroller.js";
import { authMiddleware } from "../middlewares/auth.js";

const router = express.Router();

// Get all cart items for authenticated user
router.get("/", authMiddleware, getCart);

// Add item to cart
router.post("/", authMiddleware, addToCart);

// Get cart summary (total items, quantity)
router.get("/summary", authMiddleware, getCartSummary);

// Update cart item quantity
router.patch("/:cartItemId", authMiddleware, updateCart);

// Remove item from cart
router.delete("/:itemId", authMiddleware, removeFromCart);

// Clear entire cart
router.delete("/", authMiddleware, clearCart);

export default router;