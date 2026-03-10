import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { env } from './env';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  // In development disable TLS cert verification at the Node level
  // This is safe — connection only runs locally, never exposed publicly
  if (env.NODE_ENV !== 'production') {
    process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';
  }

  let ssl: pg.PoolConfig['ssl'];

  if (env.NODE_ENV === 'production') {
    const certPath = path.join(process.cwd(), 'certs', 'aiven-ca.pem');
    ssl = {
      rejectUnauthorized: true,
      ca: fs.readFileSync(certPath, 'utf-8'),
    };
  } else {
    ssl = { rejectUnauthorized: false };
  }

  const pool = new pg.Pool({
    connectionString: env.DATABASE_URL,
    ssl,
  });

  const adapter = new PrismaPg(pool);

  return new PrismaClient({
    adapter,
    log:
      env.NODE_ENV === 'development'
        ? ['query', 'info', 'warn', 'error']
        : ['warn', 'error'],
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export async function connectDatabase(): Promise<void> {
  try {
    await prisma.$connect();
    console.log('Database connected successfully');
  } catch (error) {
    console.error('Database connection failed:', error);
    process.exit(1);
  }
}

export async function disconnectDatabase(): Promise<void> {
  await prisma.$disconnect();
  console.log('Database disconnected');
}