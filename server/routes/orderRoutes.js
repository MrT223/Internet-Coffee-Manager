import express from "express";
import { protect } from "../middleware/auth.js";
import { authorize } from "../middleware/role.js"; // <--- Import thêm authorize
import * as orderController from "../controllers/orderController.js";

const router = express.Router();

router.post("/", protect, orderController.placeOrder);
router.get("/my-orders", protect, orderController.getMyOrders);

router.get("/all", protect, authorize([1, 2]), orderController.getAllOrders);
router.put(
  "/:id",
  protect,
  authorize([1, 2]),
  orderController.updateOrderStatus
);

export default router;
