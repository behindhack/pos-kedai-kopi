import { Router } from 'express';
import { login, register, getMe } from '../controllers/auth.controller';
import { authenticate, requireRole } from '../middlewares/auth.middleware';

const router = Router();

router.post('/login', login);
// Authentication and role check will be handled inside the controller
router.post('/register', register);
router.get('/me', authenticate, getMe);

export default router;
