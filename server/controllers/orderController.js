import FoodOrder from "../models/FoodOrder.js";
import OrderDetail from "../models/OrderDetail.js";
import MenuItem from "../models/MenuItem.js";
import User from "../models/User.js";
import Computer from "../models/Computer.js";
import sequelize from "../config/database.js";

const RATE_PER_HOUR = 36000; // 36,000đ/hour

export const placeOrder = async (req, res) => {
  const userId = req.user.user_id;
  const { cart, payment_method = "balance" } = req.body;

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
    
    // Nếu thanh toán bằng số dư, kiểm tra số dư
    if (payment_method === "balance") {
      // Tính số dư hiệu lực nếu đang trong phiên chơi
      let effectiveBalance = user.balance;
      
      if (user.status === "playing") {
        // Tìm máy đang chơi để tính thời gian
        const computer = await Computer.findOne({
          where: { current_user_id: userId },
        });
        
        if (computer && computer.session_start_time) {
          const now = Date.now();
          const sessionStartTime = new Date(computer.session_start_time).getTime();
          const elapsedMs = Math.max(0, now - sessionStartTime);
          const elapsedMinutes = elapsedMs / (1000 * 60);
          const RATE_PER_MINUTE = RATE_PER_HOUR / 60; // 600đ/phút
          const currentSessionCost = Math.floor(elapsedMinutes * RATE_PER_MINUTE);
          
          effectiveBalance = user.balance - currentSessionCost;
        }
      }
      
      // Kiểm tra số dư HIỆU LỰC có đủ không
      if (effectiveBalance < totalAmount) {
        await t.rollback();
        return res.status(400).json({ 
          message: `Số dư không đủ. Số dư hiệu lực: ${Math.floor(effectiveBalance).toLocaleString()}đ, cần: ${totalAmount.toLocaleString()}đ` 
        });
      }

      // Trừ tiền khi thanh toán bằng số dư
      user.balance -= totalAmount;
      await user.save({ transaction: t });
    }
    // Nếu payment_method === "cash", không trừ tiền

    const newOrder = await FoodOrder.create(
      {
        user_id: userId,
        total_amount: totalAmount,
        status: "pending",
        payment_method: payment_method,
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

    const paymentMessage = payment_method === "cash" 
      ? "Đặt món thành công! Thanh toán tiền mặt khi nhận đồ." 
      : "Đặt món thành công! Vui lòng đợi nhân viên phục vụ.";

    res.status(201).json({
      message: paymentMessage,
      newBalance: user.balance,
      payment_method: payment_method,
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

export const getAllOrders = async (req, res) => {
  try {
    const orders = await FoodOrder.findAll({
      order: [["order_date", "DESC"]],
      include: [
        {
          model: User,
          attributes: ["user_name"],
        },
        {
          model: OrderDetail,
          include: [{ model: MenuItem, attributes: ["food_name"] }],
        },
      ],
    });
    res.json(orders);
  } catch (error) {
    console.error("Lỗi get all orders:", error);
    res.status(500).json({ message: "Lỗi tải danh sách đơn hàng." });
  }
};

export const updateOrderStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const t = await sequelize.transaction();

  try {
    const order = await FoodOrder.findByPk(id);
    if (!order) {
      await t.rollback();
      return res.status(404).json({ message: "Đơn hàng không tồn tại." });
    }
    if (status === "cancelled" && order.status !== "cancelled") {
      // Chỉ hoàn tiền nếu thanh toán bằng số dư (không phải tiền mặt)
      if (order.payment_method === "balance") {
        const user = await User.findByPk(order.user_id);
        if (user) {
          user.balance += order.total_amount;
          await user.save({ transaction: t });
        }
      }
    }

    order.status = status;
    await order.save({ transaction: t });

    await t.commit();
    res.json({ message: "Cập nhật thành công!", order });
  } catch (error) {
    await t.rollback();
    console.error(error);
    res.status(500).json({ message: "Lỗi cập nhật đơn hàng." });
  }
};
