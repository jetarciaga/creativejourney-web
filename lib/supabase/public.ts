import { createClient } from "@supabase/supabase-js";

function requiredEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error("Missing required public environment variable: " + name);
  }

  return value;
}

export function createPublicSupabaseClient() {
  return createClient(
    requiredEnv("NEXT_PUBLIC_SUPABASE_URL"),
    requiredEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"),
    {
      auth: {
        autoRefreshToken: false,
        detectSessionInUrl: false,
        persistSession: false,
      },
    },
  );
}
