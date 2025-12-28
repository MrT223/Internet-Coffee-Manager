import Promotion from "../models/Promotion.js";
import { Op } from "sequelize";

// Lấy promotions đang active (public - cho user)
export const getActivePromotions = async (req, res) => {
  try {
    const now = new Date();
    const promotions = await Promotion.findAll({
      where: {
        is_active: true,
        start_date: { [Op.lte]: now },
        end_date: { [Op.gte]: now }
      },
      order: [["created_at", "DESC"]],
    });
    res.json(promotions);
  } catch (error) {
    console.error("Error fetching active promotions:", error);
    res.status(500).json({ error: "Lỗi khi lấy danh sách khuyến mãi" });
  }
};

// Lấy promotion topup_bonus đang active (để áp dụng khi nạp tiền)
export const getActiveTopupBonus = async (req, res) => {
  try {
    const now = new Date();
    const promotion = await Promotion.findOne({
      where: {
        is_active: true,
        type: 'topup_bonus',
        start_date: { [Op.lte]: now },
        end_date: { [Op.gte]: now }
      },
      order: [["bonus_percent", "DESC"]], // Lấy promotion có bonus cao nhất
    });
    res.json(promotion);
  } catch (error) {
    console.error("Error fetching topup bonus:", error);
    res.status(500).json({ error: "Lỗi khi lấy khuyến mãi nạp tiền" });
  }
};

// Lấy tất cả promotions (admin)
export const getAllPromotions = async (req, res) => {
  try {
    const promotions = await Promotion.findAll({
      order: [["created_at", "DESC"]],
    });
    res.json(promotions);
  } catch (error) {
    console.error("Error fetching all promotions:", error);
    res.status(500).json({ error: "Lỗi khi lấy danh sách khuyến mãi" });
  }
};

// Tạo promotion mới
export const createPromotion = async (req, res) => {
  try {
    const { title, description, type, bonus_percent, min_amount, start_date, end_date, is_active, image_url } = req.body;
    
    if (!title || !start_date || !end_date) {
      return res.status(400).json({ error: "Thiếu thông tin bắt buộc" });
    }

    const promotion = await Promotion.create({
      title,
      description,
      type: type || 'announcement',
      bonus_percent: bonus_percent || 0,
      min_amount: min_amount || 0,
      start_date: new Date(start_date),
      end_date: new Date(end_date),
      is_active: is_active !== undefined ? is_active : true,
      image_url,
    });

    res.status(201).json(promotion);
  } catch (error) {
    console.error("Error creating promotion:", error);
    res.status(500).json({ error: "Lỗi khi tạo khuyến mãi" });
  }
};

// Cập nhật promotion
export const updatePromotion = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, type, bonus_percent, min_amount, start_date, end_date, is_active, image_url } = req.body;

    const promotion = await Promotion.findByPk(id);
    if (!promotion) {
      return res.status(404).json({ error: "Không tìm thấy khuyến mãi" });
    }

    await promotion.update({
      title: title || promotion.title,
      description: description !== undefined ? description : promotion.description,
      type: type || promotion.type,
      bonus_percent: bonus_percent !== undefined ? bonus_percent : promotion.bonus_percent,
      min_amount: min_amount !== undefined ? min_amount : promotion.min_amount,
      start_date: start_date ? new Date(start_date) : promotion.start_date,
      end_date: end_date ? new Date(end_date) : promotion.end_date,
      is_active: is_active !== undefined ? is_active : promotion.is_active,
      image_url: image_url !== undefined ? image_url : promotion.image_url,
    });

    res.json(promotion);
  } catch (error) {
    console.error("Error updating promotion:", error);
    res.status(500).json({ error: "Lỗi khi cập nhật khuyến mãi" });
  }
};

// Xóa promotion
export const deletePromotion = async (req, res) => {
  try {
    const { id } = req.params;
    const promotion = await Promotion.findByPk(id);
    
    if (!promotion) {
      return res.status(404).json({ error: "Không tìm thấy khuyến mãi" });
    }

    await promotion.destroy();
    res.json({ message: "Đã xóa khuyến mãi thành công" });
  } catch (error) {
    console.error("Error deleting promotion:", error);
    res.status(500).json({ error: "Lỗi khi xóa khuyến mãi" });
  }
};

// Toggle trạng thái active
export const togglePromotion = async (req, res) => {
  try {
    const { id } = req.params;
    const promotion = await Promotion.findByPk(id);
    
    if (!promotion) {
      return res.status(404).json({ error: "Không tìm thấy khuyến mãi" });
    }

    await promotion.update({ is_active: !promotion.is_active });
    res.json(promotion);
  } catch (error) {
    console.error("Error toggling promotion:", error);
    res.status(500).json({ error: "Lỗi khi thay đổi trạng thái" });
  }
};
