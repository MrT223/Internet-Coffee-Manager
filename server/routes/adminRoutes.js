// routes/adminRoutes.js

const express = require("express");
const { protect } = require("../middleware/auth");
const { authorize } = require("../middleware/role");
const adminController = require("../controllers/adminController");
const router = express.Router();

router.put(
  "/users/:id/change-role",
  protect,
  authorize([1]), // CHỈ ADMIN
  adminController.changeUserRole
);

router.get(
  "/dashboard-summary",
  protect,
  authorize([1, 2]), // ADMIN VÀ STAFF
  adminController.getDashboardSummary
);

module.exports = router;
