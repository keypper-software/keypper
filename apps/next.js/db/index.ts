import { drizzle } from "drizzle-orm/node-postgres";
import pkg from "pg";
const { Pool } = pkg;
import * as schema from "./schema";

export const db = drizzle(
  new Pool({ connectionString: process.env.DATABASE_URL }),
  { schema }
);
