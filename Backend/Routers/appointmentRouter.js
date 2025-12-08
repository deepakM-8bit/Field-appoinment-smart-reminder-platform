import express from 'express';
import authenticate from '../Middleware/authMiddleware.js';
import { createAppointment } from '../Controllers/appointmentController.js';

const router = express.Router();

router.post("/diagnosis",authenticate,createAppointment)

export default router;