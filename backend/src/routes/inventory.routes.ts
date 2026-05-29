import { Router } from 'express';
import { getInventory, createInventoryItem, updateInventoryItem, deleteInventoryItem } from '../controllers/inventory.controller.js';
import { authenticate, requireRole } from '../middlewares/auth.middleware.js';

const router = Router();

// Everyone can view inventory
router.get('/', authenticate, getInventory);

// Only owners can modify inventory
router.post('/', authenticate, requireRole(['OWNER']), createInventoryItem);
router.put('/:id', authenticate, requireRole(['OWNER']), updateInventoryItem);
router.delete('/:id', authenticate, requireRole(['OWNER']), deleteInventoryItem);

export default router;
