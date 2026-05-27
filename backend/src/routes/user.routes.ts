import { Router } from 'express';
import { getUsers, deleteUser, updateUser } from '../controllers/user.controller';
import { authenticate, requireRole } from '../middlewares/auth.middleware';

const router = Router();

// Protect all user routes, only OWNER can access
router.use(authenticate);
router.use(requireRole(['OWNER']));

router.get('/', getUsers);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

export default router;
