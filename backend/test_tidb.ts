import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';

const adapter = new PrismaMariaDb({
  host: 'gateway01.ap-southeast-1.prod.alicloud.tidbcloud.com',
  port: 4000,
  user: 'pqb1cavRcPTgvrx.root',
  password: '4HXR3oN2qf0ypu5x',
  database: 'test',
  connectionLimit: 1,
  ssl: { rejectUnauthorized: true }
});

const prisma = new PrismaClient({ adapter });

async function run() {
  try {
    const result = await prisma.$queryRaw`SELECT 1 as ok`;
    console.log('TiDB CONNECTED:', result);
  } catch(e: any) {
    console.error('CONNECTION ERROR:', e.message);
  }
  process.exit(0);
}
run();
