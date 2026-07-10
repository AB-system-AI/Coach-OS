import "dotenv/config";
import { defineConfig } from "prisma/config";

/** Allows `prisma generate` during CI/Vercel build when DATABASE_URL is unset. */
const BUILD_PLACEHOLDER_DATABASE_URL =
  "postgresql://build:build@127.0.0.1:5432/build?schema=public";

const databaseUrl =
  process.env.DATABASE_URL?.trim() || BUILD_PLACEHOLDER_DATABASE_URL;

if (!process.env.DATABASE_URL?.trim()) {
  process.env.DATABASE_URL = databaseUrl;
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: databaseUrl,
  },
});
