import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import { createServer } from "http";
import { Server } from "socket.io";
import { Op } from "sequelize";
import sequelize from "./config/database.js";

import Role from "./models/Role.js";
import User from "./models/User.js";
import Computer from "./models/Computer.js";
import MenuItem from "./models/MenuItem.js";
import FoodOrder from "./models/FoodOrder.js";
import OrderDetail from "./models/OrderDetail.js";
import Message from "./models/Message.js";

import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import computerRoutes from "./routes/computerRoutes.js";
import menuRoutes from "./routes/menuRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3636;

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: "*", methods: ["GET", "POST"] },
});

app.use(cors());
app.use(express.json());

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
User.hasMany(Computer, { foreignKey: "current_user_id" });
Computer.belongsTo(User, { foreignKey: "current_user_id", as: "CurrentUser" });

io.on("connection", (socket) => {
  // 1. Identify
  socket.on("identify", (user) => {
    if (!user) return;
    socket.user = user;
    if (user.role_id === 1 || user.role_id === 2) {
      socket.join("room_admin");
      socket.emit("request_conversations");
    } else {
      socket.join(`room_user_${user.id}`);
    }
  });

  socket.on("load_history", async (data) => {
    try {
      const messages = await Message.findAll({
        where: { conversation_id: data.conversation_id },
        order: [["created_at", "ASC"]],
        limit: 100,
      });
      socket.emit("history_loaded", messages);
    } catch (e) {
      console.error(e);
    }
  });

  socket.on("user_send_message", async (msg) => {
    if (!socket.user) return;
    try {
      const newMsg = await Message.create({
        sender_id: socket.user.id,
        sender_name: socket.user.name,
        role_id: socket.user.role_id,
        conversation_id: socket.user.id,
        content: msg.content,
      });
      socket.emit("receive_message", newMsg);
      io.to("room_admin").emit("receive_message", newMsg);
    } catch (e) {
      console.error(e);
    }
  });

  socket.on("admin_send_message", async (msg) => {
    if (!socket.user) return;
    try {
      const newMsg = await Message.create({
        sender_id: socket.user.id,
        sender_name: socket.user.name,
        role_id: socket.user.role_id,
        conversation_id: msg.target_user_id,
        content: msg.content,
      });
      socket.emit("receive_message", newMsg);
      socket.broadcast.to("room_admin").emit("receive_message", newMsg);
      io.to(`room_user_${msg.target_user_id}`).emit("receive_message", newMsg);
    } catch (e) {
      console.error(e);
    }
  });

  socket.on("get_conversations", async () => {
    try {
      const distinctData = await Message.findAll({
        attributes: [
          [
            sequelize.fn("DISTINCT", sequelize.col("conversation_id")),
            "conversation_id",
          ],
        ],
        where: { conversation_id: { [Op.ne]: null } },
        raw: true,
      });

      const userIds = distinctData.map((item) => item.conversation_id);

      if (userIds.length > 0) {
        const users = await User.findAll({
          where: { user_id: userIds },
          attributes: ["user_id", "user_name"],
        });
        const list = users.map((u) => ({ id: u.user_id, name: u.user_name }));
        socket.emit("conversations_list", list);
      }
    } catch (e) {
      console.error(e);
    }
  });
});

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connected.");
    const adminUser = await User.findOne({ where: { user_name: "admin" } });
    if (!adminUser) {
      const hash = await bcrypt.hash("123456", 10);
      await User.create({
        user_name: "admin",
        password: hash,
        role_id: 1,
        balance: 9999999,
      });
    }
    httpServer.listen(PORT, () => {
      console.log(`Server running at: http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error(error);
  }
};

startServer();
