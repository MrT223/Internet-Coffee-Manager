import express from "express";
import { protect } from "../middleware/auth.js";
import { authorize } from "../middleware/role.js";
import * as computerController from "../controllers/computerController.js";

const router = express.Router();

router.get("/", protect, computerController.getAllComputers);

router.post("/:id/book", protect, computerController.bookComputer);

router.post("/", protect, authorize([1, 2]), computerController.createComputer);
router.put(
  "/:id",
  protect,
  authorize([1, 2]),
  computerController.updateComputer
);
router.post(
  "/start-session",
  protect,
  authorize([1, 2]),
  computerController.startSession
);

export default router;
