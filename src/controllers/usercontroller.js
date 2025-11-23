// controllers/authController.js
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../services/prisma.js";
import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

// 🔐 Verify JWT env vars
if (!process.env.JWT_SECRET || !process.env.JWT_REFRESH_SECRET) {
    throw new Error("JWT secrets missing in environment");
}

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
const JWT_EXPIRES_IN = "15m";     // short-lived access token
const REFRESH_EXPIRES_IN = "7d";  // long-lived refresh token

// 📘 Validation schemas
const registerSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email"),
    password: z.string().min(6, "Password must be at least 6 characters"),
});

const loginSchema = z.object({
    email: z.string().email("Invalid email"),
    password: z.string().min(6, "Password required"),
});

// 🔑 Token generator
const generateTokens = (user) => {
    const payload = { id: user.id, role: user.role, tokenVersion: user.tokenVersion };

    const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    const refreshToken = jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: REFRESH_EXPIRES_IN });

    return { accessToken, refreshToken };
};

// 🧩 Register new user
export const registerUser = async (req, res) => {
    try {
        const parsed = registerSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ success: false, errors: parsed.error.errors });
        }

        const { name, email, password } = parsed.data;

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ success: false, message: "Email already registered" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await prisma.user.create({
            data: { name, email, password: hashedPassword, tokenVersion: 0 },
        });

        const { accessToken, refreshToken } = generateTokens(newUser);

        res.status(201).json({
            success: true,
            message: "User registered successfully",
            accessToken,
            refreshToken,
            user: {
                id: newUser.id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role,
            },
        });
    } catch (error) {
        console.error("Register error:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// 🧠 Login user
export const loginUser = async (req, res) => {
    try {
        const parsed = loginSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ success: false, errors: parsed.error.errors });
        }

        const { email, password } = parsed.data;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(400).json({ success: false, message: "Invalid credentials" });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ success: false, message: "Invalid credentials" });
        }

        const { accessToken, refreshToken } = generateTokens(user);

        res.json({
            success: true,
            message: "Login successful",
            accessToken,
            refreshToken,
            user: { id: user.id, name: user.name, email: user.email, role: user.role },
        });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// ♻️ Refresh access token
export const refreshAccessToken = async (req, res) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            return res.status(400).json({ success: false, message: "Refresh token required" });
        }

        const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET);

        const user = await prisma.user.findUnique({ where: { id: decoded.id } });
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        if (decoded.tokenVersion !== user.tokenVersion) {
            return res.status(403).json({ success: false, message: "Token revoked, please log in again" });
        }

        const { accessToken } = generateTokens(user);
        res.json({ success: true, accessToken });
    } catch (error) {
        console.error("Refresh error:", error);
        if (error.name === "TokenExpiredError") {
            return res.status(403).json({ success: false, message: "Refresh token expired" });
        }
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// 👤 Get user profile
export const getProfile = async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            include: {
                Address: true,
                cartItems: true,
                orders: { select: { id: true, status: true, createdAt: true } },
            },
        });

        if (!user) return res.status(404).json({ message: "User not found" });

        res.json({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            addresses: user.Address,
            cartCount: user.cartItems.length,
            recentOrders: user.orders.slice(0, 5),
        });
    } catch (error) {
        console.error("Profile error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
