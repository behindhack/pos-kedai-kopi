import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import * as bcrypt from 'bcryptjs';

// TiDB Cloud connection
const adapterTiDB = new PrismaMariaDb({
  host: 'gateway01.ap-southeast-1.prod.alicloud.tidbcloud.com',
  port: 4000,
  user: 'pqb1cavRcPTgvrx.root',
  password: '4HXR3oN2qf0ypu5x',
  database: 'pos_kopi',
  connectionLimit: 1,
  ssl: { rejectUnauthorized: true }
});

const tidb = new PrismaClient({ adapter: adapterTiDB });

// Local XAMPP connection
const adapterLocal = new PrismaMariaDb({
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: '',
  database: 'pos_kopi',
  connectionLimit: 1,
});

const local = new PrismaClient({ adapter: adapterLocal });

async function main() {
  console.log('🚀 Starting migration from local XAMPP to TiDB Cloud...');

  // ---- 1. USERS ----
  console.log('\n📦 Migrating users...');
  const users = await local.user.findMany();
  for (const user of users) {
    await tidb.user.upsert({
      where: { email: user.email },
      update: {},
      create: {
        name: user.name,
        email: user.email,
        passwordHash: user.passwordHash,
        role: user.role,
        isActive: user.isActive,
      },
    });
  }
  console.log(`✅ Migrated ${users.length} users`);

  // If no users exist at all, create default owner
  if (users.length === 0) {
    const bcrypt = await import('bcryptjs');
    const hashedPassword = await bcrypt.hash('password123', 10);
    await tidb.user.upsert({
      where: { email: 'owner@kedaikopi.com' },
      update: {},
      create: {
        name: 'Owner',
        email: 'owner@kedaikopi.com',
        passwordHash: hashedPassword,
        role: 'OWNER',
      },
    });
    console.log('✅ Created default owner: owner@kedaikopi.com / password123');
  }

  // ---- 2. SHOP SETTINGS ----
  console.log('\n📦 Migrating shop settings...');
  try {
    const settings = await local.shopSettings.findFirst();
    if (settings) {
      const existing = await tidb.shopSettings.findFirst();
      if (!existing) {
        await tidb.shopSettings.create({
          data: {
            shopName: settings.shopName,
            address: settings.address,
            phone: settings.phone,
            shopLogo: settings.shopLogo,
            printSettings: settings.printSettings,
          },
        });
        console.log('✅ Migrated shop settings');
      }
    }
  } catch (e: any) {
    console.log('⚠️ Shop settings migration skipped:', e.message);
  }

  // ---- 3. RAW MATERIALS ----
  console.log('\n📦 Migrating raw materials...');
  let rawMaterialIdMap: Record<number, number> = {};
  try {
    const materials = await local.rawMaterial.findMany();
    for (const mat of materials) {
      const created = await tidb.rawMaterial.create({
        data: {
          name: mat.name,
          unit: mat.unit,
          quantity: mat.quantity,
          minQuantity: mat.minQuantity,
          category: mat.category,
          pricePerUnit: mat.pricePerUnit,
        },
      });
      rawMaterialIdMap[mat.id] = created.id;
    }
    console.log(`✅ Migrated ${materials.length} raw materials`);
  } catch (e: any) {
    console.log('⚠️ Raw materials migration error:', e.message);
  }

  // ---- 4. PRODUCTS ----
  console.log('\n📦 Migrating products...');
  let productIdMap: Record<number, number> = {};
  try {
    const products = await local.product.findMany({ include: { variants: true, recipe: true } });
    for (const product of products) {
      const created = await tidb.product.create({
        data: {
          name: product.name,
          description: product.description,
          category: product.category,
          basePrice: product.basePrice,
          stock: product.stock,
          minStock: product.minStock,
          image: product.image,
          isAvailable: product.isAvailable,
          variants: {
            create: product.variants.map(v => ({
              name: v.name,
              extraPrice: v.extraPrice,
            })),
          },
        },
      });
      productIdMap[product.id] = created.id;

      // Migrate recipe
      if (product.recipe.length > 0) {
        for (const r of product.recipe) {
          const newMaterialId = rawMaterialIdMap[r.materialId];
          if (newMaterialId) {
            await tidb.productRecipe.create({
              data: {
                productId: created.id,
                materialId: newMaterialId,
                quantity: r.quantity,
              },
            });
          }
        }
      }
    }
    console.log(`✅ Migrated ${products.length} products`);
  } catch (e: any) {
    console.log('⚠️ Products migration error:', e.message);
  }

  console.log('\n🎉 Migration completed!');
  console.log('\nLogin credentials on TiDB Cloud:');
  const allUsers = await tidb.user.findMany({ select: { email: true, role: true } });
  allUsers.forEach(u => console.log(`  - ${u.email} (${u.role})`));

  await tidb.$disconnect();
  await local.$disconnect();
  process.exit(0);
}

main().catch((e) => {
  console.error('MIGRATION FAILED:', e);
  process.exit(1);
});
