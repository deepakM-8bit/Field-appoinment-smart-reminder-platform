import express from "express";
import authenticate from "../Middleware/authMiddleware.js";
import { getDashboardSummary } from "../Controllers/dashboardController.js";

const router = express.Router();

router.get("/summary", authenticate, getDashboardSummary);

export default router;
