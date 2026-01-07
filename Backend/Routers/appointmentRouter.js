import express from 'express';
import authenticate from '../Middleware/authMiddleware.js';
import { approveRepair, completeDiagnosis, createAppointment, getAppointmentById, getTodayAppointmentsForTechnician, listPendingApprovals } from '../Controllers/appointmentController.js';

const router = express.Router();

router.post("/diagnosis",authenticate,createAppointment);
router.get("/technician/today",authenticate,getTodayAppointmentsForTechnician);
router.get("/pending-approvals",authenticate,listPendingApprovals);
router.get("/:id",authenticate,getAppointmentById);
router.post("/:id/diagnosis-complete",authenticate,completeDiagnosis);
router.post("/:id/repair-approval",authenticate,approveRepair);


export default router;