import express from "express";
import { requestDiagnosisOtp,verifyDiagnosisOtp } from "../Controllers/otpController.js";
import authenticate from '../Middleware/authMiddleware.js';

const router = express.Router();

router.post("/appointments/:id/request-otp",authenticate,requestDiagnosisOtp);
router.post("/appointments/:id/verify-otp",authenticate,verifyDiagnosisOtp);

export default router;