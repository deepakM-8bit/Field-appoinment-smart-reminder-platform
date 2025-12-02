import express from "express";
import { authenticate } from "../Middleware/authMiddleware.js";
import { signUpUser,loginUser,technicianLogin } from "../Controllers/authController.js";

const router = express.Router();

router.post("/signup",signUpUser);
router.post("/login",loginUser)
router.post("/technician-login",technicianLogin);

router.get("/test", authenticate, (req, res) => {
    res.json({
        message: "Authenticated Successfully",
        user: req.user
    });
});


export default router;