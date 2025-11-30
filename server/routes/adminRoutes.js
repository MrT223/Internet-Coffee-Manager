import express from "express";
import { protect } from "../middleware/auth.js";
import { authorize } from "../middleware/role.js";
import * as adminController from "../controllers/adminController.js";

const router = express.Router();

router.get("/users", protect, authorize([1]), adminController.getAllUsers);

export default router;
