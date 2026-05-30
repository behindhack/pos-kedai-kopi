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

import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { errorHandler } from './middlewares/errorHandler.middleware.js';

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
app.use(helmet());

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: { status: 'error', message: 'Too many requests, please try again later.' }
});
app.use('/api', apiLimiter);

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

// TEMPORARY: Debug endpoint to check which database is being used
app.get('/api/debug-db', async (_req, res) => {
  try {
    const dbUrl = process.env.DATABASE_URL || 'NOT SET';
    // Only show database name, not credentials
    const dbNameMatch = dbUrl.match(/\/([^?]+)\??/);
    const dbName = dbNameMatch ? dbNameMatch[1] : 'unknown';
    const result: any[] = await prisma.$queryRaw`SELECT DATABASE() as db_name`;
    res.json({ 
      envDbName: dbName, 
      actualDbName: result[0]?.db_name,
      message: 'Debug info for DATABASE_URL'
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// TEMPORARY: Migration endpoint to add missing columns to settings table
app.get('/api/migrate-settings', async (_req, res) => {
  try {
    const results: string[] = [];
    
    // Check and add missing columns one by one
    const columnsToAdd = [
      { name: 'default_discount', sql: 'ALTER TABLE settings ADD COLUMN default_discount DECIMAL(15,2) NOT NULL DEFAULT 0' },
      { name: 'tax_percent', sql: 'ALTER TABLE settings ADD COLUMN tax_percent DECIMAL(5,2) NOT NULL DEFAULT 0' },
      { name: 'print_show_logo', sql: 'ALTER TABLE settings ADD COLUMN print_show_logo BOOLEAN NOT NULL DEFAULT true' },
      { name: 'print_show_address', sql: 'ALTER TABLE settings ADD COLUMN print_show_address BOOLEAN NOT NULL DEFAULT true' },
      { name: 'print_paper_width', sql: 'ALTER TABLE settings ADD COLUMN print_paper_width INT NOT NULL DEFAULT 80' },
      { name: 'receipt_printer_ip', sql: 'ALTER TABLE settings ADD COLUMN receipt_printer_ip VARCHAR(100) NULL' },
    ];

    for (const col of columnsToAdd) {
      try {
        await prisma.$executeRawUnsafe(col.sql);
        results.push(`✅ Added column: ${col.name}`);
      } catch (e: any) {
        if (e.message?.includes('Duplicate column') || e.message?.includes('already exists')) {
          results.push(`⏭️ Column already exists: ${col.name}`);
        } else {
          results.push(`❌ Error adding ${col.name}: ${e.message}`);
        }
      }
    }

    res.json({ status: 'Migration completed', results });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.use(errorHandler);

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
