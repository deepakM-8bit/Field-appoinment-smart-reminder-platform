import express from 'express';
import authenticate from '../Middleware/authMiddleware.js';
import { approveRepair, completeDiagnosis, createAppointment, getAppointmentById, getTodayAppointmentsForTechnician, listPendingApprovals } from '../Controllers/appointmentController.js';

const router = express.Router();

router.post("/diagnosis",authenticate,createAppointment)
router.post("/:id/diagnosis-complete",authenticate,completeDiagnosis);
router.post("/:id/repair-approval",authenticate,approveRepair)
router.get("/technician/today",authenticate,getTodayAppointmentsForTechnician)
router.get("/:id",authenticate,getAppointmentById);
router.get("/pending-approvals",authenticate,listPendingApprovals);

export default router;