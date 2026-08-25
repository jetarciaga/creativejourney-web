import { readFileSync } from "node:fs";
import path from "node:path";
import { beforeEach, describe, expect, it, vi } from "vitest";

const createClientMock = vi.hoisted(() => vi.fn());

vi.mock("@supabase/supabase-js", () => ({
  createClient: createClientMock,
}));

import { createPublicSupabaseClient } from "@/lib/supabase/public";

const publicClientSource = readFileSync(
  path.resolve(__dirname, "../../lib/supabase/public.ts"),
  "utf8",
);

describe("public Supabase client", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = "publishable-test-key";
  });

  it("passes the public env values to Supabase", () => {
    createPublicSupabaseClient();

    expect(createClientMock).toHaveBeenCalledWith(
      "https://example.supabase.co",
      "publishable-test-key",
      {
        auth: {
          autoRefreshToken: false,
          detectSessionInUrl: false,
          persistSession: false,
        },
      },
    );
  });

  it("throws a clear error when a public env value is missing", () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;

    expect(() => createPublicSupabaseClient()).toThrow(
      "Missing required public environment variable: NEXT_PUBLIC_SUPABASE_URL",
    );
  });

  it("keeps both public env references statically analyzable by Next.js", () => {
    expect(publicClientSource).toContain("process.env.NEXT_PUBLIC_SUPABASE_URL");
    expect(publicClientSource).toContain(
      "process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
    );
    expect(publicClientSource).not.toContain("process.env[name]");
  });
});
