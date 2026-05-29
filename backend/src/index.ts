import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { prisma } from './lib/prisma.js';

import authRoutes from './routes/auth.routes.js';
import productRoutes from './routes/product.routes.js';
import saleRoutes from './routes/sale.routes.js';
import settingRoutes from './routes/setting.routes.js';
import inventoryRoutes from './routes/inventory.routes.js';
import userRoutes from './routes/user.routes.js';
import financialRoutes from './routes/financial.routes.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';

// Middlewares — izinkan akses dari semua origin (LAN & browser)
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json({ limit: '10mb' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/sales', saleRoutes);
app.use('/api/settings', settingRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/users', userRoutes);
app.use('/api/financial-reports', financialRoutes);

app.get('/api/health', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'OK', message: 'Backend is running, MySQL connected', db: 'MySQL' });
  } catch (err: any) {
    console.error('Health Check DB Error:', err);
    res.status(500).json({ status: 'ERROR', message: 'MySQL connection failed', error: err?.message || String(err) });
  }
});

// Start Server (only if not in serverless environment)
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  const startServer = async () => {
    try {
      await prisma.$connect();
      console.log('✅ Connected to MySQL');
      app.listen(Number(PORT), HOST, () => {
        console.log(`🚀 Server running on http://localhost:${PORT}`);
        console.log(`🌐 LAN access: http://192.168.100.116:${PORT}`);
      });
    } catch (error) {
      console.error('❌ MySQL connection error:', error);
      process.exit(1);
    }
  };
  startServer();
}

// Graceful shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  console.log('🔌 Disconnected from MySQL');
  process.exit(0);
});

// Export the Express API for Vercel
export default app;
