import { Request, Response } from 'express';
import Setting from '../models/Setting';

export const getSettings = async (req: Request, res: Response) => {
  try {
    let settings = await Setting.findOne();
    if (!settings) {
      // Create defaults if not exists
      settings = await Setting.create({});
    }
    
    res.json({
      name: settings.name,
      address: settings.address,
      phone: settings.phone,
      receiptPrinterIp: settings.receiptPrinterIp,
      taxPercent: settings.taxPercent,
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const updateSettings = async (req: Request, res: Response) => {
  try {
    const settings = await Setting.findOneAndUpdate({}, req.body, { new: true, upsert: true });
    res.json({
      name: settings.name,
      address: settings.address,
      phone: settings.phone,
      receiptPrinterIp: settings.receiptPrinterIp,
      taxPercent: settings.taxPercent,
    });
  } catch (error) {
    res.status(400).json({ error: 'Bad request' });
  }
};
