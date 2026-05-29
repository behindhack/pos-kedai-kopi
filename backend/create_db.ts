import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';

// First connect without database to create it
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
    await prisma.$executeRaw`CREATE DATABASE IF NOT EXISTS pos_kopi`;
    console.log('Database pos_kopi created!');
  } catch(e: any) {
    console.error('ERROR:', e.message);
  }
  process.exit(0);
}
run();
