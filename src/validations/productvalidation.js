
import { z } from "zod";

// ✅ Schema for creating a new product
export const createProductSchema = z.object({
    name: z.string().min(1, "Name is required"),
    description: z.string().optional(),
    price: z.number().positive("Price must be greater than 0"),
    stock: z.number().int().nonnegative("Stock must be 0 or greater"),
    imageUrl: z.string().url("Invalid image URL").optional(),
    categoryId: z.string().cuid("Invalid category ID").optional(),
});

// ✅ Schema for updating an existing product
export const updateProductSchema = z.object({
    name: z.string().min(1).optional(),
    description: z.string().optional(),
    price: z.number().positive().optional(),
    stock: z.number().int().nonnegative().optional(),
    imageUrl: z.string().url().optional(),
    categoryId: z.string().cuid().optional(),
});

// ✅ Schema for product ID param (used in get/update/delete)
export const productIdSchema = z.object({
    id: z.string().cuid("Invalid product ID"),
});