import express from "express";
import { registerAdmin, getAllOrders, createVoucher } from "../controllers/admincontroller.js";
import { isAdmin } from "../middlewares/auth.js";



const router = express.Router();

router.post("/register-admin", registerAdmin);
router.post("/getAllorders", isAdmin, getAllOrders);
router.post("/create-voucher", isAdmin, createVoucher);


export default router;