import path from "path";
import { defineConfig, env } from "prisma/config";
import "dotenv/config";

export default defineConfig({
  schema: path.join("prisma", "schema.prisma"),

  datasource: {
    url: env("DATABASE_URL"),
  },

  migrations: {
    path: path.join("prisma", "migrations"),
  },
});