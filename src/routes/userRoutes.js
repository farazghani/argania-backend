import express from "express";
import {
    registerUser,
    loginUser,
    getProfile,
    refreshAccessToken
} from "../controllers/usercontroller.js";
import { registerAdmin } from "../controllers/admincontroller.js";
import { authMiddleware, isAdmin } from "../middlewares/auth.js";

const router = express.Router();

// Public auth routes
router.post("/register", registerUser);

router.post("/login", loginUser);

// Private user routes
router.get("/me", authMiddleware, getProfile);

router.post("/refresh-token", refreshAccessToken);

// Admin-only (optional, secure this)
router.post("/register-admin", authMiddleware, isAdmin, registerAdmin);

export default router;