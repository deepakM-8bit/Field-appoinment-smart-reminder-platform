import express from 'express';
import authenticate from '../Middleware/authMiddleware.js';
import { getUnassignedAppointments, assignTechnicianManually, approveRepair, completeDiagnosis, createAppointment, getAppointmentById, getTodayAppointmentsForTechnician, listPendingApprovals } from '../Controllers/appointmentController.js';

const router = express.Router();

router.post("/diagnosis",authenticate,createAppointment);
router.get("/technician/today",authenticate,getTodayAppointmentsForTechnician);
router.get("/pending-approvals",authenticate,listPendingApprovals);
router.get("/unassigned", authenticate, getUnassignedAppointments);
router.get("/:id",authenticate,getAppointmentById);
router.post("/:id/diagnosis-complete",authenticate,completeDiagnosis);
router.post("/:id/repair-approval",authenticate,approveRepair);
router.post("/:id/assign-technician", authenticate, assignTechnicianManually);


export default router;