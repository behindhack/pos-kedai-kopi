import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const dbUrl = process.env.DATABASE_URL || '';
const isLocal = dbUrl.includes('localhost') || dbUrl.includes('127.0.0.1');

// Append parameters to connection string to prevent Vercel zombies
let prismaUrl = dbUrl;
if (!isLocal && prismaUrl) {
  const separator = prismaUrl.includes('?') ? '&' : '?';
  prismaUrl = `${prismaUrl}${separator}connection_limit=1&connect_timeout=30`;
}

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    datasources: {
      db: {
        url: prismaUrl,
      },
    },
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;
