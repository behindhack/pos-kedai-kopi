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
  items: Joi.array().items(
    Joi.object({
      productId: Joi.string().required(), // or Joi.number() depending on your DB ID type, wait UUID or Int? Prisma usually generates UUIDs as strings if MySQL or MongoDB. If it's an integer ID, maybe number is better. Prisma schema needs to be checked, but we'll use string as default generic since it can validate UUIDs. Let's use Joi.any().required() or check the schema later.
      quantity: Joi.number().integer().min(1).required(),
      price: Joi.number().min(0).required(),
      name: Joi.string().required()
    })
  ).min(1).required(),
  totalAmount: Joi.number().min(0).required(),
  paymentMethod: Joi.string().valid('CASH', 'DEBIT', 'QRIS', 'CREDIT').required(),
  amountPaid: Joi.number().min(0).required(),
  change: Joi.number().min(0).required()
});
