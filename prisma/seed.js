import prisma from "../src/services/prisma.js";
import bcrypt from "bcrypt";

async function main() {
    const existingAdmin = await prisma.user.findUnique({
        where: { email: "admin@example.com" },
    });

    if (!existingAdmin) {
        const hashedPassword = await bcrypt.hash("adminpassword", 10);

        await prisma.user.create({
            data: {
                name: "Super Admin",
                email: "admin@example.com",
                password: hashedPassword,
                role: "ADMIN",
            },
        });

        console.log("✅ Admin created: admin@example.com / adminpassword");
    } else {
        console.log("ℹ️ Admin already exists.");
    }
}

main()
    .then(() => process.exit(0))
    .catch((e) => {
        console.error(e);
        process.exit(1);
    });