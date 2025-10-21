import { z } from "zod";

export const orderSchema = z.object({
    userId: z.string().cuid(),
    addressId: z.string().cuid(),
    items: z.array(z.object({
        productId: z.string().cuid(),
        quantity: z.number().min(1)
    })).min(1),
    voucherCode: z.string().optional(),
    total: z.number().min(0),
    discount: z.number().min(0).optional(),
    finalTotal: z.number().min(0),
    status: z.enum(["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"]).optional(),
    createdAt: z.date().optional(),
    updatedAt: z.date().optional()
})

export const updateOrderSchema = orderSchema.partial();
