import { prisma } from '../src/config/database';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const requiredEnvVars = ['ADMIN_EMAIL', 'ADMIN_PASSWORD', 'ADMIN_NAME'];

requiredEnvVars.forEach((key) => {
  if (!process.env[key]) {
    console.error(`Missing required environment variable: ${key}`);
    process.exit(1);
  }
});

async function main(): Promise<void> {
  console.log('Seeding database...');

  const adminEmail = process.env.ADMIN_EMAIL as string;
  const adminPassword = process.env.ADMIN_PASSWORD as string;
  const adminName = process.env.ADMIN_NAME as string;

  // Creates the first ADMIN user — only this user can invite others and assign project roles
  const adminUser = await prisma.user.upsert({
    where: { email: adminEmail },
    update: { systemRole: 'ADMIN' },
    create: {
      email: adminEmail,
      name: adminName,
      passwordHash: await bcrypt.hash(adminPassword, 12),
      systemRole: 'ADMIN',
      isActive: true,
    },
  });

  console.log('Admin user ready:', adminUser.email);
  console.log('System role:', adminUser.systemRole);
  console.log('Seeding complete');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });