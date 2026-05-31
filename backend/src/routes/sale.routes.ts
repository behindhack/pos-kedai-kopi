import { Router } from 'express';
import { getSales, createSale, updateSaleStatus, paySale } from '../controllers/sale.controller.js';
import { authenticate, requireRole } from '../middlewares/auth.middleware.js';
import { validateRequest } from '../middlewares/validate.middleware.js';
import { createSaleSchema } from '../utils/validationSchemas.js';

const router = Router();

// Everyone can view sales/orders (Barista needs to see orders, Owner/Cashier need history)
router.get('/', authenticate, getSales);

// Cashiers and Owners can create sales
router.post('/', authenticate, requireRole(['CASHIER', 'OWNER']), validateRequest(createSaleSchema), createSale);

// Barista, Cashier, Owner can update status (Barista marks PREPARING/READY, Cashier marks COMPLETED)
router.put('/:id/status', authenticate, updateSaleStatus);

// Cashier, Owner can pay unpaid sales
router.put('/:id/pay', authenticate, requireRole(['CASHIER', 'OWNER']), paySale);

export default router;
