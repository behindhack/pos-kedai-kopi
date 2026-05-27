import { Request, Response } from 'express';
import Product from '../models/Product';

export const getProducts = async (req: Request, res: Response) => {
  try {
    const products = await Product.find({ isActive: true });
    // Transform to match frontend expected structure
    const formatted = products.map((p) => ({
      id: p._id,
      name: p.name,
      category: p.category,
      basePrice: p.basePrice,
      variants: p.variants.map((v) => ({
        id: v._id || v.name,
        name: v.name,
        extraPrice: v.extraPrice,
      })),
      image: p.image,
      isActive: p.isActive,
    }));
    res.json(formatted);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const createProduct = async (req: Request, res: Response) => {
  try {
    const product = new Product(req.body);
    await product.save();
    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({ error: 'Bad request' });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const product = await Product.findByIdAndUpdate(id, req.body, { new: true });
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (error) {
    res.status(400).json({ error: 'Bad request' });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const product = await Product.findByIdAndUpdate(id, { isActive: false }, { new: true });
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json({ message: 'Product deleted' });
  } catch (error) {
    res.status(400).json({ error: 'Bad request' });
  }
};
