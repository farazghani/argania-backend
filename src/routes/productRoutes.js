import express from "express";
import {
    getProducts,
    getProductById,
    addProduct,
    updateProduct,
    deleteProduct,
} from "../controllers/productcontroller.js";
import { authMiddleware, isAdmin  } from "../middlewares/auth.js";
import { upload } from "../middlewares/upload.js";
import { uploadProductImage } from "../controllers/uploadcontroller.js";

const router = express.Router();

// Public routes
router.get("/", getProducts);
router.get("/:id", getProductById);

// Admin-only routes
router.post("/", authMiddleware, isAdmin, addProduct);
router.patch("/:id", authMiddleware, isAdmin, updateProduct);
router.delete("/:id",authMiddleware, isAdmin, deleteProduct);

router.post("/upload-image", upload.single("file"), uploadProductImage);
export default router;
