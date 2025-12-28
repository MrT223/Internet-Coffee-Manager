import express from "express";
import { protect } from "../middleware/auth.js";
import { authorize } from "../middleware/role.js";
import { uploadAvatar, uploadMenuItem } from "../config/cloudinary.js";
import * as uploadController from "../controllers/uploadController.js";

const router = express.Router();

const uploadWrapper = (uploadMiddleware) => (req, res, next) => {
  uploadMiddleware(req, res, (err) => {
    if (err) {
      console.error("❌ UPLOAD ERROR:", err); 
      
      return res.status(400).json({ 
        message: "Lỗi upload ảnh: " + (err.message || "Lỗi không xác định"),
        detail: err 
      });
    }
    next();
  });
};

// Route Upload Avatar
router.post(
  "/avatar",
  protect,
  uploadWrapper(uploadAvatar.single("avatar")), 
  uploadController.uploadAvatar
);

// Route Upload Menu Image
router.post(
  "/menu-image",
  protect,
  authorize([1, 2]),
  uploadWrapper(uploadMenuItem.single("image")), 
  uploadController.uploadMenuImage
);

// Route Xóa ảnh
router.delete(
  "/image",
  protect,
  authorize([1, 2]),
  uploadController.deleteImage
);

export default router;