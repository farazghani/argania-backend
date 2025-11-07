import request from "supertest";
import app from "../src/index.js";
import prisma from "../src/services/prisma.js";
import bcrypt from "bcrypt";

let userToken, adminToken, userId, productId, addressId, orderId;

describe("🧪 Order Endpoints Flow", () => {
    beforeAll(async () => {
        // 🧹 Clean DB safely (delete child tables first to avoid FK errors)
        await prisma.orderItem.deleteMany();
        await prisma.order.deleteMany();
        await prisma.product.deleteMany();
        await prisma.category.deleteMany();
        await prisma.address.deleteMany();
        await prisma.user.deleteMany();

        // 👤 Register normal user
        await request(app)
            .post("/api/users/register")
            .send({ name: "naman", email: "testnaman@example.com", password: "password123" });

        const loginUser = await request(app)
            .post("/api/users/login")
            .send({ email: "testnaman@example.com", password: "password123" });

        userToken = loginUser.body.accessToken;
        userId = loginUser.body.user.id;
        if (!userToken) throw new Error("Cannot get user token");

        // 👑 Register admin user manually in DB
        const hashedPassword = await bcrypt.hash("Admin@123", 10);
        await prisma.user.create({
            data: {
                name: "Admin One",
                email: "admin@example.com",
                password: hashedPassword,
                role: "ADMIN",
            },
        });

        const loginRes = await request(app)
            .post("/api/users/login")
            .send({ email: "admin@example.com", password: "Admin@123" });

        adminToken = loginRes.body.accessToken;
        if (!adminToken) throw new Error("Cannot get admin token");

        // 🏷️ Create category
        const cat = await prisma.category.create({ data: { name: "Clothing" } });

        // 👕 Create product
        const prod = await prisma.product.create({
            data: {
                name: "Premium Cotton T-Shirt",
                description: "Soft & durable",
                price: 49.99,
                stock: 10,
                imageUrl: "https://dummyimage.com/tshirt.png",
                categoryId: cat.id,
            },
        });
        productId = prod.id;

        // 📍 Create user address
        const addr = await prisma.address.create({
            data: {
                userId,
                name: "Test User",
                phone: "9876543210",
                line1: "123 Main St",
                line2: "Apt 4B",
                city: "Delhi",
                state: "Delhi",
                postalCode: "110001",
                country: "India",
                isDefault: true,
            },
        });
        addressId = addr.id;
    });

    it("should create an order successfully ✅", async () => {
        const res = await request(app)
            .post("/api/orders")
            .set("Authorization", `Bearer ${userToken}`)
            .send({
                addressId,
                items: [{ productId, quantity: 2 }],
            });

        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty("id");
        orderId = res.body.id;
    });

    it("should fetch all orders for user 🧾", async () => {
        const res = await request(app)
            .get("/api/orders")
            .set("Authorization", `Bearer ${userToken}`);

        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBeGreaterThan(0);
    });

    it("should fetch single order by ID 🔍", async () => {
        const res = await request(app)
            .get(`/api/orders/${orderId}`)
            .set("Authorization", `Bearer ${userToken}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.id).toBe(orderId);
    });

    it("should update order status (admin only) 🚀", async () => {
        const res = await request(app)
            .patch(`/api/orders/${orderId}/status`) // ✅ correct route
            .set("Authorization", `Bearer ${adminToken}`)
            .send({ status: "SHIPPED" });

        expect(res.statusCode).toBe(200);
        expect(res.body.status).toBe("SHIPPED");
    });

    it("should delete order (admin only) 🗑️", async () => {
        const res = await request(app)
            .delete(`/api/orders/${orderId}`) // ✅ admin-only
            .set("Authorization", `Bearer ${adminToken}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.message).toBe("Order deleted successfully");
    });

    afterAll(async () => {
        // cleanup
        await prisma.orderItem.deleteMany();
        await prisma.order.deleteMany();
        await prisma.product.deleteMany();
        await prisma.category.deleteMany();
        await prisma.address.deleteMany();
        await prisma.user.deleteMany();
        await prisma.$disconnect();
    });
});
