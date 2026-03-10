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
  const certPath = path.join(process.cwd(), 'certs', 'aiven-ca.pem');

  const sslConfig: pg.PoolConfig['ssl'] =
    env.NODE_ENV === 'production'
      ? {
          rejectUnauthorized: true,
          ca: fs.readFileSync(certPath, 'utf-8'),
        }
      : {
          // Development — SSL required but certificate chain not strictly verified
          rejectUnauthorized: false,
        };

  const pool = new pg.Pool({
    connectionString: env.DATABASE_URL,
    ssl: sslConfig,
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