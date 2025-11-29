import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);

// Route kiểm tra
app.get("/", (req, res) => {
  res.send("Server (ES Modules) đang chạy!");
});

const PORT = process.env.PORT || 3636;
app.listen(PORT, () => {
  console.log(`Server đang chạy trên cổng ${PORT}`);
});
