// tests/product.test.js
import request from "supertest";
import app from "../src/index.js";
import prisma from "../src/services/prisma.js";
import bcrypt from "bcrypt";

let adminToken;
let createdProductId;

describe("🧪 Product API Tests (Admin Routes)", () => {
    beforeAll(async () => {
        await prisma.$connect();

        // Seed admin if not exists
        const existingAdmin = await prisma.user.findUnique({
            where: { email: "admin@example.com" },
        });

        if (!existingAdmin) {
            const hashedPassword = await bcrypt.hash("Admin@123", 10);
            await prisma.user.create({
                data: {
                    name: "Admin One",
                    email: "admin@example.com",
                    password: hashedPassword,
                    role: "ADMIN",
                },
            });
        }

        // Login as admin to get token
        const loginRes = await request(app)
            .post("/api/users/login")
            .send({ email: "admin@example.com", password: "Admin@123" });

        adminToken = loginRes.body.accessToken;
        if (!adminToken) throw new Error("Cannot get admin token");

        // Clean products before testing
        await prisma.product.deleteMany();
    });

    afterAll(async () => {
        await prisma.$disconnect();
    });

    test("POST /api/products → create a new product (admin only)", async () => {
        const res = await request(app)
            .post("/api/products")
            .set("Authorization", `Bearer ${adminToken}`)
            .send({
                name: "Test Cotton T-Shirt",
                description: "Soft organic cotton tee for everyday comfort",
                price: 499.99,
                stock: 50,
                imageUrl: "https://example.com/tshirt.jpg",

            });

        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty("id");
        expect(res.body.name).toBe("Test Cotton T-Shirt");

        createdProductId = res.body.id;
    });

    test("GET /api/products → return all products", async () => {
        const res = await request(app).get("/api/products");
        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBeGreaterThan(0);
    });

    test("GET /api/products/:id → return product by ID", async () => {
        const res = await request(app).get(`/api/products/${createdProductId}`);
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty("id", createdProductId);
        expect(res.body).toHaveProperty("name");
    });

    test("PATCH /api/products/:id → update product (admin only)", async () => {
        const res = await request(app)
            .patch(`/api/products/${createdProductId}`)
            .set("Authorization", `Bearer ${adminToken}`)
            .send({
                name: "Updated Cotton T-Shirt",
                price: 449.99,
                stock: 30,
            });

        expect(res.statusCode).toBe(200);
        expect(res.body.name).toBe("Updated Cotton T-Shirt");
        expect(res.body.price).toBe(449.99);
    });

    test("DELETE /api/products/:id → delete product (admin only)", async () => {
        const res = await request(app)
            .delete(`/api/products/${createdProductId}`)
            .set("Authorization", `Bearer ${adminToken}`);

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty("message", "Product deleted successfully");
    });

    test("GET /api/products/:id → return 404 for deleted product", async () => {
        const res = await request(app).get(`/api/products/${createdProductId}`);
        expect(res.statusCode).toBe(404);
    });
});
