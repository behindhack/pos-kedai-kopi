import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { createPool } from 'mariadb';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';

const dbUrl = process.env.DATABASE_URL || '';

function parseMysqlUrl(url: string) {
  if (!url) return {} as any;
  const parsed = new URL(url);
  const isLocal = parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1';
  return {
    host: parsed.hostname || 'localhost',
    port: parsed.port ? parseInt(parsed.port) : 3306,
    user: decodeURIComponent(parsed.username) || 'root',
    password: decodeURIComponent(parsed.password) || '',
    database: parsed.pathname.slice(1).split('?')[0],
    connectionLimit: 1,
    connectTimeout: 20000,
    ssl: isLocal ? undefined : { rejectUnauthorized: true },
  };
}

const pool = createPool(parseMysqlUrl(dbUrl));
const adapter = new PrismaMariaDb(pool);

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma: PrismaClient =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;
