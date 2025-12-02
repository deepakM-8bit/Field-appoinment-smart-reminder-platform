import { addTechnicians,getTechnicians } from "../Controllers/technicianController.js";
import { authenticate } from "../Middleware/authMiddleware.js";
import express from "express";

const router = express.Router();

router.get("/",authenticate,getTechnicians);
router.post("/",authenticate,addTechnicians);

export default router;