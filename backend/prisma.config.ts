import path from 'path';
import { defineConfig } from 'prisma/config';
import dotenv from 'dotenv';

dotenv.config();

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set in environment variables');
}

export default defineConfig({
  schema: path.join('prisma', 'schema.prisma'),
  datasource: {
    url: process.env.DATABASE_URL,
  },
});