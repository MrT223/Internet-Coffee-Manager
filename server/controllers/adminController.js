import User from "../models/User.js";
import Computer from "../models/Computer.js";
import FoodOrder from "../models/FoodOrder.js";
import TopupTransaction from "../models/TopupTransaction.js";
import bcrypt from "bcrypt";
import { Op } from "sequelize";

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
  const adminUserId = req.user.user_id;

  if (parseInt(id) === parseInt(adminUserId)) {
    return res.status(403).json({ message: "Không thể xóa chính mình!" });
  }

  if (parseInt(id) === 1) {
    return res.status(403).json({ message: "Không thể xóa Admin gốc!" });
  }

  try {
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: "Người dùng không tồn tại." });
    }
    
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


export const toggleLockUser = async (req, res) => {
  const { id } = req.params;
  const adminUserId = req.user.user_id;

  if (parseInt(id) === parseInt(adminUserId)) {
    return res.status(403).json({ message: "Không thể khóa chính mình!" });
  }

  if (parseInt(id) === 1) {
    return res.status(403).json({ message: "Không thể khóa Admin gốc!" });
  }

  try {
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: "Người dùng không tồn tại." });
    }


    if (user.status === 'locked') {
      user.status = 'offline';
      await user.save();
      res.json({ message: `Đã mở khóa tài khoản ${user.user_name}`, status: user.status });
    } else {
      user.status = 'locked';
      await user.save();
      res.json({ message: `Đã khóa tài khoản ${user.user_name}`, status: user.status });
    }
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi khóa/mở khóa." });
  }
};


export const resetPassword = async (req, res) => {
  const { id } = req.params;
  const { new_password } = req.body;

  if (parseInt(id) === 1) {
    return res.status(403).json({ message: "Không thể reset mật khẩu Admin gốc!" });
  }

  try {
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: "Người dùng không tồn tại." });
    }

    const password = new_password || "123456";
    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    await user.save();

    res.json({ message: `Đã reset mật khẩu thành "${password}"` });
  } catch (error) {
    res.status(500).json({ message: "Lỗi reset mật khẩu." });
  }
};

export const getDashboardStats = async (req, res) => {
  try {
    const revenueData = await FoodOrder.sum('total_amount', {
      where: { status: 'completed' }
    });

    const activeComputers = await Computer.count({
      where: { status: 'co nguoi' }
    });

    const pendingOrders = await FoodOrder.count({
      where: { status: 'pending' }
    });

    const totalUsers = await User.count({
      where: { role_id: 3 }
    });

    res.json({
      revenue: revenueData || 0,
      activeComputers,
      pendingOrders,
      totalUsers
    });
  } catch (error) {
    console.error("Stats Error:", error);
    res.status(500).json({ message: "Lỗi lấy thống kê" });
  }
};


export const getRevenueChartData = async (req, res) => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const orders = await FoodOrder.findAll({
      where: {
        status: "completed",
        order_date: { 
          [Op.gte]: sevenDaysAgo,
        },
      },
      attributes: ["order_date", "total_amount"], 
    });

    const dailyRevenue = {};
    
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toLocaleDateString("vi-VN", { day: '2-digit', month: '2-digit' });
      dailyRevenue[dateStr] = 0;
    }

    orders.forEach((order) => {
      const date = new Date(order.order_date); 
      const dateStr = date.toLocaleDateString("vi-VN", { day: '2-digit', month: '2-digit' });
      if (dailyRevenue[dateStr] !== undefined) {
        dailyRevenue[dateStr] += parseInt(order.total_amount);
      }
    });

    const chartData = Object.entries(dailyRevenue)
      .map(([date, revenue]) => ({ date, revenue }))
      .reverse();

    res.json(chartData);
  } catch (error) {
    console.error("Chart Error:", error);
    res.status(500).json({ message: "Lỗi lấy dữ liệu biểu đồ" });
  }
};


