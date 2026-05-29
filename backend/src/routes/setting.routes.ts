import { Router } from 'express';
import { getSettings, updateSettings } from '../controllers/setting.controller.js';
import { authenticate, requireRole } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/', authenticate, getSettings);
router.put('/', authenticate, requireRole(['OWNER']), updateSettings);

export default router;
