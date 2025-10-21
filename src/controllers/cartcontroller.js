import prisma from "../services/prisma.js";

// ✅ Get all cart items for a user
export const getCart = async (req, res) => {
    try {
        const userId = req.user.id;

        const cart = await prisma.cartItem.findMany({
            where: { userId },
            include: { product: true },
        });

        res.json(cart);
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch cart", error: err.message });
    }
};

// ✅ Add product to cart
export const addToCart = async (req, res) => {
    try {
        const userId = req.user.id;
        const { productId, quantity } = req.body;

        if (!productId || !quantity || quantity <= 0) {
            return res.status(400).json({ message: "Invalid product or quantity" });
        }

        // Check product exists
        const product = await prisma.product.findUnique({ where: { id: productId } });
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        // Check if already in cart
        const existingItem = await prisma.cartItem.findFirst({
            where: { userId, productId },
        });

        let cartItem;
        if (existingItem) {
            cartItem = await prisma.cartItem.update({
                where: { id: existingItem.id },
                data: { quantity: existingItem.quantity + quantity },
            });
        } else {
            cartItem = await prisma.cartItem.create({
                data: { userId, productId, quantity },
            });
        }

        res.json(cartItem);
    } catch (err) {
        res.status(500).json({ message: "Failed to add to cart", error: err.message });
    }
};

// ✅ Remove item from cart
export const removeFromCart = async (req, res) => {
    try {
        const userId = req.user.id;
        const { itemId } = req.params;

        const item = await prisma.cartItem.findUnique({
            where: { id: itemId }, // ✅ fixed (no parseInt)
        });

        if (!item || item.userId !== userId) {
            return res.status(404).json({ message: "Cart item not found" });
        }

        await prisma.cartItem.delete({
            where: { id: itemId },
        });

        res.json({ message: "Item removed from cart" });
    } catch (err) {
        res.status(500).json({ message: "Failed to remove from cart", error: err.message });
    }
};