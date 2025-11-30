import User from "../models/User.js";

// Lấy danh sách tất cả người dùng
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ["password"] }, // Không trả về mật khẩu vì lý do bảo mật
      order: [["user_id", "ASC"]], // Sắp xếp theo ID tăng dần
    });
    res.json(users);
  } catch (error) {
    console.error("Get Users Error:", error);
    res.status(500).json({ message: "Lỗi máy chủ khi lấy danh sách user." });
  }
};
