import FoodOrder from "../models/FoodOrder.js";
import OrderDetail from "../models/OrderDetail.js";
import User from "../models/User.js";
import sequelize from "../config/database.js";

export const placeOrder = async (req, res) => {
  const userId = req.user.user_id;
  const { cart } = req.body;

  if (!cart || cart.length === 0) {
    return res.status(400).json({ message: "Giỏ hàng trống." });
  }

  const t = await sequelize.transaction();

  try {
    let totalAmount = 0;
    cart.forEach((item) => {
      totalAmount += item.price * item.quantity;
    });

    const user = await User.findByPk(userId);
    if (user.balance < totalAmount) {
      await t.rollback();
      return res.status(400).json({ message: "Số dư không đủ để thanh toán." });
    }

    user.balance -= totalAmount;
    await user.save({ transaction: t });

    const newOrder = await FoodOrder.create(
      {
        user_id: userId,
        total_amount: totalAmount,
        status: "pending",
      },
      { transaction: t }
    );

    const orderDetailsData = cart.map((item) => ({
      order_id: newOrder.bill_id,
      item_id: item.item_id,
      quantity: item.quantity,
      unit_price: item.price,
      subtotal: item.price * item.quantity,
    }));

    await OrderDetail.bulkCreate(orderDetailsData, { transaction: t });

    await t.commit();

    res.status(201).json({
      message: "Đặt món thành công!",
      newBalance: user.balance,
    });
  } catch (error) {
    await t.rollback();
    console.error("Lỗi đặt món:", error);
    res.status(500).json({ message: "Lỗi hệ thống, giao dịch đã bị hủy." });
  }
};

export const getMyOrders = async (req, res) => {
  const userId = req.user.user_id;
  try {
    const orders = await FoodOrder.findAll({
      where: { user_id: userId },
      order: [["order_date", "DESC"]],
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Lỗi tải lịch sử đơn hàng." });
  }
};
