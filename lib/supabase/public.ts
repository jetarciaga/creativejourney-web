import { createClient } from "@supabase/supabase-js";

function requiredEnv(value: string | undefined, name: string) {
  if (!value) {
    throw new Error("Missing required public environment variable: " + name);
  }

  return value;
}

export function createPublicSupabaseClient() {
  return createClient(
    requiredEnv(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      "NEXT_PUBLIC_SUPABASE_URL",
    ),
    requiredEnv(
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
      "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
    ),
    {
      auth: {
        autoRefreshToken: false,
        detectSessionInUrl: false,
        persistSession: false,
      },
    },
  );
}
