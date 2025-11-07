import bcrypt from "bcrypt";
import prisma from "../services/prisma.js";

export const registerAdmin = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: "Email already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newAdmin = await prisma.user.create({
            data: { name, email, password: hashedPassword, role: "ADMIN" },
        });

        res.status(201).json({
            message: "Admin registered",
            admin: { id: newAdmin.id, email: newAdmin.email },
        });
    } catch (error) {
        res.status(500).json({ message: "Error registering admin", error: error.message });
    }
};

// ✅ Admin: Get all orders
export const getAllOrders = async (req, res) => {
    try {
        const orders = await prisma.order.findMany({
            include: {
                user: {
                    select: { id: true, name: true, email: true },
                },
                orderItems: {  // 🔥 fixed: correct relation name
                    include: { product: true },
                },
            },
        });

        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ✅ Admin: Create a voucher
export const createVoucher = async (req, res) => {
    try {
        const { code, discount, expiresAt } = req.body;

        const voucher = await prisma.voucher.create({
            data: { code, discount, expiresAt: new Date(expiresAt) },
        });

        res.status(201).json(voucher); // 🔥 fixed: return 201
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
