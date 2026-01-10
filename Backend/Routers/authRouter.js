import express from "express";
import { signUpUser,loginUser,technicianLogin,technicanResetPassword } from "../Controllers/authController.js";

const router = express.Router();

router.post("/signup",signUpUser);
router.post("/login",loginUser);
router.post("/technician-login",technicianLogin);
router.post("/technician-passwordUpdate",technicanResetPassword);

export default router;