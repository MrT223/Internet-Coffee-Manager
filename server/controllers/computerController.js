import Computer from "../models/Computer.js";
import User from "../models/User.js";
import sequelize from "../config/database.js";
import { Op } from "sequelize";

export const getAllComputers = async (req, res) => {
  try {
    const computers = await Computer.findAll({
      order: [["computer_id", "ASC"]],
      include: [
        {
          model: User,
          as: "CurrentUser",
          attributes: ["user_name", "user_id"],
        },
      ],
    });
    res.json(computers);
  } catch (error) {
    res.status(500).json({ message: "Lỗi lấy dữ liệu máy." });
  }
};

export const createComputer = async (req, res) => {
  const { x, y, computer_name } = req.body;
  try {
    const exists = await Computer.findOne({ where: { x, y } });
    if (exists)
      return res.status(400).json({ message: "Vị trí này đã có máy!" });

    const newComp = await Computer.create({
      x,
      y,
      computer_name,
      status: "trong",
    });
    res.json(newComp);
  } catch (error) {
    res.status(500).json({ message: "Lỗi thêm máy." });
  }
};

// --- ĐÃ SỬA: Chỉ dùng để Update thông tin (Tên, Trạng thái) ---
export const updateComputer = async (req, res) => {
  const { id } = req.params;
  const { status, computer_name } = req.body; // Thêm computer_name để sửa tên

  try {
    const comp = await Computer.findByPk(id);
    if (!comp) return res.status(404).json({ message: "Máy không tồn tại." });

    // Cập nhật tên nếu có
    if (computer_name) {
      comp.computer_name = computer_name;
    }

    // Cập nhật trạng thái nếu có
    if (status) {
      if (status === "trong" || status === "bao tri" || status === "khoa") {
        comp.current_user_id = null;
        comp.session_start_time = null;
      }
      comp.status = status;
    }

    await comp.save();
    res.json({ message: "Cập nhật thành công.", computer: comp });
  } catch (error) {
    res.status(500).json({ message: "Lỗi cập nhật." });
  }
};

