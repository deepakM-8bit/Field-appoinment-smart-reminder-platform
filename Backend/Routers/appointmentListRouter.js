import express from "express";
import authenticate from "../Middleware/authMiddleware.js";
import { getAdminAppointmentsList, cancelAppointment } from "../Controllers/appointmentListController.js";


const router = express.Router();

router.get("/admin-list", authenticate, getAdminAppointmentsList);
router.post("/:id/cancel", authenticate, cancelAppointment);

export default router;
