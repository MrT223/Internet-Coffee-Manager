import express from "express";
import { protect } from "../middleware/auth.js";
import { authorize } from "../middleware/role.js";
import * as topupController from "../controllers/topupController.js";

const router = express.Router();

// Tất cả routes đều cần đăng nhập
router.use(protect);

// Tạo giao dịch nạp tiền mới (chuyển khoản)
router.post("/create", topupController.createTopup);

// Tạo giao dịch nạp tiền mặt (chỉ khi đang chơi tại máy)
router.post("/cash", topupController.createCashTopup);

// Xác nhận đã chuyển khoản (user tự confirm cho demo)
router.post("/confirm/:id", topupController.confirmTopup);

// Lấy lịch sử nạp tiền của user
router.get("/history", topupController.getMyTopups);

// Lấy giao dịch pending hiện tại của user
router.get("/pending", topupController.getPendingTopup);

// Hủy giao dịch (user)
router.delete("/:id", topupController.cancelTopup);

// =====================================================
// ADMIN ROUTES (chỉ admin/staff)
// =====================================================

// Lấy tất cả giao dịch nạp tiền
router.get("/admin/all", authorize([1, 2]), topupController.getAllTopups);

// Lấy các giao dịch tiền mặt đang chờ duyệt
router.get("/admin/pending-cash", authorize([1, 2]), topupController.getPendingCashTopups);

// Admin xác nhận giao dịch tiền mặt
router.post("/admin/confirm/:id", authorize([1, 2]), topupController.adminConfirmCashTopup);

// Admin từ chối giao dịch tiền mặt
router.post("/admin/reject/:id", authorize([1, 2]), topupController.adminRejectCashTopup);

export default router;
