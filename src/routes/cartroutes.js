import express from "express";
import { addToCart, getCart, removeFromCart } from "../controllers/cartcontroller.js";
import { authMiddleware } from "../middlewares/auth.js";

const router = express.Router();

router.get("/", authMiddleware, getCart);
router.post("/", authMiddleware, addToCart);
router.delete("/:itemId", authMiddleware, removeFromCart);

export default router;