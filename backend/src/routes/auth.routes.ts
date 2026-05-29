import { Router } from 'express';
import { login, register, getMe, forgotPassword, resetPassword, checkSetupStatus } from '../controllers/auth.controller.js';
import { authenticate, requireRole } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/setup-status', checkSetupStatus);
router.post('/login', login);
// Authentication and role check will be handled inside the controller
router.post('/register', register);
router.get('/me', authenticate, getMe);

router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

export default router;
