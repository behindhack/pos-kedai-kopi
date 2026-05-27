import { Router } from 'express';
import { getProducts, createProduct, updateProduct, deleteProduct } from '../controllers/product.controller';
import { authenticate, requireRole } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', authenticate, getProducts);
router.post('/', authenticate, requireRole(['OWNER']), createProduct);
router.put('/:id', authenticate, requireRole(['OWNER']), updateProduct);
router.delete('/:id', authenticate, requireRole(['OWNER']), deleteProduct);

export default router;
