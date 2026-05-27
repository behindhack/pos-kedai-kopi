import { Request, Response } from 'express';
import Sale from '../models/Sale';

export const getSales = async (req: Request, res: Response) => {
  try {
    const { date, status } = req.query;
    const filter: any = {};
    
    if (status) {
      filter.status = status;
    }

    if (date) {
      // Filter by specific day if requested
      const queryDate = new Date(date as string);
      const startOfDay = new Date(queryDate.setHours(0, 0, 0, 0));
      const endOfDay = new Date(queryDate.setHours(23, 59, 59, 999));
      
      filter.date = {
        $gte: startOfDay,
        $lte: endOfDay,
      };
    }

    const sales = await Sale.find(filter).sort({ createdAt: -1 });
    
    // Map to frontend expected format
    const formatted = sales.map((s) => ({
      id: s._id,
      orderNumber: s.orderNumber,
      customerName: s.customerName,
      orderType: s.orderType,
      items: s.items.map(item => ({
        product: {
          id: item.productId,
          name: item.productName,
          category: item.productCategory,
          basePrice: item.basePrice,
          variants: item.selectedVariants, // simplified
        },
        qty: item.qty,
        selectedVariantIds: item.selectedVariants.map(v => v.variantId),
        note: item.note,
      })),
      subtotal: s.subtotal,
      discount: s.discount,
      tax: s.tax,
      total: s.total,
      payment: s.payment,
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
    
    // Convert frontend structure to backend structure
    const backendItems = saleData.items.map((item: any) => ({
      productId: item.product.id,
      productName: item.product.name,
      productCategory: item.product.category,
      basePrice: item.product.basePrice,
      qty: item.qty,
      selectedVariants: item.selectedVariantIds.map((vId: string) => {
        const variant = item.product.variants?.find((v: any) => v.id === vId);
        return {
          variantId: vId,
          name: variant?.name || 'Unknown',
          extraPrice: variant?.extraPrice || 0,
        };
      }),
      note: item.note,
    }));

    const sale = new Sale({
      ...saleData,
      items: backendItems,
      date: new Date(saleData.date || Date.now()),
    });

    await sale.save();
    res.status(201).json(sale);
  } catch (error) {
    console.error('Create sale error:', error);
    res.status(400).json({ error: 'Bad request' });
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

    const sale = await Sale.findByIdAndUpdate(id, { status }, { new: true });
    if (!sale) return res.status(404).json({ error: 'Sale not found' });
    
    res.json(sale);
  } catch (error) {
    res.status(400).json({ error: 'Bad request' });
  }
};
