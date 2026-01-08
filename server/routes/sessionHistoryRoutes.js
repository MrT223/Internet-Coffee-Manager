import express from "express";
import { protect } from "../middleware/auth.js";
import { authorize } from "../middleware/role.js";
import * as sessionHistoryController from "../controllers/sessionHistoryController.js";

const router = express.Router();

// Tất cả routes cần đăng nhập và là admin/staff
router.use(protect, authorize([1, 2]));

// GET /session-history - Lấy tất cả lịch sử (có filter)
router.get("/", sessionHistoryController.getAllSessionHistory);

// GET /session-history/stats - Thống kê tổng quan
router.get("/stats", sessionHistoryController.getSessionStats);

// GET /session-history/user/:userId - Lịch sử theo user
router.get("/user/:userId", sessionHistoryController.getUserSessionHistory);

export default router;