// --- ĐÃ THÊM MỚI: Hàm Xóa Máy Riêng Biệt ---
export const deleteComputer = async (req, res) => {
  const { id } = req.params;
  try {
    const comp = await Computer.findByPk(id);
    if (!comp) {
      return res.status(404).json({ message: "Máy không tồn tại" });
    }

    if (comp.status === "co nguoi" || comp.status === "co_nguoi") {
      return res.status(400).json({ message: "Không thể xóa máy đang có khách!" });
    }

    await comp.destroy();
    res.status(200).json({ message: "Đã xóa máy thành công" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi Server khi xóa máy" });
  }
};

export const bookComputer = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.user_id;
  const DEPOSIT = 36000;

  try {
    const computer = await Computer.findByPk(id);
    const user = await User.findByPk(userId);

    if (!computer)
      return res.status(404).json({ message: "Máy không tồn tại." });

    if (computer.status !== "trong") {
      return res.status(400).json({ message: "Máy không khả dụng." });
    }

    if (user.balance < DEPOSIT) {
      return res.status(400).json({ message: "Số dư không đủ." });
    }

    user.balance -= DEPOSIT;
    await user.save();

    computer.status = "dat truoc";
    computer.current_user_id = userId;
    computer.session_start_time = new Date(); // Lưu thời điểm đặt máy
    await computer.save();

    res.json({
      message: "Đặt máy thành công!",
      newBalance: user.balance,
      computer: computer,
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server." });
  }
};

export const startSession = async (req, res) => {
  const { computerId, userId } = req.body;
  const DEPOSIT = 36000;
  const t = await sequelize.transaction();

  try {
    const computer = await Computer.findByPk(computerId);
    const user = await User.findByPk(userId);

    if (!computer || !user) {
      await t.rollback();
      return res.status(404).json({ message: "Không tìm thấy Máy hoặc User" });
    }

    const activeSession = await Computer.findOne({
      where: { current_user_id: userId },
    });

    if (activeSession && activeSession.computer_id !== parseInt(computerId)) {
      await t.rollback();
      return res.status(400).json({
        message: `Bạn đang ngồi tại máy ${activeSession.computer_name}. Vui lòng đăng xuất máy đó trước!`,
      });
    }

    if (computer.status === "dat truoc") {
      const bookerId = parseInt(computer.current_user_id);
      const enteringUserId = parseInt(user.user_id);

      if (bookerId !== enteringUserId) {
        await t.rollback();
        return res
          .status(400)
          .json({ message: "Máy này đã được người khác đặt!" });
      }

      computer.status = "co nguoi";
      computer.current_user_id = enteringUserId;
      computer.session_start_time = new Date().toISOString();
      user.status = "playing";
      user.balance += DEPOSIT;

      await computer.save({ transaction: t });
      await user.save({ transaction: t });

      await t.commit();
      return res.json({
        message: "Đăng nhập thành công! (Hoàn cọc)",
        new_balance: user.balance,
        new_status: user.status,
      });
    } else if (computer.status === "trong") {
      computer.status = "co nguoi";
      computer.current_user_id = userId;
      computer.session_start_time = new Date().toISOString();
      user.status = "playing";

      await computer.save({ transaction: t });
      await user.save({ transaction: t });

      await t.commit();
      return res.json({
        message: "Đăng nhập thành công!",
        new_balance: user.balance,
        new_status: user.status,
      });
    } else {
      await t.rollback();
      res.status(400).json({ message: "Máy đang bận hoặc bảo trì." });
    }
  } catch (error) {
    await t.rollback();
    console.error(error);
    res.status(500).json({ message: "Lỗi bắt đầu phiên." });
  }
};

export const forceLogout = async (req, res) => {
  const { id } = req.params;
  try {
    const computer = await Computer.findByPk(id);
    if (!computer)
      return res.status(404).json({ message: "Máy không tồn tại" });

    if (computer.current_user_id) {
      const user = await User.findByPk(computer.current_user_id);
      if (user) {
        user.status = "offline";
        await user.save();
      }
    }

    computer.status = "trong";
    computer.current_user_id = null;
    computer.session_start_time = null;
    await computer.save();

    res.json({ message: "Đã cưỡng chế đăng xuất thành công." });
  } catch (error) {
    res.status(500).json({ message: "Lỗi force logout." });
  }
};

export const refundBooking = async (req, res) => {
  const { id } = req.params;
  const DEPOSIT = 36000;
  const t = await sequelize.transaction();

  try {
    const computer = await Computer.findByPk(id);
    if (!computer) {
      await t.rollback();
      return res.status(404).json({ message: "Máy không tồn tại" });
    }

    if (!computer.current_user_id) {
      await t.rollback();
      return res
        .status(400)
        .json({ message: "Không có ai đặt máy này để hoàn tiền." });
    }

    const user = await User.findByPk(computer.current_user_id);
    if (user) {
      user.balance += DEPOSIT;
      await user.save({ transaction: t });
    }

    computer.status = "bao tri";
    computer.current_user_id = null;
    computer.session_start_time = null;
    await computer.save({ transaction: t });

    await t.commit();
    res.json({ message: "Đã hoàn tiền và chuyển máy sang bảo trì." });
  } catch (error) {
    await t.rollback();
    res.status(500).json({ message: "Lỗi hoàn tiền." });
  }
};

// --- Lấy session hiện tại của user ---
export const getActiveSession = async (req, res) => {
  const userId = req.user.user_id;
  const RATE_PER_HOUR = 36000;
  const RATE_PER_MINUTE = RATE_PER_HOUR / 60; // 600đ/phút

  try {
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: "User không tồn tại" });
    }

    if (user.status !== "playing") {
      return res.json({
        isPlaying: false,
        status: user.status,
        balance: user.balance,
      });
    }

    // Tìm máy đang chơi
    const computer = await Computer.findOne({
      where: { current_user_id: userId },
    });

    if (!computer) {
      return res.json({
        isPlaying: false,
        status: user.status,
        balance: user.balance,
      });
    }

    // Sử dụng timestamp để tính toán chính xác
    const now = Date.now();
    const sessionStartTime = computer.session_start_time
      ? new Date(computer.session_start_time).getTime()
      : now;
    
    const elapsedMs = Math.max(0, now - sessionStartTime);
    const elapsedMinutes = elapsedMs / (1000 * 60);
    const currentCost = Math.floor(elapsedMinutes * RATE_PER_MINUTE);
    const effectiveBalance = Math.max(0, user.balance - currentCost);
    const remainingTimeMs = Math.max(0, (effectiveBalance / RATE_PER_HOUR) * 60 * 60 * 1000);

    res.json({
      isPlaying: true,
      status: user.status,
      balance: user.balance,
      effectiveBalance,
      computer: {
        id: computer.computer_id,
        name: computer.computer_name,
      },
      sessionStartTime: computer.session_start_time,
      elapsedMs,
      currentCost,
      remainingTimeMs,
      ratePerHour: RATE_PER_HOUR,
    });
  } catch (error) {
    console.error("Lỗi getActiveSession:", error);
    res.status(500).json({ message: "Lỗi lấy thông tin session." });
  }
};

