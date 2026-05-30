import { Router } from 'express';
import { getProducts, createProduct, updateProduct, deleteProduct } from '../controllers/product.controller.js';
import { authenticate, requireRole } from '../middlewares/auth.middleware.js';
import { validateRequest } from '../middlewares/validate.middleware.js';
import { createProductSchema, updateProductSchema } from '../utils/validationSchemas.js';

const router = Router();

router.get('/', authenticate, getProducts);
router.post('/', authenticate, requireRole(['OWNER']), validateRequest(createProductSchema), createProduct);
router.put('/:id', authenticate, requireRole(['OWNER']), validateRequest(updateProductSchema), updateProduct);
router.delete('/:id', authenticate, requireRole(['OWNER']), deleteProduct);

export default router;
