import express from "express";
import { chatWithAI } from "../controllers/geminiController.js";

const router = express.Router();

// POST /api/ai/chat - Chat với AI
router.post("/chat", chatWithAI);

export default router;