// --- Kết thúc session (logout khỏi máy) ---
export const endSession = async (req, res) => {
  const userId = req.user.user_id;
  const RATE_PER_HOUR = 36000; // 36,000đ/hour = 600đ/phút = 10đ/giây
  const t = await sequelize.transaction();

  try {
    const user = await User.findByPk(userId);
    if (!user) {
      await t.rollback();
      return res.status(404).json({ message: "User không tồn tại" });
    }

    if (user.status !== "playing") {
      await t.rollback();
      return res.status(400).json({ message: "Bạn không trong phiên chơi nào." });
    }

    const computer = await Computer.findOne({
      where: { current_user_id: userId },
    });

    if (!computer) {
      await t.rollback();
      return res.status(400).json({ message: "Không tìm thấy máy đang chơi." });
    }

    // Tính tiền cần trừ - sử dụng getTime() để đảm bảo tính toán chính xác
    const now = Date.now(); // Current timestamp in milliseconds
    const sessionStartTime = computer.session_start_time
      ? new Date(computer.session_start_time).getTime()
      : now; // Nếu không có thời gian bắt đầu, coi như vừa bắt đầu
    
    const elapsedMs = Math.max(0, now - sessionStartTime);
    const elapsedMinutes = elapsedMs / (1000 * 60);
    const elapsedHours = elapsedMinutes / 60;
    
    // Tính tiền theo phút (600đ/phút) để chính xác hơn
    const RATE_PER_MINUTE = RATE_PER_HOUR / 60; // 600đ/phút
    const totalCost = Math.floor(elapsedMinutes * RATE_PER_MINUTE);

    console.log("EndSession Debug:", {
      userId,
      computerName: computer.computer_name,
      sessionStartTime: computer.session_start_time,
      nowTimestamp: now,
      startTimestamp: sessionStartTime,
      elapsedMs,
      elapsedMinutes: elapsedMinutes.toFixed(2),
      totalCost,
      userBalance: user.balance,
    });

    // Trừ tiền thực sự
    const newBalance = Math.max(0, user.balance - totalCost);
    user.balance = newBalance;
    user.status = "online";
    await user.save({ transaction: t });

    // Reset máy
    computer.status = "trong";
    computer.current_user_id = null;
    computer.session_start_time = null;
    await computer.save({ transaction: t });

    await t.commit();

    const elapsedMinsDisplay = Math.floor(elapsedMinutes);
    const elapsedSecsDisplay = Math.floor((elapsedMinutes % 1) * 60);
    
    res.json({
      message: `Đã kết thúc phiên chơi. Thời gian: ${elapsedMinsDisplay} phút ${elapsedSecsDisplay} giây. Chi phí: ${totalCost.toLocaleString()}đ`,
      newBalance,
      totalCost,
      elapsedMinutes: elapsedMinsDisplay,
      elapsedSeconds: elapsedSecsDisplay,
    });
  } catch (error) {
    await t.rollback();
    console.error("Lỗi endSession:", error);
    res.status(500).json({ message: "Lỗi kết thúc phiên." });
  }
};

// --- Hủy booking hết hạn (chạy bởi scheduler) ---
const BOOKING_TIMEOUT = 60 * 60 * 1000; // 1 tiếng

export const cancelExpiredBookings = async () => {
  const now = new Date();

  try {
    const expiredBookings = await Computer.findAll({
      where: {
        status: "dat truoc",
        session_start_time: {
          [Op.lt]: new Date(now.getTime() - BOOKING_TIMEOUT),
        },
      },
    });

    for (const computer of expiredBookings) {
      console.log(`[Scheduler] Hủy đặt máy hết hạn: ${computer.computer_name} (ID: ${computer.computer_id})`);
      computer.status = "trong";
      computer.current_user_id = null;
      computer.session_start_time = null;
      await computer.save();
    }

    if (expiredBookings.length > 0) {
      console.log(`[Scheduler] Đã hủy ${expiredBookings.length} đặt chỗ hết hạn (không hoàn tiền)`);
    }
  } catch (error) {
    console.error("[Scheduler] Lỗi khi hủy đặt chỗ hết hạn:", error);
  }
};