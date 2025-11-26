import prisma from "../src/services/prisma.js";

async function main() {
    console.log("🌱 Seeding database...");

   
    // Create categories first
const electronics = await prisma.category.create({
  data: { name: "Electronics" },
});

const fashion = await prisma.category.create({
  data: { name: "Fashion" },
});

const books = await prisma.category.create({
  data: { name: "Books" },
});

console.log("📚 Categories created");

// Now use the REAL category IDs
await prisma.product.createMany({
  data: [
    {
      name: "Apple iPhone 15",
      description: "Latest Apple flagship smartphone",
      price: 79999,
      stock: 20,
      categoryId: electronics.id,   // <-- FIX
    },
    {
      name: "Samsung Galaxy S23",
      description: "Premium Android smartphone",
      price: 69999,
      stock: 15,
      categoryId: electronics.id,   // <-- FIX
    },
    {
      name: "Nike Air Max Shoes",
      description: "Comfortable premium sports shoes",
      price: 8499,
      stock: 50,
      categoryId: fashion.id,       // <-- FIX
    },
    {
      name: "Men's Cotton T-Shirt",
      description: "Soft cotton t-shirt",
      price: 499,
      stock: 200,
      categoryId: fashion.id,       // <-- FIX
    },
    {
      name: "Atomic Habits",
      description: "Best-selling self-help book",
      price: 499,
      stock: 100,
      categoryId: books.id,         // <-- FIX
    },
  ],
});



    console.log("📦 Products created");

    // 3️⃣ Create User
    const user = await prisma.user.create({
        data: {
            name: "Johne",
            email: "john123@example.com",
            password: "hashed_password_here",
        },
    });

    console.log("👤 User created:", user.email);

const address = await prisma.address.create({
  data: {
    userId: user.id,
    label: "Home",
    name: "John Doe",          // required
    phone: "9876543210",       // required
    line1: "221B Baker Street",
    line2: "",
    city: "London",
    state: "London",
    postalCode: "NW16XE",      // correct field name
    country: "UK",
    isDefault: true
  },
});
    console.log("🏠 Address created");

    // 5️⃣ Create Cart Items (Simulating user adding items)
    await prisma.cart.create({
        data: {
            userId: user.id,
            items: {
                create: [
                    {
                        productId: 1,
                        quantity: 1
                    },
                    {
                        productId: 3,
                        quantity: 2
                    }
                ]
            }
        }
    });

    console.log("🛒 Cart filled with sample items");

    console.log("🎉 Seed completed successfully!");
}

main()
    .catch(err => {
        console.error(err);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
