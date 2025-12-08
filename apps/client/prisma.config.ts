import { defineConfig } from "prisma/config";
import path from "path";
import fs from "fs";

// Load .env.local only in local development (when file exists)
const envLocalPath = path.resolve(__dirname, ".env.local");
if (fs.existsSync(envLocalPath)) {
  // Dynamic import to avoid issues when dotenv isn't needed
  require("dotenv").config({ path: envLocalPath });
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env.DATABASE_URL!,
  },
});
