import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import 'dotenv/config';

// Singleton pattern to prevent multiple instances in development (hot reload)
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function parseMysqlUrl(url: string) {
  const parsed = new URL(url);
  return {
    host: parsed.hostname || 'localhost',
    port: parsed.port ? parseInt(parsed.port) : 3306,
    user: decodeURIComponent(parsed.username) || 'root',
    password: decodeURIComponent(parsed.password) || '',
    database: parsed.pathname.slice(1),
    connectionLimit: 1,
  };
}

const databaseUrl = process.env.DATABASE_URL ?? 'mysql://root:@localhost:3306/pos_kopi';
const connectionConfig = parseMysqlUrl(databaseUrl);

const adapter = new PrismaMariaDb(connectionConfig);

export const prisma: PrismaClient =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;
