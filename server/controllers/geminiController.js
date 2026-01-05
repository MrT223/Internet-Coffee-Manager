import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const SYSTEM_PROMPT = `Bạn là trợ lý AI của tiệm Net Coffee. Hãy trả lời thân thiện, ngắn gọn bằng tiếng Việt.

Thông tin tiệm:
- Giá máy: 10,000đ/giờ (thường), 15,000đ/giờ (VIP)
- Mở cửa: 8h sáng - 11h đêm hàng ngày
- Có phục vụ đồ ăn, thức uống
- Địa chỉ: Liên hệ quản lý để biết thêm

Nếu không biết thông tin cụ thể, hãy gợi ý khách liên hệ nhân viên qua chat hỗ trợ.`;

// Chat với AI
export const chatWithAI = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ error: "Vui lòng nhập tin nhắn" });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: "Chưa cấu hình Gemini API Key" });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const result = await model.generateContent([
      { text: SYSTEM_PROMPT },
      { text: `Khách hỏi: ${message}` }
    ]);

    const response = result.response.text();

    res.json({ 
      success: true, 
      reply: response 
    });
  } catch (error) {
    console.error("[Gemini] Error:", error.message);
    res.status(500).json({ 
      error: "Không thể kết nối AI. Vui lòng thử lại sau." 
    });
  }
};
