import express from "express";
import { requestOtp,verifyOtp } from "../Controllers/otpController.js";
import authenticate from '../Middleware/authMiddleware.js';

const router = express.Router();

router.post("/:id/request-diagnosis-otp", authenticate, requestOtp("start_diagnosis"));
router.post("/:id/verify-diagnosis-otp", authenticate, verifyOtp("start_diagnosis"));

router.post("/:id/request-repair-otp", authenticate, requestOtp("start_repair"));
router.post("/:id/verify-repair-otp", authenticate, verifyOtp("start_repair"));

router.post("/:id/request-payment-otp", authenticate, requestOtp("payment"));
router.post("/:id/verify-payment-otp", authenticate, verifyOtp("payment"));


export default router;