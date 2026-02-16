import 'dotenv/config';
import { PrismaClient, AdminRole } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL is not set');
}
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const SUPERADMIN_EMAIL = 'superadmin@example.com';
const SUPERADMIN_PASSWORD = 'SuperAdmin123!';
const SALT_ROUNDS = 10;

async function main() {
  const hashedPassword = await bcrypt.hash(SUPERADMIN_PASSWORD, SALT_ROUNDS);

  await prisma.admin.upsert({
    where: { email: SUPERADMIN_EMAIL },
    update: {},
    create: {
      email: SUPERADMIN_EMAIL,
      name: 'Super Admin',
      password: hashedPassword,
      role: AdminRole.super_admin,
      isActive: true,
    },
  });

  console.log('Super admin seeded:', SUPERADMIN_EMAIL);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
