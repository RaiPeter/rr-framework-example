import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const client = postgres(
  process.env.DATABASE_URL || "postgresql://postgres:admin@localhost:5432/forum"
);

export const db = drizzle(client, { schema });
