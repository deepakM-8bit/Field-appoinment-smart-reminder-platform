import express from "express";
import {
  requestPasswordOtp,
  verifyPasswordOtp,
  resetPasswordWithOtp,
} from "../Controllers/authOtpController.js";

const router = express.Router();

router.post("/password-otp/request", requestPasswordOtp);
router.post("/password-otp/verify", verifyPasswordOtp);
router.post("/password-otp/reset", resetPasswordWithOtp);

export default router;
