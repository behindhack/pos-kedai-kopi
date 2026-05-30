import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  let settings = await prisma.setting.findFirst();
  if (!settings) {
    try {
      settings = await prisma.setting.create({ 
        data: { 
          shopLogo: '☕',
          address: 'Alamat Kedai',
          phone: '081234567890',
        } as any 
      });
      console.log("CREATED:", settings);
    } catch (e) {
      console.error("CREATE ERROR:", e);
    }
  } else {
    console.log("CURRENT:", settings);
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
