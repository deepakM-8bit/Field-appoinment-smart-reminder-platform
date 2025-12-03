import express from "express";
import { signUpUser,loginUser,technicianLogin } from "../Controllers/authController.js";

const router = express.Router();

router.post("/signup",signUpUser);
router.post("/login",loginUser)
router.post("/technician-login",technicianLogin);

export default router;