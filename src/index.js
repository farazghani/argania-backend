import express from "express";
import bodyParser from "body-parser";
import { PrismaClient } from "@prisma/client";
import productRoutes from "./routes/productRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import cartRoutes from "./routes/cartroutes.js";
import addressRoutes from "./routes/addressroutes.js";
import adminroutes from "./routes/adminroutes.js";

const app = express();
const prisma = new PrismaClient();



app.use(bodyParser.json());
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/users", userRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/admin", adminroutes);
app.use("/api/addresses", addressRoutes);




app.listen(3000, () => { console.log("Server is running on port 3000") });


