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

// ✅ Add item to cart
export const addToCart = async (req, res) => {
    try {
        const userId = req.user.id;
        const { productId, quantity } = req.body;

        if (!productId || !quantity) {
            return res.status(400).json({ message: "productId and quantity are required" });
        }

        if (quantity < 1) {
            return res.status(400).json({ message: "Quantity must be at least 1" });
        }

        // Check if item already exists in cart
        const existingItem = await prisma.cartItem.findFirst({
            where: {
                userId,
                productId,
            },
        });

        let cartItem;

        if (existingItem) {
            // Update quantity if item exists
            cartItem = await prisma.cartItem.update({
                where: { id: existingItem.id },
                data: {
                    quantity: existingItem.quantity + quantity,
                },
                include: { product: true },
            });
        } else {
            // Create new cart item
            cartItem = await prisma.cartItem.create({
                data: {
                    userId,
                    productId,
                    quantity,
                },
                include: { product: true },
            });
        }

        res.status(201).json(cartItem);
    } catch (err) {
        res.status(500).json({ message: "Unable to add to cart", error: err.message });
    }
};

// ✅ Update cart item quantity
export const updateCart = async (req, res) => {
    try {
        const userId = req.user.id;
        const { cartItemId } = req.params;
        const { quantity } = req.body;

        if (!quantity || quantity < 1) {
            return res.status(400).json({ message: "Quantity must be at least 1" });
        }

        // Check if cart item exists and belongs to user
        const cartItem = await prisma.cartItem.findUnique({
            where: { id: cartItemId },
        });

        if (!cartItem) {
            return res.status(404).json({ message: "Cart item not found" });
        }

        if (cartItem.userId !== userId) {
            return res.status(403).json({ message: "Unauthorized to update this cart item" });
        }

        // Update the quantity
        const updatedCartItem = await prisma.cartItem.update({
            where: { id: cartItemId },
            data: { quantity },
            include: { product: true },
        });

        res.json(updatedCartItem);
    } catch (err) {
        res.status(500).json({ message: "Failed to update cart", error: err.message });
    }
};

// ✅ Remove item from cart
export const removeFromCart = async (req, res) => {
    try {
        const userId = req.user.id;
        const { itemId } = req.params;

        const item = await prisma.cartItem.findUnique({
            where: { id: itemId },
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

// ✅ Clear entire cart for a user
export const clearCart = async (req, res) => {
    try {
        const userId = req.user.id;

        await prisma.cartItem.deleteMany({
            where: { userId },
        });

        res.json({ message: "Cart cleared successfully" });
    } catch (err) {
        res.status(500).json({ message: "Failed to clear cart", error: err.message });
    }
};

// ✅ Get cart summary (total items and total quantity)
export const getCartSummary = async (req, res) => {
    try {
        const userId = req.user.id;

        const cart = await prisma.cartItem.findMany({
            where: { userId },
            include: { product: true },
        });

        const totalItems = cart.length;
        const totalQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);

        res.json({
            totalItems,
            totalQuantity,
            items: cart,
        });
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch cart summary", error: err.message });
    }
};