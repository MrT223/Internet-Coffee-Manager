import Computer from "../models/Computer.js";
import User from "../models/User.js";
import sequelize from "../config/database.js";

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
    console.error(error);
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

export const bookComputer = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.user_id;
  const DEPOSIT = 5000;

  try {
    const computer = await Computer.findByPk(id);
    const user = await User.findByPk(userId);

    if (!computer || !user)
      return res.status(404).json({ message: "Lỗi dữ liệu." });

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
  const DEPOSIT = 5000;
  const t = await sequelize.transaction();

  try {
    const computer = await Computer.findByPk(computerId);
    const user = await User.findByPk(userId);

    if (!computer || !user) {
      await t.rollback();
      return res.status(404).json({ message: "Lỗi dữ liệu" });
    }

    if (computer.status === "dat truoc") {
      computer.status = "co nguoi";
      computer.current_user_id = userId;
      computer.session_start_time = new Date();
      user.status = "playing";
      user.balance += DEPOSIT;

      await computer.save({ transaction: t });
      await user.save({ transaction: t });
      await t.commit();

      res.json({ message: "Bắt đầu phiên chơi!", new_balance: user.balance });
    } else {
      await t.rollback();
      res.status(400).json({ message: "Trạng thái máy không hợp lệ." });
    }
  } catch (error) {
    await t.rollback();
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
  const DEPOSIT = 5000;
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

export const updateComputer = async (req, res) => {
  const { id } = req.params;
  const { status, action } = req.body;

  try {
    const comp = await Computer.findByPk(id);
    if (!comp) return res.status(404).json({ message: "Máy không tồn tại." });

    if (action === "delete") {
      if (comp.status === "co nguoi")
        return res
          .status(400)
          .json({ message: "Không thể xóa máy đang có người chơi!" });
      await comp.destroy();
      return res.json({ message: "Đã xóa máy." });
    }

    if (status) {
      if (status === "trong" || status === "bao tri" || status === "khoa") {
        comp.current_user_id = null;
        comp.session_start_time = null;
      }
      comp.status = status;
      await comp.save();
    }
    res.json({ message: "Cập nhật thành công.", computer: comp });
  } catch (error) {
    res.status(500).json({ message: "Lỗi cập nhật." });
  }
};
