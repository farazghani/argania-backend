import express from "express";
import {
    createAddress,
    getAddresses,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
} from "../controllers/addresscontroller.js";
import { authMiddleware } from "../middlewares/auth.js";

const router = express.Router();

router.use(authMiddleware); // all routes require auth

router.post("/", createAddress);
router.get("/", getAddresses);
router.put("/:id", updateAddress);
router.delete("/:id", deleteAddress);
router.patch("/:id/default", setDefaultAddress);

export default router;