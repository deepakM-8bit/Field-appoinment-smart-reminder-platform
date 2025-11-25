import express, { Router } from 'express'
import { signUpUser,loginUser } from '../Controllers/authController.js';
const router = express(Router);

router.post('/signUp',signUpUser);
router.post('/login',loginUser)

export default router;