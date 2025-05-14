import "dotenv/config";
import { defineConfig } from "drizzle-kit";
import * as schema from "./db/schema";

export default defineConfig({
  out: "./drizzle",
  schema: "./db/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
