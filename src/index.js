import express from "express";
import bodyParser from "body-parser";
import { PrismaClient } from "@prisma/client";
import productRoutes from "./routes/productRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import cartRoutes from "./routes/cartroutes.js";
import addressRoutes from "./routes/addressroutes.js";
import adminroutes from "./routes/adminroutes.js";
import helmet from "helmet";
import rateLimit from "express-rate-limit"; 
import webhookroutes from "./routes/webhookroutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import shippingroute from "./routes/shippingroute.js"
import cors from "cors";

const app = express();

app.use(cors({
  origin: "http://localhost:8080",
  credentials: true
}));


app.use(express.json());                 
app.use(express.urlencoded({ extended: true }));

// 1️⃣ FIX: Allow ngrok + proxies
app.set("trust proxy", 1);

app.use("/api/payment", webhookroutes);
// 1️⃣ Set security headers
app.use(helmet());

// 2️⃣ Enable CORS for your frontend domain




// 4️⃣ Limit repeated requests (brute-force / DoS protection)
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 mins
    max: 100, // limit each IP to 100 requests
    message: "Too many requests, please try again later.",
});


app.use(limiter);

app.use(bodyParser.json());
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/users", userRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/admin", adminroutes);
app.use("/api/addresses", addressRoutes);
app.use("/api/payment" , paymentRoutes);
app.use("/api/shipping" , shippingroute);

app.get("/", (req, res) => {
    res.send("API running ✅");
});

export default app;


