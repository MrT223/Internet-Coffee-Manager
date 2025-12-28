import User from "../models/User.js";
import { deleteFromCloudinary } from "../config/cloudinary.js";

// Upload avatar cho user hiện tại
export const uploadAvatar = async (req, res) => {
  try {
    const userId = req.user.user_id;
    
    if (!req.file) {
      return res.status(400).json({ message: "Không có file được upload." });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: "User không tồn tại." });
    }

    // Xóa avatar cũ nếu có
    if (user.avatar) {
      await deleteFromCloudinary(user.avatar);
    }

    // Cập nhật avatar mới
    const avatarUrl = req.file.path;
    user.avatar = avatarUrl;
    await user.save();

    res.json({
      message: "Upload avatar thành công!",
      avatar: avatarUrl,
    });
  } catch (error) {
    console.error("Upload avatar error:", error);
    res.status(500).json({ message: "Lỗi upload avatar." });
  }
};

// Upload ảnh cho menu item
export const uploadMenuImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Không có file được upload." });
    }

    const imageUrl = req.file.path;

    res.json({
      message: "Upload ảnh thành công!",
      image_url: imageUrl,
    });
  } catch (error) {
    console.error("Upload menu image error:", error);
    res.status(500).json({ message: "Lỗi upload ảnh." });
  }
};

// Xóa ảnh (nếu cần)
export const deleteImage = async (req, res) => {
  try {
    const { image_url } = req.body;
    
    if (!image_url) {
      return res.status(400).json({ message: "Không có URL ảnh." });
    }

    await deleteFromCloudinary(image_url);
    
    res.json({ message: "Xóa ảnh thành công!" });
  } catch (error) {
    console.error("Delete image error:", error);
    res.status(500).json({ message: "Lỗi xóa ảnh." });
  }
};
