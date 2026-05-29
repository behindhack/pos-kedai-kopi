import 'dotenv/config';
import { defineConfig, env } from 'prisma/config';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';

function parseMysqlUrl(url: string) {
  const parsed = new URL(url);
  const isLocal = parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1';
  return {
    host: parsed.hostname || 'localhost',
    port: parsed.port ? parseInt(parsed.port) : 3306,
    user: decodeURIComponent(parsed.username) || 'root',
    password: decodeURIComponent(parsed.password) || '',
    database: parsed.pathname.slice(1).split('?')[0],
    connectionLimit: 5,
    ssl: isLocal ? undefined : { rejectUnauthorized: true },
  };
}

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    url: env('DATABASE_URL'),
  },
  migrate: {
    adapter(url: string) {
      return new PrismaMariaDb(parseMysqlUrl(url));
    },
  },
});
