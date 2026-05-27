import { Request, Response } from 'express';
import RawMaterial from '../models/RawMaterial';

export const getInventory = async (req: Request, res: Response) => {
  try {
    const items = await RawMaterial.find();
    
    const formatted = items.map(item => ({
      id: item._id,
      name: item.name,
      stock: item.stock,
      unit: item.unit,
      minStock: item.minStock,
      lastRestock: item.lastRestock.toISOString(),
    }));

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const createInventoryItem = async (req: Request, res: Response) => {
  try {
    const item = new RawMaterial(req.body);
    await item.save();
    res.status(201).json({
      id: item._id,
      name: item.name,
      stock: item.stock,
      unit: item.unit,
      minStock: item.minStock,
      lastRestock: item.lastRestock.toISOString(),
    });
  } catch (error) {
    res.status(400).json({ error: 'Bad request' });
  }
};

export const updateInventoryItem = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const item = await RawMaterial.findByIdAndUpdate(id, req.body, { new: true });
    
    if (!item) return res.status(404).json({ error: 'Item not found' });
    
    res.json({
      id: item._id,
      name: item.name,
      stock: item.stock,
      unit: item.unit,
      minStock: item.minStock,
      lastRestock: item.lastRestock.toISOString(),
    });
  } catch (error) {
    res.status(400).json({ error: 'Bad request' });
  }
};

export const deleteInventoryItem = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const item = await RawMaterial.findByIdAndDelete(id);
    
    if (!item) return res.status(404).json({ error: 'Item not found' });
    
    res.json({ message: 'Item deleted' });
  } catch (error) {
    res.status(400).json({ error: 'Bad request' });
  }
};
