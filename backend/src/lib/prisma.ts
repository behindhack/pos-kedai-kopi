import { PrismaClient } from '@prisma/client';
import 'dotenv/config';

// Singleton pattern to prevent multiple instances in development (hot reload)
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const dbUrl = process.env.DATABASE_URL || '';
const prismaUrl = dbUrl.includes('?') 
  ? `${dbUrl}&connection_limit=1&connect_timeout=8`
  : `${dbUrl}?connection_limit=1&connect_timeout=8`;

export const prisma: PrismaClient =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: prismaUrl,
      },
    } as any,
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;
