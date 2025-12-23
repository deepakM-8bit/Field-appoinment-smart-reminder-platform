import express from 'express';
import authenticate from '../Middleware/authMiddleware.js';
import { completeDiagnosis, createAppointment } from '../Controllers/appointmentController.js';

const router = express.Router();

router.post("/diagnosis",authenticate,createAppointment)
router.post("/:id/diagnosis-complete",authenticate,completeDiagnosis);

export default router;