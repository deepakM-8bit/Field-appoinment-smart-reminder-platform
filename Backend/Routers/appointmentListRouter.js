import express from "express";
import authenticate from "../Middleware/authMiddleware.js";
import { getAdminAppointmentsList, cancelAppointment, getAdminAppointmentDetailById } from "../Controllers/appointmentListController.js";


const router = express.Router();

router.get("/admin-list", authenticate, getAdminAppointmentsList);
router.get("/admin/:id",authenticate,getAdminAppointmentDetailById)
router.post("/:id/cancel", authenticate, cancelAppointment);

export default router;
