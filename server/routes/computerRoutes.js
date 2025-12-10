import express from "express";
import { protect } from "../middleware/auth.js";
import { authorize } from "../middleware/role.js";
import * as computerController from "../controllers/computerController.js";

const router = express.Router();

router.get("/", computerController.getAllComputers);

router.post("/", protect, authorize([1, 2]), computerController.createComputer);

router.post("/:id/book", protect, computerController.bookComputer);

router.post(
  "/start-session",
  protect,
  authorize([1, 2, 3]),
  computerController.startSession
);

router.post(
  "/:id/force-logout",
  protect,
  authorize([1, 2]),
  computerController.forceLogout
);

router.post(
  "/:id/refund",
  protect,
  authorize([1, 2]),
  computerController.refundBooking
);

router.delete("/:id", protect, authorize([1, 2]), computerController.deleteComputer);

router.put("/:id", protect, authorize([1, 2]), computerController.updateComputer);

export default router;