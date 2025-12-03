import express from "express";
import authenticate from "../Middleware/authMiddleware.js";
import { addCustomer, getCustomer } from "../Controllers/customerController.js";

const router = express.Router();

router.get("/",authenticate,getCustomer);
router.post("/",authenticate,addCustomer);

export default router;