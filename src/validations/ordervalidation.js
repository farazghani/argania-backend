import { z } from "zod";

export const orderSchema = z.object({
    addressId: z.string().cuid(),
    items: z.array(
        z.object({
            productId: z.string().cuid(),
            quantity: z.number().min(1),
        })
    ).min(1),
    voucherCode: z.string().optional(),
});

export const updateOrderSchema = z.object({
    status: z.enum(["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"]).optional(),
});



