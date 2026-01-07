import express from "express";
import { protect } from "../middleware/auth.js";
import * as topupController from "../controllers/topupController.js";

const router = express.Router();

// Tất cả routes đều cần đăng nhập
router.use(protect);

// Tạo giao dịch nạp tiền mới (chuyển khoản)
router.post("/create", topupController.createTopup);

// Tạo giao dịch nạp tiền mặt (chỉ khi đang chơi tại máy)
router.post("/cash", topupController.createCashTopup);

// Xác nhận đã chuyển khoản (cho demo)
router.post("/confirm/:id", topupController.confirmTopup);

// Lấy lịch sử nạp tiền
router.get("/history", topupController.getMyTopups);

// Lấy giao dịch pending hiện tại
router.get("/pending", topupController.getPendingTopup);

// Hủy giao dịch
router.delete("/:id", topupController.cancelTopup);

export default router;
