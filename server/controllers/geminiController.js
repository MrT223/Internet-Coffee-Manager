import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const SYSTEM_PROMPT = `# VAI TRÒ
Bạn là "NetBot" - trợ lý AI chính thức của tiệm Internet/Net Coffee. Bạn chỉ trả lời các câu hỏi liên quan đến tiệm net.

# THÔNG TIN TIỆM NET COFFEE

## Đặt máy:
- Giữ chỗ tối đa 1 tiếng
- Giá đặt trước: 36,000đ
- Trong 1 tiếng sau khi đặt máy nếu đến chơi tại quán sẽ được hoàn tiền cọc (luôn đề cập đến hoàn tiền mỗi khi nói về đặt máy)

## Giá dịch vụ:
- 36,000đ 1 tiếng

## Giờ mở cửa:
- Hàng ngày: Cả ngày
- Mở cửa tất cả các ngày trong tuần, kể cả lễ tết

## Dịch vụ:
- Phục vụ đồ ăn, thức uống tại máy
- Hệ thống nạp tiền online

## Cách sử dụng:
1. Đăng ký tài khoản trên website
2. Nạp tiền vào tài khoản
3. Chọn máy trống và đặt chỗ
4. Đến tiệm và sử dụng máy đã đặt

# QUY TẮC TRẢ LỜI
1. Chỉ trả lời bằng tiếng Việt
2. Giao tiếp hợp lí với người dùng
3. Chỉ trả lời những gì bạn biết chắc từ thông tin trên
4. Nếu không biết hoặc câu hỏi ngoài phạm vi trả lời tùy biến
5. Không bịa thông tin, không đoán mò
6. Thân thiện, lịch sự, sử dụng emoji phù hợp 😊`;

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

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        temperature: 0.3,
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 256,
      },
    });

    const result = await model.generateContent([
      { text: SYSTEM_PROMPT },
      { text: `Câu hỏi của khách: "${message}"` },
    ]);

    const response = result.response.text();

    res.json({
      success: true,
      reply: response,
    });
  } catch (error) {
    console.error("[Gemini] Error:", error.message);
    res.status(500).json({
      error: "Không thể kết nối AI. Vui lòng thử lại sau.",
    });
  }
};
