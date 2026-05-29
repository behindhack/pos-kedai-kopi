import { Router } from 'express';
import { getUsers, deleteUser, updateUser, createUser } from '../controllers/user.controller.js';
import { authenticate, requireRole } from '../middlewares/auth.middleware.js';

const router = Router();

// Protect all user routes, only OWNER can access
router.use(authenticate);
router.use(requireRole(['OWNER']));

router.get('/', getUsers);
router.post('/', createUser);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

export default router;
