import { Router } from 'express';
import { getSales, createSale, updateSaleStatus } from '../controllers/sale.controller.js';
import { authenticate, requireRole } from '../middlewares/auth.middleware.js';

const router = Router();

// Everyone can view sales/orders (Barista needs to see orders, Owner/Cashier need history)
router.get('/', authenticate, getSales);

// Cashiers and Owners can create sales
router.post('/', authenticate, requireRole(['CASHIER', 'OWNER']), createSale);

// Barista, Cashier, Owner can update status (Barista marks PREPARING/READY, Cashier marks COMPLETED)
router.put('/:id/status', authenticate, updateSaleStatus);

export default router;
