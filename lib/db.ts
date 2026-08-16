import "server-only";

import postgres, { type Sql } from "postgres";

let client: Sql<Record<string, unknown>> | undefined;

function requiredEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required server environment variable: ${name}`);
  }

  return value;
}

export function getDb() {
  if (client) {
    return client;
  }

  const port = Number(process.env.SUPABASE_DB_PORT ?? "6543");

  if (port !== 6543) {
    throw new Error(
      "SUPABASE_DB_PORT must be 6543: the app uses Supabase's Transaction Pooler.",
    );
  }

  client = postgres({
    host: requiredEnv("SUPABASE_DB_HOST"),
    port,
    username: requiredEnv("SUPABASE_DB_USER"),
    password: requiredEnv("SUPABASE_DB_PASSWORD"),
    database: requiredEnv("SUPABASE_DB_NAME"),
    ssl: "require",
    prepare: false,
    max: 1,
  });

  return client;
}
