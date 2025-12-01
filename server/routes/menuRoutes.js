import express from "express";
import { protect } from "../middleware/auth.js";
import { authorize } from "../middleware/role.js";
import * as menuController from "../controllers/menuController.js";

const router = express.Router();

router.get("/", protect, menuController.getMenu);

router.post("/", protect, authorize([1, 2]), menuController.addMenuItem);

router.put("/:id", protect, authorize([1, 2]), menuController.updateMenuItem);

router.delete(
  "/:id",
  protect,
  authorize([1, 2]),
  menuController.deleteMenuItem
);

export default router;
