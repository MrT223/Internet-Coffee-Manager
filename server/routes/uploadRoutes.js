import express from "express";
import { protect } from "../middleware/auth.js";
import { authorize } from "../middleware/role.js";
import { uploadAvatar, uploadMenuItem } from "../config/cloudinary.js";
import * as uploadController from "../controllers/uploadController.js";

const router = express.Router();

// Upload avatar (user đã đăng nhập)
router.post(
  "/avatar",
  protect,
  uploadAvatar.single("avatar"),
  uploadController.uploadAvatar
);

// Upload ảnh cho menu item (admin/staff only)
router.post(
  "/menu-image",
  protect,
  authorize([1, 2]),
  uploadMenuItem.single("image"),
  uploadController.uploadMenuImage
);

// Xóa ảnh (admin/staff only)
router.delete(
  "/image",
  protect,
  authorize([1, 2]),
  uploadController.deleteImage
);

export default router;
