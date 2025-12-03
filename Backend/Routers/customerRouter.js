import express from "express";
import authenticate from "../Middleware/authMiddleware.js"
import { getCustomer } from "../Controllers/customerController.js";

const router = express.Router();

router.get("/",authenticate,getCustomer);

export default router;