import dotenv from "dotenv";
import prisma from "../src/services/prisma.js";

dotenv.config({ path: ".env" }); // separate test DB

beforeAll(async () => {
    await prisma.$connect();
});

afterAll(async () => {
    await prisma.$disconnect();
});