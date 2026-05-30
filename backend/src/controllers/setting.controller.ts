import { Request, Response } from 'express';
import prisma from '../lib/prisma.js';

const formatSettings = (s: any) => ({
  shopName: s.name,
  shopLogo: s.shopLogo,
  address: s.address,
  phone: s.phone,
  receiptPrinterIp: s.receiptPrinterIp,
  printSettings: {
    showLogo: s.printShowLogo,
    showAddress: s.printShowAddress,
    paperWidth: s.printPaperWidth,
  },
  taxPercent: Number(s.taxPercent),
  defaultDiscount: Number(s.defaultDiscount),
});

export const getSettings = async (_req: Request, res: Response) => {
  try {
    let settings = await prisma.setting.findFirst();
    if (!settings) {
      settings = await prisma.setting.create({ 
        data: { 
          shopLogo: '☕',
          address: 'Alamat Kedai',
          phone: '081234567890',
        } as any 
      });
    }
    res.json(formatSettings(settings));
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const updateSettings = async (req: Request, res: Response) => {
  try {
    const body = req.body;

    const updateData: any = {};
    if (body.shopName !== undefined || body.name !== undefined) updateData.name = body.shopName || body.name;
    if (body.shopLogo !== undefined) updateData.shopLogo = body.shopLogo;
    if (body.address !== undefined) updateData.address = body.address;
    if (body.phone !== undefined) updateData.phone = body.phone;
    if (body.receiptPrinterIp !== undefined) updateData.receiptPrinterIp = body.receiptPrinterIp;
    if (body.taxPercent !== undefined) updateData.taxPercent = Number(body.taxPercent);
    if (body.defaultDiscount !== undefined) updateData.defaultDiscount = Number(body.defaultDiscount);
    if (body.printSettings) {
      if (body.printSettings.showLogo !== undefined) updateData.printShowLogo = body.printSettings.showLogo;
      if (body.printSettings.showAddress !== undefined) updateData.printShowAddress = body.printSettings.showAddress;
      if (body.printSettings.paperWidth !== undefined) updateData.printPaperWidth = Number(body.printSettings.paperWidth);
    }

    // Upsert: update if exists, create if not
    const existing = await prisma.setting.findFirst();
    let settings;
    if (existing) {
      settings = await prisma.setting.update({
        where: { id: existing.id },
        data: updateData,
      });
    } else {
      settings = await prisma.setting.create({ 
        data: {
          shopLogo: updateData.shopLogo || '☕',
          address: updateData.address || 'Alamat Kedai',
          phone: updateData.phone || '081234567890',
          ...updateData
        } 
      });
    }

    res.json(formatSettings(settings));
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(400).json({ error: error instanceof Error ? error.message : 'Bad request' });
  }
};
