import SessionHistory from "../models/SessionHistory.js";
import User from "../models/User.js";
import Computer from "../models/Computer.js";
import { Op } from "sequelize";

// Lấy tất cả lịch sử chơi (có filter và pagination)
export const getAllSessionHistory = async (req, res) => {
  try {
    const { userId, computerId, startDate, endDate, page = 1, limit = 20 } = req.query;

    const where = {};
    
    // Filter theo user
    if (userId) {
      where.user_id = parseInt(userId);
    }
    
    // Filter theo máy
    if (computerId) {
      where.computer_id = parseInt(computerId);
    }
    
    // Filter theo khoảng thời gian
    if (startDate || endDate) {
      where.end_time = {};
      if (startDate) {
        where.end_time[Op.gte] = new Date(startDate);
      }
      if (endDate) {
        where.end_time[Op.lte] = new Date(endDate);
      }
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows } = await SessionHistory.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: "user",
          attributes: ["user_id", "user_name"],
        },
      ],
      order: [["end_time", "DESC"]],
      limit: parseInt(limit),
      offset,
    });

    res.json({
      sessions: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Lỗi lấy lịch sử phiên chơi:", error);
    res.status(500).json({ message: "Lỗi server khi lấy lịch sử phiên chơi" });
  }
};

// Lấy lịch sử chơi của một user
export const getUserSessionHistory = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows } = await SessionHistory.findAndCountAll({
      where: { user_id: parseInt(userId) },
      order: [["end_time", "DESC"]],
      limit: parseInt(limit),
      offset,
    });

    res.json({
      sessions: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Lỗi lấy lịch sử user:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
};

// Thống kê tổng quan
export const getSessionStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Tổng số phiên chơi
    const totalSessions = await SessionHistory.count();

    // Phiên chơi hôm nay
    const todaySessions = await SessionHistory.count({
      where: {
        end_time: { [Op.gte]: today },
      },
    });

    // Tổng doanh thu từ phiên chơi
    const totalRevenue = await SessionHistory.sum("total_cost") || 0;

    // Doanh thu hôm nay
    const todayRevenue = await SessionHistory.sum("total_cost", {
      where: {
        end_time: { [Op.gte]: today },
      },
    }) || 0;

    res.json({
      totalSessions,
      todaySessions,
      totalRevenue,
      todayRevenue,
    });
  } catch (error) {
    console.error("Lỗi thống kê:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
};
