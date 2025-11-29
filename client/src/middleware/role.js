exports.authorize = (roles = []) => {
  if (typeof roles === "string") {
    roles = [roles];
  }

  return (req, res, next) => {
    const userRoleId = req.user.role_id;

    if (!roles.includes(userRoleId)) {
      return res.status(403).json({
        message: "Bạn không có quyền truy cập chức năng này.",
      });
    }
    next();
  };
};
