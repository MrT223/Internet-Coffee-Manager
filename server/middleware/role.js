export const authorize = (roles = []) => {
  if (typeof roles === "string") {
    roles = [roles];
  }

  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Chưa đăng nhập." });
    }

    const userRoleId = req.user.role_id;

    if (!roles.includes(userRoleId)) {
      return res.status(403).json({
        message: "Bạn không có quyền truy cập chức năng này.",
      });
    }
    next();
  };
};
