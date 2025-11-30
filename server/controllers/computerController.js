import Computer from "../models/Computer.js";
import User from "../models/User.js";

export const getAllComputers = async (req, res) => {
  try {
    const computers = await Computer.findAll();
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

export const updateComputer = async (req, res) => {
  const { id } = req.params;
  const { status, action } = req.body;

  try {
    const comp = await Computer.findByPk(id);
    if (!comp) return res.status(404).json({ message: "Máy không tồn tại." });

    if (action === "delete") {
      await comp.destroy();
      return res.json({ message: "Đã xóa máy khỏi vị trí này." });
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

export const bookComputer = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.user_id;
  const DEPOSIT_AMOUNT = 5000;

  try {
    const computer = await Computer.findByPk(id);
    const user = await User.findByPk(userId);

    if (!computer)
      return res.status(404).json({ message: "Máy không tồn tại." });
    if (!user)
      return res.status(404).json({ message: "Người dùng không tồn tại." });

    if (computer.status !== "trong") {
      return res
        .status(400)
        .json({ message: "Máy này đã có người hoặc đang bảo trì!" });
    }

    if (user.balance < DEPOSIT_AMOUNT) {
      return res
        .status(400)
        .json({ message: "Số dư không đủ để đặt cọc (Cần tối thiểu 5.000đ)." });
    }

    user.balance -= DEPOSIT_AMOUNT;
    await user.save();

    computer.status = "dat truoc";
    await computer.save();

    res.json({
      message: "Đặt máy thành công! Đã trừ 5.000đ.",
      new_balance: user.balance,
      computer: computer,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi server khi đặt máy." });
  }
};
