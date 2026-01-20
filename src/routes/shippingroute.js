import express from "express";
import { getDeliveryCharge } from "../controllers/shipping.js";

const router = express.Router();


router.post('/rate' , getDeliveryCharge);


export default router;