export const getFinancialStats = async (req, res) => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);


    const totalTopup = await TopupTransaction.sum('amount', {
      where: { 
        status: 'success',
        confirmed_at: { [Op.gte]: sevenDaysAgo }
      }
    }) || 0;


    const foodRevenueTotal = await FoodOrder.sum('total_amount', {
      where: { 
        status: 'completed',
        order_date: { [Op.gte]: sevenDaysAgo }
      }
    }) || 0;


    const foodRevenueCash = await FoodOrder.sum('total_amount', {
      where: { 
        status: 'completed', 
        payment_method: 'cash',
        order_date: { [Op.gte]: sevenDaysAgo }
      }
    }) || 0;


    const foodRevenueBalance = await FoodOrder.sum('total_amount', {
      where: { 
        status: 'completed', 
        payment_method: 'balance',
        order_date: { [Op.gte]: sevenDaysAgo }
      }
    }) || 0;


    const cashTopup = await TopupTransaction.sum('amount', {
      where: { 
        status: 'success', 
        payment_method: 'cash',
        confirmed_at: { [Op.gte]: sevenDaysAgo }
      }
    }) || 0;


    const transferTopup = await TopupTransaction.sum('amount', {
      where: { 
        status: 'success', 
        payment_method: 'transfer',
        confirmed_at: { [Op.gte]: sevenDaysAgo }
      }
    }) || 0;

    res.json({
      totalTopup,
      cashTopup,
      transferTopup,
      foodRevenueTotal,
      foodRevenueCash,
      foodRevenueBalance,
    });
  } catch (error) {
    console.error("Financial Stats Error:", error);
    res.status(500).json({ message: "Lỗi lấy thống kê tài chính" });
  }
};


export const getChartData = async (req, res) => {
  const { type = 'topup' } = req.query;
  
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);


    const dailyData = {};
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toLocaleDateString("vi-VN", { day: '2-digit', month: '2-digit' });
      dailyData[dateStr] = 0;
    }

    if (type === 'topup') {
      const transactions = await TopupTransaction.findAll({
        where: {
          status: 'success',
          confirmed_at: { [Op.gte]: sevenDaysAgo },
        },
        attributes: ['confirmed_at', 'amount'],
      });

      transactions.forEach((tx) => {
        const date = new Date(tx.confirmed_at);
        const dateStr = date.toLocaleDateString("vi-VN", { day: '2-digit', month: '2-digit' });
        if (dailyData[dateStr] !== undefined) {
          dailyData[dateStr] += parseInt(tx.amount);
        }
      });
    } else if (type === 'food_total') {
      const orders = await FoodOrder.findAll({
        where: {
          status: 'completed',
          order_date: { [Op.gte]: sevenDaysAgo },
        },
        attributes: ['order_date', 'total_amount'],
      });

      orders.forEach((order) => {
        const date = new Date(order.order_date);
        const dateStr = date.toLocaleDateString("vi-VN", { day: '2-digit', month: '2-digit' });
        if (dailyData[dateStr] !== undefined) {
          dailyData[dateStr] += parseInt(order.total_amount);
        }
      });
    } else if (type === 'food_cash') {
      const orders = await FoodOrder.findAll({
        where: {
          status: 'completed',
          payment_method: 'cash',
          order_date: { [Op.gte]: sevenDaysAgo },
        },
        attributes: ['order_date', 'total_amount'],
      });

      orders.forEach((order) => {
        const date = new Date(order.order_date);
        const dateStr = date.toLocaleDateString("vi-VN", { day: '2-digit', month: '2-digit' });
        if (dailyData[dateStr] !== undefined) {
          dailyData[dateStr] += parseInt(order.total_amount);
        }
      });
    }

    const chartData = Object.entries(dailyData)
      .map(([date, value]) => ({ date, value }))
      .reverse();

    res.json(chartData);
  } catch (error) {
    console.error("Chart Data Error:", error);
    res.status(500).json({ message: "Lỗi lấy dữ liệu biểu đồ" });
  }
};