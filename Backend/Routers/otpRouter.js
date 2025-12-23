import express from "express";
import { requestDiagnosisOtp,verifyDiagnosisOtp } from "../Controllers/otpController.js";
import authenticate from '../Middleware/authMiddleware.js';

const router = express.Router();

router.post("/appointment/:id/request-otp",authenticate,requestDiagnosisOtp);
router.post("/appointment/:id/verify-otp",authenticate,verifyDiagnosisOtp);

export default router;