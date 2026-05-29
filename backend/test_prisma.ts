import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';

const adapter = new PrismaMariaDb({ host: 'localhost', port: 3306, user: 'root', password: '', database: 'pos_kopi' });
const prisma = new PrismaClient({ adapter });

async function run() {
  const saleData = {
    customerName: 'Test Server',
    orderType: 'DINE_IN',
    subtotal: 12000,
    discount: 0,
    tax: 0,
    total: 12000,
    paymentMethod: 'CASH',
    paidAmount: 12000,
    items: [
      {
        product: { id: 1, name: 'Kopi', basePrice: 12000, category: 'COFFEE' },
        qty: 1,
        selectedVariantIds: [],
        note: ''
      }
    ]
  };

  try {
    const sale = await prisma.$transaction(async (tx) => {
      const itemsData = saleData.items.map((item: any) => {
        return {
          productId: Number(item.product.id),
          productName: item.product.name,
          productCategory: item.product.category || 'Uncategorized',
          basePrice: Number(item.product.basePrice),
          qty: Number(item.qty),
          note: item.note || null,
          variants: undefined
        };
      });

      const createdSale = await tx.sale.create({
        data: {
          orderNumber: '999',
          customerName: saleData.customerName || null,
          orderType: saleData.orderType,
          subtotal: Number(saleData.subtotal),
          discount: Number(saleData.discount || 0),
          tax: Number(saleData.tax || 0),
          total: Number(saleData.total),
          paymentMethod: saleData.paymentMethod,
          paidAmount: Number(saleData.paidAmount),
          changeAmount: 0,
          date: new Date(),
          status: 'PENDING',
          items: { create: itemsData },
        },
        include: { items: { include: { variants: true } } },
      });

      for (const item of saleData.items) {
        const product = await tx.product.findUnique({
          where: { id: Number(item.product.id) },
          include: { recipe: true },
        });

        if (product) {
          if (product.recipe && product.recipe.length > 0) {
            for (const r of product.recipe) {
              const amountToDeduct = Number(r.quantity) * Number(item.qty);
              await tx.rawMaterial.update({
                where: { id: r.materialId },
                data: { quantity: { decrement: amountToDeduct } },
              });
            }
          } else {
            await tx.product.update({
              where: { id: Number(item.product.id) },
              data: { stock: { decrement: Number(item.qty) } },
            });
          }
        }
      }
      return createdSale;
    });
    console.log('SUCCESS:', sale.id);
  } catch (e) {
    console.error('PRISMA ERROR:', e);
  }
  process.exit(0);
}
run();
