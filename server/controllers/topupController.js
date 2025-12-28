import TopupTransaction from "../models/TopupTransaction.js";
import User from "../models/User.js";
import Promotion from "../models/Promotion.js";
import sequelize from "../config/database.js";
import { Op } from "sequelize";

// Sinh mã giao dịch unique
const generateTransactionCode = () => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `CO${timestamp}${random}`;
};

// Tạo giao dịch nạp tiền mới
export const createTopup = async (req, res) => {
  const userId = req.user.user_id;
  const { amount } = req.body;

  // Validate mệnh giá
  const validAmounts = [10000, 20000, 50000, 100000, 200000, 500000, 1000000];
  if (!validAmounts.includes(parseInt(amount))) {
    return res.status(400).json({ message: "Mệnh giá không hợp lệ!" });
  }

  try {
    // Hủy các giao dịch pending cũ của user này
    await TopupTransaction.update(
      { status: "expired" },
      { where: { user_id: userId, status: "pending" } }
    );

    // Tạo giao dịch mới
    const transactionCode = generateTransactionCode();
    const newTx = await TopupTransaction.create({
      user_id: userId,
      amount: parseInt(amount),
      transaction_code: transactionCode,
      status: "pending",
    });

    res.status(201).json({
      message: "Tạo giao dịch thành công!",
      transaction: {
        id: newTx.transaction_id,
        code: newTx.transaction_code,
        amount: newTx.amount,
        status: newTx.status,
      },
      bankInfo: {
        bankName: "MB Bank",
        bankId: "970422",
        accountNumber: "0966846502",
        accountName: "NGUYEN TUAN ANH",
        content: `CYBEROPS ${transactionCode}`,
      },
    });
  } catch (error) {
    console.error("Lỗi tạo topup:", error);
    res.status(500).json({ message: "Lỗi tạo giao dịch." });
  }
};

// Xác nhận nạp tiền (cho demo - thực tế sẽ là webhook từ bank)
export const confirmTopup = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.user_id;

  const t = await sequelize.transaction();

  try {
    const tx = await TopupTransaction.findOne({
      where: { transaction_id: id, user_id: userId, status: "pending" },
    });

    if (!tx) {
      await t.rollback();
      return res.status(404).json({ message: "Giao dịch không tồn tại hoặc đã xử lý." });
    }

    // Kiểm tra khuyến mãi áp dụng
    const now = new Date();
    const activePromotion = await Promotion.findOne({
      where: {
        type: 'topup_bonus',
        is_active: true,
        start_date: { [Op.lte]: now },
        end_date: { [Op.gte]: now },
        min_amount: { [Op.lte]: tx.amount }
      },
      order: [['bonus_percent', 'DESC']], // Ưu tiên bonus cao nhất nếu có nhiều cái trùng
      transaction: t
    });

    let bonusAmount = 0;
    if (activePromotion) {
      bonusAmount = Math.floor(tx.amount * activePromotion.bonus_percent / 100);
      console.log(`[Topup] Applied bonus ${activePromotion.bonus_percent}% (${bonusAmount}đ) for tx ${tx.transaction_code}`);
    }

    // Cập nhật balance user (gốc + bonus)
    const user = await User.findByPk(userId);
    const totalAmount = parseInt(tx.amount) + parseInt(bonusAmount);
    user.balance = parseInt(user.balance) + totalAmount;
    await user.save({ transaction: t });

    // Cập nhật trạng thái giao dịch
    tx.status = "success";
    tx.confirmed_at = new Date();
    await tx.save({ transaction: t });

    await t.commit();

    let message = `Nạp ${tx.amount.toLocaleString('vi-VN')}đ thành công!`;
    if (bonusAmount > 0) {
      message += ` Bạn được tặng thêm ${bonusAmount.toLocaleString('vi-VN')}đ (${activePromotion.bonus_percent}%)`;
    }

    res.json({
      message: message,
      newBalance: user.balance,
      transaction: {
        id: tx.transaction_id,
        code: tx.transaction_code,
        amount: tx.amount,
        bonus: bonusAmount, // Trả về để FE hiển thị nếu cần
        status: tx.status,
      },
    });
  } catch (error) {
    await t.rollback();
    console.error("Lỗi confirm topup:", error);
    res.status(500).json({ message: "Lỗi xác nhận giao dịch." });
  }
};

// Lấy lịch sử nạp tiền của user
export const getMyTopups = async (req, res) => {
  const userId = req.user.user_id;

  try {
    const transactions = await TopupTransaction.findAll({
      where: { user_id: userId },
      order: [["created_at", "DESC"]],
      limit: 20,
    });

    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: "Lỗi lấy lịch sử." });
  }
};

// Hủy giao dịch pending
export const cancelTopup = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.user_id;

  try {
    const tx = await TopupTransaction.findOne({
      where: { transaction_id: id, user_id: userId, status: "pending" },
    });

    if (!tx) {
      return res.status(404).json({ message: "Giao dịch không tồn tại." });
    }

    tx.status = "cancelled";
    await tx.save();

    res.json({ message: "Đã hủy giao dịch." });
  } catch (error) {
    res.status(500).json({ message: "Lỗi hủy giao dịch." });
  }
};

// Lấy giao dịch pending hiện tại
export const getPendingTopup = async (req, res) => {
  const userId = req.user.user_id;

  try {
    const tx = await TopupTransaction.findOne({
      where: { user_id: userId, status: "pending" },
      order: [["created_at", "DESC"]],
    });

    if (!tx) {
      return res.json(null);
    }

    res.json({
      transaction: {
        id: tx.transaction_id,
        code: tx.transaction_code,
        amount: tx.amount,
        status: tx.status,
        created_at: tx.created_at,
      },
      bankInfo: {
        bankName: "MB Bank",
        bankId: "970422",
        accountNumber: "0966846502",
        accountName: "NGUYEN TUAN ANH",
        content: `CYBEROPS ${tx.transaction_code}`,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi lấy giao dịch." });
  }
};
