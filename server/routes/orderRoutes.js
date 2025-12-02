import express from "express";
import { protect } from "../middleware/auth.js";
import * as orderController from "../controllers/orderController.js";

const router = express.Router();

router.post("/", protect, orderController.placeOrder);

router.get("/my-orders", protect, orderController.getMyOrders);

export default router;
