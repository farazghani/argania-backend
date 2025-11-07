import request from "supertest";
import app from "../src/index.js";
import prisma from "../src/services/prisma.js";

describe("🧪 Auth Flow", () => {
    const userData = {
        name: "Test User",
        email: "testuser@example.com",
        password: "password123",
    };

    let accessToken;

    beforeAll(async () => {
        await prisma.user.deleteMany();
    });

    test("Register new user", async () => {
        const res = await request(app)
            .post("/api/users/register")
            .send(userData);

        expect(res.statusCode).toBe(201);
        expect(res.body.user.email).toBe(userData.email);
    });

    test("Login user", async () => {
        const res = await request(app)
            .post("/api/users/login")
            .send({
                email: userData.email,
                password: userData.password,
            });

        expect(res.statusCode).toBe(200);
        expect(res.body.accessToken).toBeDefined();

        accessToken = res.body.accessToken;
    });

    test("Get user profile (auth required)", async () => {
        const res = await request(app)
            .get("/api/users/me")
            .set("Authorization", `Bearer ${accessToken}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.email).toBe(userData.email);
    });
});
