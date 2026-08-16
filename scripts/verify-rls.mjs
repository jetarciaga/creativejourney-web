import { createClient } from "@supabase/supabase-js";

const requiredEnv = (name) => {
  const value = process.env[name];
  if (!value) {
    throw new Error("Missing required environment variable: " + name);
  }
  return value;
};

const url = requiredEnv("NEXT_PUBLIC_SUPABASE_URL");
const publishableKey = requiredEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY");
const serviceRoleKey = requiredEnv("SUPABASE_SERVICE_ROLE_KEY");

const anonymous = createClient(url, publishableKey, {
  auth: {
    autoRefreshToken: false,
    detectSessionInUrl: false,
    persistSession: false,
  },
});

const { data: visibleDestinations, error: readError } = await anonymous
  .from("destinations")
  .select("slug, hero_image_alt");

if (readError) {
  throw new Error("Anonymous destination read failed: " + readError.message);
}

if (
  !visibleDestinations?.every(
    (destination) =>
      typeof destination.slug === "string" &&
      typeof destination.hero_image_alt === "string" &&
      destination.hero_image_alt.trim().length > 0,
  )
) {
  throw new Error(
    "RLS/data contract failure: a public destination has invalid alt text.",
  );
}

const probeSlug = "__anonymous-rls-probe__";
const { error: writeError } = await anonymous.from("destinations").insert({
  slug: probeSlug,
  name: "Anonymous RLS probe",
  region: "Security test",
  hero_image: "/destinations/cebu.webp",
  hero_image_alt: "Security test image",
  summary: "This insert must be rejected by RLS.",
  description: "This insert must be rejected by RLS.",
  highlights: ["Security test"],
  suitable_for: ["Security test"],
  inquiry_destination_value: probeSlug,
});

if (!writeError) {
  const admin = createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false,
    },
  });
  await admin.from("destinations").delete().eq("slug", probeSlug);
  throw new Error("RLS failure: an anonymous destination insert was accepted.");
}

console.log(
  JSON.stringify(
    {
      anonymousRead: "allowed",
      visibleDestinations: visibleDestinations.length,
      anonymousWrite: "rejected",
      rejectedCode: writeError.code ?? null,
    },
    null,
    2,
  ),
);
