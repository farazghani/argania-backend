import { z } from "zod";

export const addressSchema = z.object({
    label: z.string().optional(),
    name: z.string().min(1, "Name is required"),
    phone: z.string().min(7, "Phone number must be valid"), // can refine with regex
    line1: z.string().min(1, "Address line 1 is required"),
    line2: z.string().optional(),
    city: z.string().min(1, "City is required"),
    state: z.string().min(1, "State is required"),
    postalCode: z.string().min(3, "Postal code must be valid"),
    country: z.string().min(1, "Country is required"),
    isDefault: z.boolean().optional(),
});

export const updateAddressSchema = addressSchema.partial();