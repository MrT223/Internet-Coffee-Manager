import express from "express";
const router = express.Router();
import {
  getActivePromotions,
  getActiveTopupBonus,
  getAllPromotions,
  createPromotion,
  updatePromotion,
  deletePromotion,
  togglePromotion,
} from "../controllers/promotionController.js";
import { protect } from "../middleware/auth.js";
import { authorize } from "../middleware/role.js";

const authenticateToken = protect;
const isAdmin = authorize([1]);

// Public routes (user)
router.get("/active", getActivePromotions);
router.get("/topup-bonus", getActiveTopupBonus);

// Admin routes
router.get("/", authenticateToken, isAdmin, getAllPromotions);
router.post("/", authenticateToken, isAdmin, createPromotion);
router.put("/:id", authenticateToken, isAdmin, updatePromotion);
router.delete("/:id", authenticateToken, isAdmin, deletePromotion);
router.patch("/:id/toggle", authenticateToken, isAdmin, togglePromotion);

export default router;
