import "server-only";

import { createClient } from "@supabase/supabase-js";

function requiredEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error("Missing required server environment variable: " + name);
  }

  return value;
}

// The service-role key bypasses RLS and must remain server-only. Auth.js
// protects the Next.js admin surface before this client is used.
export function createAdminSupabaseClient() {
  return createClient(
    requiredEnv("NEXT_PUBLIC_SUPABASE_URL"),
    requiredEnv("SUPABASE_SERVICE_ROLE_KEY"),
    {
      auth: {
        autoRefreshToken: false,
        detectSessionInUrl: false,
        persistSession: false,
      },
    },
  );
}
