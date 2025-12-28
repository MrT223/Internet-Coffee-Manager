import jwt from "jsonwebtoken";

export const protect = (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  console.log("🔐 Auth Debug:", {
    hasAuth: !!req.headers.authorization,
    token: token ? token.substring(0, 20) + "..." : "NO TOKEN",
    jwtSecret: process.env.JWT_SECRET ? "SET ✅" : "NOT SET ❌"
  });

  if (!token) {
    return res
      .status(401)
      .json({ message: "Không có token, ủy quyền thất bại." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("✅ Token decoded:", decoded);
    req.user = decoded;
    next();
  } catch (error) {
    console.log("❌ Token error:", error.message);
    return res.status(401).json({ message: "Token không hợp lệ." });
  }
};
