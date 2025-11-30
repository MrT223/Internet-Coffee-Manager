import User from "../models/User.js";
import bcrypt from "bcrypt";

// 1. Lấy danh sách user
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ["password"] },
      order: [["user_id", "ASC"]],
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Lỗi lấy danh sách user." });
  }
};

// 2. Tạo tài khoản mới (Create)
export const createUser = async (req, res) => {
  const { user_name, password, role_id } = req.body;
  try {
    // Kiểm tra trùng tên
    const exists = await User.findOne({ where: { user_name } });
    if (exists)
      return res.status(400).json({ message: "Tên đăng nhập đã tồn tại." });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      user_name,
      password: hashedPassword,
      role_id: role_id || 3, // Mặc định là User
      balance: 0,
    });

    res
      .status(201)
      .json({ message: "Tạo tài khoản thành công!", user: newUser });
  } catch (error) {
    console.error(error); // Log lỗi ra terminal để dễ debug
    res.status(500).json({ message: "Lỗi tạo tài khoản." });
  }
};

// 3. Xóa tài khoản (Delete)
export const deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    await User.destroy({ where: { user_id: id } });
    res.json({ message: "Đã xóa tài khoản." });
  } catch (error) {
    res.status(500).json({ message: "Lỗi xóa tài khoản." });
  }
};

// 4. Nạp tiền (Top-up Balance)
export const topUpBalance = async (req, res) => {
  const { id } = req.params;
  const { amount } = req.body;

  try {
    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ message: "User không tồn tại." });

    user.balance = parseInt(user.balance) + parseInt(amount);
    await user.save();

    res.json({ message: `Đã nạp ${amount} VNĐ. Số dư mới: ${user.balance}` });
  } catch (error) {
    res.status(500).json({ message: "Lỗi nạp tiền." });
  }
};
