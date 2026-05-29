import { Request, Response } from 'express';
import prisma from '../lib/prisma.js';

export const getProducts = async (_req: Request, res: Response) => {
  try {
    const products = await prisma.product.findMany({
      where: { isActive: true },
      include: {
        variants: true,
        recipe: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const formatted = products.map((p) => ({
      id: p.id,
      name: p.name,
      category: p.category,
      basePrice: Number(p.basePrice),
      variants: p.variants.map((v) => ({
        id: v.id,
        name: v.name,
        extraPrice: Number(v.extraPrice),
      })),
      recipe: p.recipe.map((r) => ({
        materialId: r.materialId,
        quantity: Number(r.quantity),
      })),
      image: p.image,
      stock: Number(p.stock),
      isActive: p.isActive,
    }));

    res.json(formatted);
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const createProduct = async (req: Request, res: Response) => {
  try {
    const { name, category, basePrice, image, stock, variants, recipe } = req.body;

    const product = await prisma.product.create({
      data: {
        name,
        category,
        basePrice: Number(basePrice),
        image: image || null,
        stock: Number(stock || 0),
        variants: {
          create: (variants || []).map((v: any) => ({
            name: v.name,
            extraPrice: Number(v.extraPrice || 0),
          })),
        },
        recipe: {
          create: (recipe || []).map((r: any) => ({
            materialId: Number(r.materialId),
            quantity: Number(r.quantity),
          })),
        },
      },
      include: { variants: true, recipe: true },
    });

    res.status(201).json({
      id: product.id,
      name: product.name,
      category: product.category,
      basePrice: Number(product.basePrice),
      variants: product.variants.map((v) => ({ id: v.id, name: v.name, extraPrice: Number(v.extraPrice) })),
      recipe: product.recipe.map((r) => ({ materialId: r.materialId, quantity: Number(r.quantity) })),
      image: product.image,
      stock: Number(product.stock),
      isActive: product.isActive,
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(400).json({ error: 'Bad request' });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, category, basePrice, image, stock, isActive, variants, recipe } = req.body;

    // Delete existing variants and recipe, then recreate
    await prisma.productVariant.deleteMany({ where: { productId: Number(id) } });
    await prisma.productRecipe.deleteMany({ where: { productId: Number(id) } });

    const product = await prisma.product.update({
      where: { id: Number(id) },
      data: {
        ...(name !== undefined && { name }),
        ...(category !== undefined && { category }),
        ...(basePrice !== undefined && { basePrice: Number(basePrice) }),
        ...(image !== undefined && { image }),
        ...(stock !== undefined && { stock: Number(stock) }),
        ...(isActive !== undefined && { isActive }),
        variants: {
          create: (variants || []).map((v: any) => ({
            name: v.name,
            extraPrice: Number(v.extraPrice || 0),
          })),
        },
        recipe: {
          create: (recipe || []).map((r: any) => ({
            materialId: Number(r.materialId),
            quantity: Number(r.quantity),
          })),
        },
      },
      include: { variants: true, recipe: true },
    });

    res.json({
      id: product.id,
      name: product.name,
      category: product.category,
      basePrice: Number(product.basePrice),
      variants: product.variants.map((v) => ({ id: v.id, name: v.name, extraPrice: Number(v.extraPrice) })),
      recipe: product.recipe.map((r) => ({ materialId: r.materialId, quantity: Number(r.quantity) })),
      image: product.image,
      stock: Number(product.stock),
      isActive: product.isActive,
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(400).json({ error: 'Bad request' });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.product.update({
      where: { id: Number(id) },
      data: { isActive: false },
    });
    res.json({ message: 'Product deleted' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(400).json({ error: 'Bad request' });
  }
};
