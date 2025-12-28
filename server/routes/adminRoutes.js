import express from "express";
import { protect } from "../middleware/auth.js";
import { authorize } from "../middleware/role.js";
import * as adminController from "../controllers/adminController.js";

const router = express.Router();

router.use(protect, authorize([1]));

router.get("/users", adminController.getAllUsers);

router.post("/users", adminController.createUser);

router.delete("/users/:id", adminController.deleteUser);

router.put("/users/:id/topup", adminController.topUpBalance);

router.put("/users/:id/role", adminController.changeUserRole);

router.put("/users/:id/lock", adminController.toggleLockUser);

router.put("/users/:id/reset-password", adminController.resetPassword);

router.get("/stats", protect, authorize([1, 2]), adminController.getDashboardStats);

export default router;

