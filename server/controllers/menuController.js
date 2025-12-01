import MenuItem from "../models/MenuItem.js";

export const getMenu = async (req, res) => {
  try {
    const items = await MenuItem.findAll({ order: [["item_id", "ASC"]] });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: "Lỗi tải menu." });
  }
};

export const addMenuItem = async (req, res) => {
  const { food_name, price, image_url } = req.body;
  try {
    const newItem = await MenuItem.create({
      food_name,
      price,
      stock: true,
      image_url,
    });
    res.status(201).json(newItem);
  } catch (error) {
    res.status(500).json({ message: "Lỗi thêm món." });
  }
};

export const updateMenuItem = async (req, res) => {
  const { id } = req.params;
  const { food_name, price, stock, image_url } = req.body;

  try {
    const item = await MenuItem.findByPk(id);
    if (!item) return res.status(404).json({ message: "Món không tồn tại." });

    if (food_name) item.food_name = food_name;
    if (price) item.price = price;
    if (stock !== undefined) item.stock = stock;
    if (image_url) item.image_url = image_url;

    await item.save();
    res.json({ message: "Cập nhật thành công", item });
  } catch (error) {
    res.status(500).json({ message: "Lỗi cập nhật." });
  }
};

export const deleteMenuItem = async (req, res) => {
  const { id } = req.params;
  try {
    await MenuItem.destroy({ where: { item_id: id } });
    res.json({ message: "Đã xóa món ăn." });
  } catch (error) {
    res.status(500).json({ message: "Lỗi xóa món." });
  }
};
