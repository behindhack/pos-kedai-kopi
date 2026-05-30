import express from 'express';
import { prisma } from './backend/src/lib/prisma.js';
import saleRoutes from './backend/src/routes/sale.routes.js';
import { errorHandler } from './backend/src/middlewares/errorHandler.middleware.js';
import axios from 'axios';
import http from 'http';

const app = express();
app.use(express.json());

// Mock auth middleware for testing
app.use('/api/sales', (req, res, next) => {
  req.user = { id: 1, role: 'CASHIER' };
  next();
}, saleRoutes);

app.use(errorHandler);

const server = http.createServer(app);

server.listen(3005, async () => {
  console.log('Test server running on port 3005');
  
  try {
    const mockPayload = {
      customerName: 'Test',
      orderType: 'DINE_IN',
      items: [
        {
          product: {
            id: 1,
            name: 'Kopi Sanger',
            category: 'ESPRESSO',
            basePrice: 12000,
            variants: []
          },
          qty: 1,
          selectedVariantIds: [],
          note: ''
        }
      ],
      subtotal: 12000,
      discount: 0,
      tax: 0,
      total: 12000,
      paymentMethod: 'CASH',
      paidAmount: 12000
    };

    const response = await axios.post('http://localhost:3005/api/sales', mockPayload);
    console.log('SUCCESS:', response.data);
  } catch (error: any) {
    console.error('ERROR RESPONSE STATUS:', error.response?.status);
    console.error('ERROR RESPONSE DATA:', error.response?.data);
  } finally {
    server.close();
    await prisma.$disconnect();
    process.exit(0);
  }
});
