import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const login = async (req, res) => {
  const { user_name, password } = req.body;

  try {
    const user = await User.findOne({ where: { user_name } });

    if (!user) {
      return res.status(404).json({ message: "Tên đăng nhập không tồn tại." });
    }
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Mật khẩu không đúng." });
    }
    const payload = {
      user_id: user.user_id,
      role_id: user.role_id,
      user_name: user.user_name,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    res.json({
      token,
      user: {
        id: user.user_id,
        name: user.user_name,
        role_id: user.role_id,
        balance: user.balance,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi máy chủ nội bộ." });
  }
};
