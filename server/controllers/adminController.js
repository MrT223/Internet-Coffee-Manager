import User from "../models/User.js";
import bcrypt from "bcrypt";

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

export const createUser = async (req, res) => {
  const { user_name, password, role_id } = req.body;
  try {
    const exists = await User.findOne({ where: { user_name } });
    if (exists)
      return res.status(400).json({ message: "Tên đăng nhập đã tồn tại." });

    if (parseInt(role_id) === 1) {
      return res.status(400).json({ message: "Không thể tạo thêm Admin." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      user_name,
      password: hashedPassword,
      role_id: role_id || 3,
      balance: 0,
    });

    res
      .status(201)
      .json({ message: "Tạo tài khoản thành công!", user: newUser });
  } catch (error) {
    res.status(500).json({ message: "Lỗi tạo tài khoản." });
  }
};

export const deleteUser = async (req, res) => {
  const { id } = req.params;

  if (parseInt(id) === 1) {
    return res.status(403).json({ message: "Không thể xóa Admin gốc!" });
  }

  try {
    await User.destroy({ where: { user_id: id } });
    res.json({ message: "Đã xóa tài khoản." });
  } catch (error) {
    res.status(500).json({ message: "Lỗi xóa tài khoản." });
  }
};

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

export const changeUserRole = async (req, res) => {
  const { id } = req.params;
  const { role_id } = req.body;

  if (parseInt(id) === 1) {
    return res
      .status(403)
      .json({ message: "Không thể thay đổi quyền của Admin gốc." });
  }

  if (parseInt(role_id) === 1) {
    return res
      .status(400)
      .json({ message: "Chỉ có duy nhất 1 Admin. Không thể cấp quyền này." });
  }

  try {
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: "Người dùng không tồn tại." });
    }

    user.role_id = parseInt(role_id);
    await user.save();

    res.json({ message: `Đã cập nhật quyền thành công!` });
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi đổi quyền." });
  }
};
