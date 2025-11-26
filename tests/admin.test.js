import request from "supertest";
import app from "../src/index.js";
import prisma from "../src/services/prisma.js";

let adminToken;

describe("🧑‍💼 Admin Endpoints", () => {
    beforeAll(async () => {
        await prisma.$connect();

        // Create a dummy admin
        const res = await request(app)
            .post("/api/admin/register-admin")
            .send({
                name: "Admin One",
                email: "admin1@example.com",
                password: "Admin@123",
            });

        expect(res.statusCode).toBe(201);

        const login = await request(app)
            .post("/api/users/login")
            .send({ email: "admin1@example.com", password: "Admin@123" });

        // 🔥 FIX: correct token key
        adminToken = login.body.accessToken;
        expect(adminToken).toBeDefined();
    });

    afterAll(async () => {
        await prisma.$disconnect();
    });

    it("should create a voucher 🎟️", async () => {
        const res = await request(app)
            .post("/api/admin/voucher")
            .set("Authorization", `Bearer ${adminToken}`)
            .send({
                code: "DISCOUNT10",
                discount: 10,
                expiresAt: "2030-01-01T00:00:00.000Z",
            });

        expect(res.statusCode).toBe(201);
        expect(res.body.code).toBe("DISCOUNT10");
    });

    it("should fetch all orders 📦", async () => {
        const res = await request(app)
            .get("/api/admin/get-all-orders")
            .set("Authorization", `Bearer ${adminToken}`);

        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });
});
