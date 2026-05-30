import Joi from 'joi';

// Auth Schemas
export const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  name: Joi.string().min(2).max(100).required(),
  role: Joi.string().valid('OWNER', 'CASHIER', 'BARISTA').optional()
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

// Product Schemas
export const createProductSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  category: Joi.string().required(),
  price: Joi.number().min(0).required(),
  stock: Joi.number().integer().min(0).required(),
  image: Joi.string().uri().allow(null, '').optional(),
  isAvailable: Joi.boolean().optional()
});

export const updateProductSchema = Joi.object({
  name: Joi.string().min(2).max(100).optional(),
  category: Joi.string().optional(),
  price: Joi.number().min(0).optional(),
  stock: Joi.number().integer().min(0).optional(),
  image: Joi.string().uri().allow(null, '').optional(),
  isAvailable: Joi.boolean().optional()
}).min(1); // At least one field must be updated

// Sale Schemas
export const createSaleSchema = Joi.object({
  customerName: Joi.string().allow('', null).optional(),
  orderType: Joi.string().valid('DINE_IN', 'TAKE_AWAY').required(),
  items: Joi.array().items(
    Joi.object({
      product: Joi.object({
        id: Joi.alternatives().try(Joi.string(), Joi.number()).required(),
        name: Joi.string().required(),
        category: Joi.string().allow('', null).optional(),
        basePrice: Joi.number().min(0).required(),
        variants: Joi.array().optional()
      }).unknown(true).required(),
      qty: Joi.number().integer().min(1).required(),
      selectedVariantIds: Joi.array().items(Joi.string()).optional(),
      note: Joi.string().allow('', null).optional()
    }).unknown(true)
  ).min(1).required(),
  subtotal: Joi.number().min(0).required(),
  discount: Joi.number().min(0).required(),
  tax: Joi.number().min(0).required(),
  total: Joi.number().min(0).required(),
  paymentMethod: Joi.string().valid('CASH', 'QRIS', 'TRANSFER').required(),
  paidAmount: Joi.number().min(0).required()
});
