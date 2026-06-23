import 'dotenv/config';
import { PrismaClient } from '../generated/prisma/client.js';

const prisma = new PrismaClient();

const defaultCategories = [
  { name: 'Mobile', slug: 'mobile' },
  { name: 'PC', slug: 'pc' },
  { name: 'RPG', slug: 'rpg' },
  { name: 'FPS', slug: 'fps' },
  { name: 'MOBA', slug: 'moba' },
  { name: 'Battle Royale', slug: 'battle-royale' },
  { name: 'Sandbox', slug: 'sandbox' },
  { name: 'Strategy', slug: 'strategy' },
  { name: 'Sports', slug: 'sports' },
];

async function main() {
  for (const cat of defaultCategories) {
    await prisma.categories.upsert({
      where: { name: cat.name },
      update: {},
      create: cat,
    });
  }
  console.log('Categories seeded successfully');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
