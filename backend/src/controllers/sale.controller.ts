import { Request, Response } from 'express';
import prisma from '../lib/prisma.js';

export const getSales = async (req: Request, res: Response) => {
  try {
    const { date, status } = req.query;

    const where: any = {};

    if (status) {
      where.status = status as string;
    }

    if (date) {
      const queryDate = new Date(date as string);
      const startOfDay = new Date(queryDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(queryDate);
      endOfDay.setHours(23, 59, 59, 999);
      where.date = { gte: startOfDay, lte: endOfDay };
    }

    const sales = await prisma.sale.findMany({
      where,
      include: {
        items: {
          include: { variants: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const formatted = sales.map((s) => ({
      id: s.id,
      orderNumber: s.orderNumber,
      customerName: s.customerName,
      orderType: s.orderType,
      items: s.items.map((item) => ({
        product: {
          id: item.productId,
          name: item.productName,
          category: item.productCategory,
          basePrice: Number(item.basePrice),
          variants: item.variants.map((v) => ({
            id: v.variantId,
            name: v.name,
            extraPrice: Number(v.extraPrice),
          })),
        },
        qty: item.qty,
        selectedVariantIds: item.variants.map((v) => v.variantId),
        note: item.note,
      })),
      subtotal: Number(s.subtotal),
      discount: Number(s.discount),
      tax: Number(s.tax),
      total: Number(s.total),
      payment: {
        method: s.paymentMethod,
        paidAmount: Number(s.paidAmount),
        change: Number(s.changeAmount),
      },
      status: s.status,
      date: s.date.toISOString(),
      createdAt: s.createdAt.toISOString(),
    }));

    res.json(formatted);
  } catch (error) {
    console.error('Get sales error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const createSale = async (req: Request, res: Response) => {
  try {
    const saleData = req.body;

    // Generate sequential orderNumber for the day
    const queryDate = new Date(saleData.date || Date.now());
    const startOfDay = new Date(queryDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(queryDate);
    endOfDay.setHours(23, 59, 59, 999);

    const sale = await prisma.$transaction(async (tx) => {
      const datePrefix = queryDate.toISOString().slice(0, 10).replace(/-/g, '');
      const tempOrderNumber = `TEMP-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

      const itemsData = saleData.items.map((item: any) => {
        return {
          productId: Number(item.product.id),
          productName: item.product.name,
          productCategory: item.product.category || 'Uncategorized',
          basePrice: Number(item.product.basePrice),
          qty: Number(item.qty),
          note: item.note || null,
          variants: item.selectedVariantIds && item.selectedVariantIds.length > 0 
            ? {
                create: item.selectedVariantIds.map((vId: string) => {
                  const variant = item.product.variants?.find((v: any) => String(v.id) === String(vId));
                  return {
                    variantId: String(vId),
                    name: variant ? variant.name : String(vId),
                    extraPrice: variant ? Number(variant.extraPrice) : 0
                  };
                })
              }
            : undefined
        };
      });

      const changeAmount = Number(saleData.paidAmount) - Number(saleData.total);
      const dbPaymentMethod = saleData.paymentMethod === 'TRANSFER' ? 'DEBIT' : saleData.paymentMethod;

      const createdSale = await tx.sale.create({
        data: {
          orderNumber: tempOrderNumber,
          customerName: saleData.customerName || null,
          orderType: saleData.orderType,
          subtotal: Number(saleData.subtotal),
          discount: Number(saleData.discount || 0),
          tax: Number(saleData.tax || 0),
          total: Number(saleData.total),
          paymentMethod: dbPaymentMethod,
          paidAmount: Number(saleData.paidAmount),
          changeAmount: changeAmount > 0 ? changeAmount : 0,
          date: queryDate,
          status: 'PENDING',
          items: { create: itemsData },
        },
      });

      const finalOrderNumber = `INV-${datePrefix}-${createdSale.id.toString().padStart(5, '0')}`;

      const finalSale = await tx.sale.update({
        where: { id: createdSale.id },
        data: { orderNumber: finalOrderNumber },
        include: { items: { include: { variants: true } } },
      });

      // Deduct stock based on recipe or product stock
      for (const item of saleData.items) {
        const product = await tx.product.findUnique({
          where: { id: Number(item.product.id) },
          include: { recipe: true },
        });

        if (product) {
          if (product.recipe && product.recipe.length > 0) {
            // Deduct from raw materials based on recipe
            for (const r of product.recipe) {
              const amountToDeduct = Number(r.quantity) * Number(item.qty);
              await tx.rawMaterial.update({
                where: { id: r.materialId },
                data: { quantity: { decrement: amountToDeduct } },
              });
            }
          } else {
            // Fallback: Deduct from product stock directly
            await tx.product.update({
              where: { id: Number(item.product.id) },
              data: { stock: { decrement: Number(item.qty) } },
            });
          }
        }
      }

      return finalSale;
    });

    res.status(201).json(sale);
  } catch (error: any) {
    console.error('Create sale error:', error);
    res.status(500).json({ error: error.message || 'Server error during sale creation', stack: error.stack });
  }
};

export const updateSaleStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['PENDING', 'PREPARING', 'READY', 'COMPLETED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const sale = await prisma.sale.update({
      where: { id: Number(id) },
      data: { status },
    });

    res.json(sale);
  } catch (error) {
    console.error('Update sale status error:', error);
    res.status(400).json({ error: 'Bad request' });
  }
};
