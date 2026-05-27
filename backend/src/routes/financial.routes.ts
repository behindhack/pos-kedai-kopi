import { Router } from 'express';
import {
  calculateProfitLoss,
  createFinancialReport,
  getFinancialReports,
  getLatestFinancialMetrics,
  deleteFinancialReport
} from '../controllers/financial.controller';
import { authenticate, requireRole } from '../middlewares/auth.middleware';

const router = Router();

// Secure all financial routes, accessible by OWNER (and maybe manager if implemented)
router.use(authenticate);
router.use(requireRole(['OWNER']));

router.get('/', getFinancialReports);
router.post('/', createFinancialReport);
router.post('/calculate', calculateProfitLoss);
router.get('/metrics', getLatestFinancialMetrics);
router.delete('/:id', deleteFinancialReport);

export default router;
