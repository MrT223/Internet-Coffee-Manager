import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import sequelize from "./config/database.js";

import Role from "./models/Role.js";
import User from "./models/User.js";
import Computer from "./models/Computer.js";
import MenuItem from "./models/MenuItem.js";
import FoodOrder from "./models/FoodOrder.js";
import OrderDetail from "./models/OrderDetail.js";

import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import computerRoutes from "./routes/computerRoutes.js";
import menuRoutes from "./routes/menuRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3636;

app.use(cors());
app.use(express.json());

// 3. ĐĂNG KÝ ROUTE
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/computers", computerRoutes);
app.use("/api/menu", menuRoutes);
app.use("/api/orders", orderRoutes);

Role.hasMany(User, { foreignKey: "role_id" });
User.belongsTo(Role, { foreignKey: "role_id" });

User.hasMany(FoodOrder, { foreignKey: "user_id" });
FoodOrder.belongsTo(User, { foreignKey: "user_id" });

FoodOrder.hasMany(OrderDetail, { foreignKey: "order_id" });
OrderDetail.belongsTo(FoodOrder, { foreignKey: "order_id" });

MenuItem.hasMany(OrderDetail, { foreignKey: "item_id" });
OrderDetail.belongsTo(MenuItem, { foreignKey: "item_id" });

app.get("/", (req, res) => {
  res.send("Server Internet Coffee Manager đang chạy!");
});

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Kết nối Database thành công.");

    // Tạo Admin mặc định nếu chưa có
    const adminName = "admin";
    const defaultPass = "123456";
    const adminUser = await User.findOne({ where: { user_name: adminName } });

    if (!adminUser) {
      const hashedPassword = await bcrypt.hash(defaultPass, 10);
      await User.create({
        user_name: adminName,
        password: hashedPassword,
        role_id: 1,
        balance: 9999999,
      });
      console.log(`🚀 Đã TẠO MỚI tài khoản Admin.`);
    }

    app.listen(PORT, () => {
      console.log(`Server đang chạy tại: http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("❌ Lỗi khởi động Server:", error);
  }
};

startServer();
