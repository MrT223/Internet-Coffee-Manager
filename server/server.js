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
import SystemSetting from "./models/SystemSetting.js";

import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import computerRoutes from "./routes/computerRoutes.js";
import menuRoutes from "./routes/menuRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import topupRoutes from "./routes/topupRoutes.js";
import promotionRoutes from "./routes/promotionRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import geminiRoutes from "./routes/geminiRoutes.js";
import settingsRoutes from "./routes/settingsRoutes.js";
import TopupTransaction from "./models/TopupTransaction.js";
import { cancelExpiredBookings } from "./controllers/computerController.js";

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
app.use("/api/topup", topupRoutes);
app.use("/api/promotions", promotionRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/ai", geminiRoutes);
app.use("/api/settings", settingsRoutes);

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

// Lưu trữ online admins: Map<socketId, {id, name, role_id}>
const onlineAdmins = new Map();

// Helper: Lấy Set các admin ID đang online
const getOnlineAdminIds = () => {
  return new Set(Array.from(onlineAdmins.values()).map(a => String(a.id)));
};

// Helper: Lấy tất cả admin/staff từ DB và đánh dấu online status
const getAllAdminsWithStatus = async () => {
  try {
    const admins = await User.findAll({
      where: { role_id: [1, 2] },
      attributes: ['user_id', 'user_name', 'role_id'],
    });
    const onlineIds = getOnlineAdminIds();
    return admins.map(a => ({
      id: a.user_id,
      name: a.user_name,
      role_id: a.role_id,
      role_name: a.role_id === 1 ? 'Admin' : 'Nhân viên',
      online: onlineIds.has(String(a.user_id))
    }));
  } catch (e) {
    console.error("Lỗi lấy danh sách admin:", e);
    return [];
  }
};

// Helper: Broadcast danh sách admin (tất cả) cho tất cả users
const broadcastAllAdmins = async () => {
  const adminList = await getAllAdminsWithStatus();
  io.emit("all_admins", adminList);
};

io.on("connection", (socket) => {
  // 1. Identify
  socket.on("identify", async (user) => {
    if (!user) return;
    const userId = user.user_id || user.id;
    const userName = user.name || user.user_name;
    socket.user = { ...user, id: userId, user_id: userId, name: userName };
    
    if (user.role_id === 1 || user.role_id === 2) {
      socket.join("room_admin");
      onlineAdmins.set(socket.id, { id: userId, name: userName, role_id: user.role_id });
      // Admin online
      broadcastAllAdmins();
    } else {
      socket.join(`room_user_${userId}`);

      // Gửi danh sách tất cả admin cho user mới
      const adminList = await getAllAdminsWithStatus();
      socket.emit("all_admins", adminList);
    }
  });

  // Khi disconnect
  socket.on("disconnect", () => {
    if (onlineAdmins.has(socket.id)) {
      const admin = onlineAdmins.get(socket.id);
      onlineAdmins.delete(socket.id);
      // Admin offline
      broadcastAllAdmins();
    }
  });

  // User request all admins
  socket.on("get_all_admins", async () => {
    const adminList = await getAllAdminsWithStatus();
    socket.emit("all_admins", adminList);
  });

  // Get unread count - gọi khi user/admin login để check tin chưa đọc
  socket.on("get_unread_count", async () => {
    if (!socket.user) return;
    try {
      const userId = socket.user.id;
      const roleId = socket.user.role_id;
      
      let unreadCount = 0;
      
      if (roleId === 1 || roleId === 2) {
        const suffix = `_${userId}`;
        unreadCount = await Message.count({
          where: {
            role_id: 3,
            is_read: false,
            conversation_id: { [Op.like]: `%${suffix}` }
          }
        });
      } else {
        const prefix = `${userId}_`;
        unreadCount = await Message.count({
          where: {
            role_id: { [Op.in]: [1, 2] },
            is_read: false,
            conversation_id: { [Op.like]: `${prefix}%` }
          }
        });
      }
      

      socket.emit("unread_count", unreadCount);
    } catch (e) {
      console.error("[Chat] Error get_unread_count:", e);
    }
  });

  // Get unread details - trả về unread count per conversation với last message time
  socket.on("get_unread_details", async () => {
    if (!socket.user) return;
    try {
      const userId = socket.user.id;
      const roleId = socket.user.role_id;
      
      let conversationFilter = {};
      let unreadFilter = {};
      
      if (roleId === 1 || roleId === 2) {
        // Admin: conversations có suffix _userId
        const suffix = `_${userId}`;
        conversationFilter = { conversation_id: { [Op.like]: `%${suffix}` } };
        unreadFilter = { role_id: 3, is_read: false, conversation_id: { [Op.like]: `%${suffix}` } };
      } else {
        // User: conversations có prefix userId_
        const prefix = `${userId}_`;
        conversationFilter = { conversation_id: { [Op.like]: `${prefix}%` } };
        unreadFilter = { role_id: { [Op.in]: [1, 2] }, is_read: false, conversation_id: { [Op.like]: `${prefix}%` } };
      }
      
      // 1. Lấy lastTime cho TẤT CẢ conversations
      const allConversations = await Message.findAll({
        where: conversationFilter,
        attributes: [
          'conversation_id',
          [sequelize.fn('MAX', sequelize.col('created_at')), 'last_time']
        ],
        group: ['conversation_id'],
        raw: true
      });
      
      // 2. Lấy unread count riêng
      const unreadMessages = await Message.findAll({
        where: unreadFilter,
        attributes: [
          'conversation_id',
          [sequelize.fn('COUNT', sequelize.col('message_id')), 'count']
        ],
        group: ['conversation_id'],
        raw: true
      });
      
      // Map unread counts
      const unreadMap = {};
      for (const item of unreadMessages) {
        const key = roleId === 3 
          ? item.conversation_id.split('_')[1] 
          : item.conversation_id;
        unreadMap[key] = parseInt(item.count);
      }
      
      // Format kết quả cuối cùng
      const details = {};
      for (const item of allConversations) {
        const key = roleId === 3 
          ? item.conversation_id.split('_')[1] // User: lấy admin_id
          : item.conversation_id; // Admin: lấy conversation_id
        details[key] = {
          count: unreadMap[key] || 0,
          lastTime: new Date(item.last_time).getTime()
        };
      }
      

      socket.emit("unread_details", details);
    } catch (e) {
      console.error("[Chat] Error get_unread_details:", e);
    }
  });

  // Mark messages as read - gọi khi user mở conversation
  socket.on("mark_as_read", async (data) => {
    if (!socket.user || !data.conversation_id) return;
    try {
      const userId = socket.user.id;
      const roleId = socket.user.role_id;
      
      // Chỉ đánh dấu tin nhắn từ người khác là đã đọc
      const whereCondition = {
        conversation_id: data.conversation_id,
        is_read: false,
        sender_id: { [Op.ne]: userId }
      };
      
      const updated = await Message.update(
        { is_read: true },
        { where: whereCondition }
      );
      

    } catch (e) {
      console.error("[Chat] Error mark_as_read:", e);
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

  // User gửi tin nhắn cho admin cụ thể (private 1-1)
  socket.on("user_send_message", async (msg) => {
    if (!socket.user || !msg.target_admin_id) return;
    try {
      // conversation_id = "userId_adminId" để tạo conversation riêng
      const conversationId = `${socket.user.id}_${msg.target_admin_id}`;
      
      const newMsg = await Message.create({
        sender_id: socket.user.id,
        sender_name: socket.user.name,
        role_id: socket.user.role_id,
        conversation_id: conversationId,
        content: msg.content,
      });
      
      // Gửi lại cho user
      socket.emit("receive_message", newMsg);
      
      // Gửi đến admin được chọn (nếu online)
      // Tìm socket của admin đó
      for (const [socketId, admin] of onlineAdmins.entries()) {
        if (String(admin.id) === String(msg.target_admin_id)) {
          io.to(socketId).emit("receive_message", newMsg);
          io.to(socketId).emit("new_conversation", {
            id: conversationId,
            user_id: socket.user.id,
            user_name: socket.user.name
          });
        }
      }
    } catch (e) {
      console.error(e);
    }
  });

  socket.on("admin_send_message", async (msg) => {
    if (!socket.user || !msg.conversation_id) return;
    try {
      // conversation_id đã có sẵn dạng "userId_adminId"
      const newMsg = await Message.create({
        sender_id: socket.user.id,
        sender_name: socket.user.name,
        role_id: socket.user.role_id,
        conversation_id: msg.conversation_id,
        content: msg.content,
      });
      
      // Gửi lại cho admin
      socket.emit("receive_message", newMsg);
      
      // Gửi cho user (lấy user_id từ conversation_id)
      const userId = msg.conversation_id.split("_")[0];
      io.to(`room_user_${userId}`).emit("receive_message", newMsg);
    } catch (e) {
      console.error(e);
    }
  });

  // Admin lấy danh sách conversations của mình
  socket.on("get_my_conversations", async () => {
    if (!socket.user) return;
    try {
      const adminId = socket.user.id;

      
      // Tìm tất cả conversation có chứa adminId (format: userId_adminId)
      const suffix = `_${adminId}`;
      const distinctData = await Message.findAll({
        attributes: [
          [sequelize.fn("DISTINCT", sequelize.col("conversation_id")), "conversation_id"],
        ],
        where: { 
          conversation_id: { 
            [Op.like]: `%${suffix}` 
          } 
        },
        raw: true,
      });
      


      const conversations = [];
      for (const item of distinctData) {
        if (!item.conversation_id) continue;
        const parts = item.conversation_id.split("_");
        if (parts.length !== 2) continue;
        
        const userId = parts[0];
        const user = await User.findByPk(userId, { attributes: ['user_id', 'user_name'] });
        if (user) {
          conversations.push({
            id: item.conversation_id,
            user_id: user.user_id,
            name: user.user_name,
            user_name: user.user_name
          });
        }
      }
      

      socket.emit("conversations_list", conversations);
    } catch (e) {
      console.error("[Chat] Error get_my_conversations:", e);
    }
  });

  // Giữ lại get_conversations cũ cho backward compatibility
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

    // Seed default system settings
    const [bookingTimeoutSetting] = await SystemSetting.findOrCreate({
      where: { setting_key: "booking_timeout_minutes" },
      defaults: {
        setting_value: "60",
        description: "Thời gian giữ chỗ đặt trước (phút)",
      },
    });
    httpServer.listen(PORT, () => {
      console.log(`Server running at: http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error(error);
  }
};

startServer();

// --- Scheduler: Kiểm tra booking hết hạn mỗi 30 giây ---
setInterval(() => {
  cancelExpiredBookings();
}, 30 * 1000); // Chạy mỗi 30 giây

console.log("[Scheduler] Đã khởi động scheduler kiểm tra booking hết hạn (mỗi 30 giây)");
