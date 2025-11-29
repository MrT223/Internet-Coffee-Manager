import express from "express";
import { protect } from "../middleware/auth.js";
import { authorize } from "../middleware/role.js";
//import * as adminController from "../controllers/adminController.js";

const router = express.Router();

/*
router.put(
  "/users/:id/change-role",
  protect,
  authorize([1]), 
  adminController.changeUserRole
);

router.get(
  "/dashboard-summary",
  protect,
  authorize([1, 2]),
  adminController.getDashboardSummary
);
*/

export default router;
