import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const login = async (req, res) => {
  const { user_name, password } = req.body;

  try {
    const user = await User.findOne({ where: { user_name } });
    if (!user) return res.status(404).json({ message: "Sai tên đăng nhập." });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Sai mật khẩu." });

    if (user.status === "offline") {
      user.status = "online";
      await user.save();
    }
    const payload = {
      user_id: user.user_id,
      role_id: user.role_id,
      user_name: user.user_name,
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });

    res.json({
      token,
      user: {
        id: user.user_id,
        name: user.user_name,
        role_id: user.role_id,
        balance: user.balance,
        status: user.status,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi Server." });
  }
};

export const logout = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const user = await User.findByPk(userId);

    if (user) {
      user.status = "offline";
      await user.save();
    }
    res.json({ message: "Đăng xuất thành công." });
  } catch (error) {
    res.status(500).json({ message: "Lỗi đăng xuất." });
  }
};
