import express from "express";
import {
  getAllSettings,
  getBookingTimeout,
  updateSetting,
} from "../controllers/settingsController.js";
import { protect } from "../middleware/auth.js";
import { authorize } from "../middleware/role.js";

const router = express.Router();

// Public - lấy booking timeout
router.get("/booking-timeout", getBookingTimeout);

// Admin only (role_id = 1)
router.get("/", protect, authorize([1]), getAllSettings);
router.put("/:key", protect, authorize([1]), updateSetting);

export default router;
