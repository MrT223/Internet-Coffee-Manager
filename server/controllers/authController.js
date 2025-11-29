const User = require("./models/User"); // Mô hình Sequelize
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.login = async (req, res) => {
  const { user_name, password } = req.body;

  try {
    // 1. Tìm người dùng theo user_name
    const user = await User.findOne({ where: { user_name } });

    if (!user) {
      return res.status(404).json({ message: "Tên đăng nhập không tồn tại." });
    }

    // 2. So sánh mật khẩu
    // Giả sử mật khẩu trong DB đã được hash
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Mật khẩu không đúng." });
    }

    // 3. Tạo JWT
    const payload = {
      user_id: user.user_id,
      role_id: user.role_id,
      user_name: user.user_name,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    // 4. Trả về token và thông tin cơ bản
    res.json({
      token,
      user: {
        id: user.user_id,
        name: user.user_name,
        role_id: user.role_id,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi máy chủ nội bộ." });
  }
};

// 3. Tạo JWT (JSON Web Token)
const payload = {
  user_id: user.user_id,
  user_name: user.user_name,
  // Lấy role_id để phân quyền
  role_id: user.role_id,
};

const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });

// 4. Trả về token và thông tin user (bao gồm role_id)
res.json({
  token,
  user: {
    id: user.user_id,
    name: user.user_name,
    role_id: user.role_id,
  },
});
