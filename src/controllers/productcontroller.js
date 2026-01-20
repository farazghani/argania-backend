import prisma from "../services/prisma.js";
import {
    createProductSchema,
    updateProductSchema,
    productIdSchema,
} from "../validations/productvalidation.js";

// ✅ Get all products
export const getProducts = async (req, res) => {
    try {
       const products = await prisma.product.findMany({
        where: { isActive: true }
        });
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ✅ Get product by ID
export const getProductById = async (req, res) => {
    try {
        const { id } = productIdSchema.parse(req.params);

        const product = await prisma.product.findUnique({ where: { id } });

        if (!product) {
            return res.status(404).json({ error: "Product not found" });
        }
        res.json(product);
    } catch (error) {
        if (error.name === "ZodError") {
            return res.status(400).json({ errors: error.errors });
        }
        res.status(500).json({ error: error.message });
    }
};

// ✅ Add product
export const addProduct = async (req, res) => {
    try {
        const validatedData = createProductSchema.parse(req.body);
       
        console.log(validatedData);
        const product = await prisma.product.create({
            data: validatedData,
        });

        res.status(201).json(product);
    } catch (error) {
        if (error.name === "ZodError") {
            return res.status(400).json({ errors: error.errors });
        }
        res.status(500).json({ error: error.message });
    }
};

// ✅ Update product
export const updateProduct = async (req, res) => {
    try {
        const { id } = productIdSchema.parse(req.params);
        const validatedData = updateProductSchema.parse(req.body);

        const product = await prisma.product.update({
            where: { id },
            data: validatedData,
        });

        res.json(product);
    } catch (error) {
        if (error.name === "ZodError") {
            return res.status(400).json({ errors: error.errors });
        }
        res.status(500).json({ error: error.message });
    }
};

// ✅ Delete product
export const deleteProduct = async (req, res) => {
  try {
    const { id } = productIdSchema.parse(req.params);

    await prisma.product.update({
      where: { id },
      data: { isActive: false },
    });

    res.json({ message: "Product archived successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
};