import express from 'express';
import authenticate from '../Middleware/authMiddleware.js';
import { approveRepair, completeDiagnosis, createAppointment } from '../Controllers/appointmentController.js';

const router = express.Router();

router.post("/diagnosis",authenticate,createAppointment)
router.post("/:id/diagnosis-complete",authenticate,completeDiagnosis);
router.post("/:id/repair-approval",authenticate,approveRepair)

export default router;