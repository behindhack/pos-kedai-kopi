import { Request, Response } from 'express';
import prisma from '../lib/prisma.js';

const formatMaterial = (item: any) => ({
  id: item.id,
  name: item.name,
  category: item.category,
  quantity: Number(item.quantity),
  unit: item.unit,
  minQuantity: Number(item.minQuantity),
  costPerUnit: Number(item.costPerUnit),
  supplier: item.supplier || '',
  totalCost: Number(item.totalCost),
  isActive: item.isActive,
  createdAt: item.createdAt?.toISOString(),
  updatedAt: item.updatedAt?.toISOString(),
});

export const getInventory = async (_req: Request, res: Response) => {
  try {
    const items = await prisma.rawMaterial.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json(items.map(formatMaterial));
  } catch (error) {
    console.error('Get inventory error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const createInventoryItem = async (req: Request, res: Response) => {
  try {
    const { name, category, quantity, unit, minQuantity, costPerUnit, supplier } = req.body;

    if (!name || !unit || costPerUnit === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const qty = Number(quantity || 0);
    const cpu = Number(costPerUnit);
    const totalCost = qty * cpu;

    const item = await prisma.rawMaterial.create({
      data: {
        name,
        category: category || 'INGREDIENT',
        quantity: qty,
        unit,
        minQuantity: Number(minQuantity || 0),
        costPerUnit: cpu,
        supplier: supplier || '',
        totalCost,
        isActive: true,
      },
    });

    res.status(201).json(formatMaterial(item));
  } catch (error) {
    console.error('Create inventory error:', error);
    res.status(400).json({ error: 'Bad request' });
  }
};

export const updateInventoryItem = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, category, quantity, unit, minQuantity, costPerUnit, supplier, isActive } = req.body;

    // Get current item to recalculate totalCost if needed
    const current = await prisma.rawMaterial.findUnique({ where: { id: Number(id) } });
    if (!current) return res.status(404).json({ error: 'Item not found' });

    const newQty = quantity !== undefined ? Number(quantity) : Number(current.quantity);
    const newCpu = costPerUnit !== undefined ? Number(costPerUnit) : Number(current.costPerUnit);
    const newTotalCost = newQty * newCpu;

    const updateData: any = {
      totalCost: newTotalCost,
    };
    if (name !== undefined) updateData.name = name;
    if (category !== undefined) updateData.category = category;
    if (quantity !== undefined) updateData.quantity = newQty;
    if (unit !== undefined) updateData.unit = unit;
    if (minQuantity !== undefined) updateData.minQuantity = Number(minQuantity);
    if (costPerUnit !== undefined) updateData.costPerUnit = newCpu;
    if (supplier !== undefined) updateData.supplier = supplier;
    if (isActive !== undefined) updateData.isActive = isActive;

    const item = await prisma.rawMaterial.update({
      where: { id: Number(id) },
      data: updateData,
    });

    res.json(formatMaterial(item));
  } catch (error) {
    console.error('Update inventory error:', error);
    res.status(400).json({ error: 'Bad request' });
  }
};

export const deleteInventoryItem = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const item = await prisma.rawMaterial.update({
      where: { id: Number(id) },
      data: { isActive: false },
    });

    if (!item) return res.status(404).json({ error: 'Item not found' });

    res.json({ success: true, message: 'Item deleted' });
  } catch (error) {
    console.error('Delete inventory error:', error);
    res.status(400).json({ error: 'Bad request' });
  }
};
