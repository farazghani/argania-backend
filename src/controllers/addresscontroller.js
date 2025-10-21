import prisma from "../services/prisma.js";
import { addressSchema, updateAddressSchema } from "../validations/addressvalidation.js";

// ✅ Create Address
export const createAddress = async (req, res) => {
    try {
        const parsed = addressSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ errors: parsed.error.errors });
        }

        const userId = req.user.id;
        const data = parsed.data;

        if (data.isDefault) {
            await prisma.address.updateMany({
                where: { userId, isDefault: true },
                data: { isDefault: false },
            });
        }

        const address = await prisma.address.create({
            data: {
                userId,
                ...data,
                isDefault: !!data.isDefault,
            },
        });

        res.status(201).json(address);
    } catch (error) {
        console.error("createAddress:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

// ✅ Get all addresses for logged-in user
export const getAddresses = async (req, res) => {
    try {
        const userId = req.user.id;
        const addresses = await prisma.address.findMany({
            where: { userId },
            orderBy: { isDefault: "desc" },
        });
        res.json(addresses);
    } catch (error) {
        console.error("getAddresses:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

// ✅ Update Address
export const updateAddress = async (req, res) => {
    try {
        const parsed = updateAddressSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ errors: parsed.error.errors });
        }

        const userId = req.user.id;
        const { id } = req.params;
        const data = parsed.data;

        const existing = await prisma.address.findUnique({ where: { id } });
        if (!existing || existing.userId !== userId) {
            return res.status(404).json({ message: "Address not found" });
        }

        if (data.isDefault) {
            await prisma.address.updateMany({
                where: { userId, isDefault: true },
                data: { isDefault: false },
            });
        }

        const updated = await prisma.address.update({
            where: { id },
            data,
        });

        res.json(updated);
    } catch (error) {
        console.error("updateAddress:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

// ✅ Delete Address
export const deleteAddress = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;

        const existing = await prisma.address.findUnique({ where: { id } });
        if (!existing || existing.userId !== userId) {
            return res.status(404).json({ message: "Address not found" });
        }

        await prisma.address.delete({ where: { id } });
        res.json({ message: "Address deleted" });
    } catch (error) {
        console.error("deleteAddress:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

// ✅ Set Default Address
export const setDefaultAddress = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;

        const existing = await prisma.address.findUnique({ where: { id } });
        if (!existing || existing.userId !== userId) {
            return res.status(404).json({ message: "Address not found" });
        }

        await prisma.address.updateMany({
            where: { userId, isDefault: true },
            data: { isDefault: false },
        });

        const updated = await prisma.address.update({
            where: { id },
            data: { isDefault: true },
        });

        res.json(updated);
    } catch (error) {
        console.error("setDefaultAddress:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};
