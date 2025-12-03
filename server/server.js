import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import sequelize from "./config/database.js";

// Import Models
import Role from "./models/Role.js";
import User from "./models/User.js";
import Computer from "./models/Computer.js";
import MenuItem from "./models/MenuItem.js";
import FoodOrder from "./models/FoodOrder.js";
import OrderDetail from "./models/OrderDetail.js";

// Import Routes
import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import computerRoutes from "./routes/computerRoutes.js";
import menuRoutes from "./routes/menuRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.DB_PORT || 3636;

// --- MIDDLEWARES ---
app.use(cors());
app.use(express.json());

// --- ROUTES ---
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/computers", computerRoutes);
app.use("/api/menu", menuRoutes);
app.use("/api/orders", orderRoutes);

// Route kiểm tra trạng thái server
app.get("/", (req, res) => {
  res.send("Server Internet Coffee Manager đang chạy!");
});

Role.hasMany(User, { foreignKey: "role_id" });
User.belongsTo(Role, { foreignKey: "role_id" });

User.hasMany(FoodOrder, { foreignKey: "user_id" });
FoodOrder.belongsTo(User, { foreignKey: "user_id" });

FoodOrder.hasMany(OrderDetail, { foreignKey: "order_id" });
OrderDetail.belongsTo(FoodOrder, { foreignKey: "order_id" });

MenuItem.hasMany(OrderDetail, { foreignKey: "item_id" });
OrderDetail.belongsTo(MenuItem, { foreignKey: "item_id" });

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Kết nối Database thành công.");

    await sequelize.sync();
    console.log("✅ Đã đồng bộ cấu trúc bảng.");

    // --- TỰ ĐỘNG TẠO / RESET ADMIN ---
    const adminName = "admin";
    const defaultPass = "123456";
    const hashedPassword = await bcrypt.hash(defaultPass, 10);

    const adminUser = await User.findOne({ where: { user_name: adminName } });

    if (!adminUser) {
      await User.create({
        user_name: adminName,
        password: hashedPassword,
        role_id: 1,
        balance: 9999999,
      });
      console.log(`🚀 Đã TẠO MỚI tài khoản Admin.`);
      console.log(`👉 User: ${adminName} | Pass: ${defaultPass}`);
    } else {
      await adminUser.update({ password: hashedPassword });
      console.log(`🔄 Đã RESET mật khẩu Admin về mặc định.`);
      console.log(`👉 User: ${adminName} | Pass: ${defaultPass}`);
    }

    app.listen(PORT, () => {
      console.log(`Server đang chạy tại: http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("❌ Lỗi khởi động Server:", error);
  }
};

startServer();
