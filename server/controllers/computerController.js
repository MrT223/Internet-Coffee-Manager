import Computer from "../models/Computer.js";
import User from "../models/User.js";

// 1. Lấy danh sách máy
export const getAllComputers = async (req, res) => {
  try {
    const computers = await Computer.findAll({
      order: [["computer_id", "ASC"]],
    });
    res.json(computers);
  } catch (error) {
    res.status(500).json({ message: "Lỗi lấy dữ liệu máy." });
  }
};

// 2. Thêm máy mới (Admin)
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

// 3. Cập nhật trạng thái / Xóa máy
export const updateComputer = async (req, res) => {
  const { id } = req.params;
  const { status, action } = req.body;

  try {
    const comp = await Computer.findByPk(id);
    if (!comp) return res.status(404).json({ message: "Máy không tồn tại." });

    if (action === "delete") {
      await comp.destroy();
      return res.json({ message: "Đã xóa máy." });
    }

    if (status) {
      comp.status = status;
      await comp.save();
    }
    res.json({ message: "Cập nhật thành công.", computer: comp });
  } catch (error) {
    res.status(500).json({ message: "Lỗi cập nhật." });
  }
};

// 4. Đặt máy (User)
export const bookComputer = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.user_id;
  const DEPOSIT = 5000;

  try {
    const computer = await Computer.findByPk(id);
    const user = await User.findByPk(userId);

    if (!computer)
      return res.status(404).json({ message: "Máy không tồn tại." });

    if (computer.status !== "trong") {
      return res.status(400).json({
        message: "Máy này không thể đặt (Đang có người hoặc bảo trì).",
      });
    }

    if (user.balance < DEPOSIT) {
      return res
        .status(400)
        .json({ message: "Số dư không đủ 5.000đ để đặt cọc." });
    }

    user.balance -= DEPOSIT;
    await user.save();

    computer.status = "dat truoc";
    await computer.save();

    res.json({
      message: "Đặt máy thành công! Đã trừ 5.000đ.",
      newBalance: user.balance,
      computer: computer,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi server." });
  }
};
