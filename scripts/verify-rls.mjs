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

const { data: visibleStories, error: storyReadError } = await anonymous
  .from("stories")
  .select("slug, published, cover_image_alt");

if (storyReadError) {
  throw new Error("Anonymous story read failed: " + storyReadError.message);
}

if (
  !visibleStories?.every(
    (story) =>
      story.published === true &&
      typeof story.slug === "string" &&
      typeof story.cover_image_alt === "string" &&
      story.cover_image_alt.trim().length > 0,
  )
) {
  throw new Error(
    "RLS/data contract failure: an anonymous story read returned a draft or invalid alt text.",
  );
}

const storyProbeSlug = "__anonymous-story-rls-probe__";
const { error: storyWriteError } = await anonymous.from("stories").insert({
  slug: storyProbeSlug,
  title: "Anonymous story RLS probe",
  story_date: "2026-01-01",
  cover_image_path: "2026/11111111-1111-4111-8111-111111111111.webp",
  cover_image_alt: "Security test image",
  body: "This insert must be rejected by RLS.",
  published: false,
});

if (!storyWriteError) {
  const admin = createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false,
    },
  });
  await admin.from("stories").delete().eq("slug", storyProbeSlug);
  throw new Error("RLS failure: an anonymous story insert was accepted.");
}

const storyImageProbePath = "__anonymous-story-upload-probe__/probe.jpg";
const { error: storyUploadError } = await anonymous.storage
  .from("story-images")
  .upload(
    storyImageProbePath,
    new Blob([new Uint8Array([255, 216, 255, 217])], { type: "image/jpeg" }),
  );

if (!storyUploadError) {
  const admin = createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false,
    },
  });
  await admin.storage.from("story-images").remove([storyImageProbePath]);
  throw new Error("RLS failure: an anonymous story image upload was accepted.");
}

const destinationImageProbePath = "__anonymous-destination-upload-probe__/probe.jpg";
const { error: destinationUploadError } = await anonymous.storage
  .from("destination-images")
  .upload(
    destinationImageProbePath,
    new Blob([new Uint8Array([255, 216, 255, 217])], { type: "image/jpeg" }),
  );

if (!destinationUploadError) {
  const admin = createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false,
    },
  });
  await admin.storage.from("destination-images").remove([destinationImageProbePath]);
  throw new Error("RLS failure: an anonymous destination image upload was accepted.");
}

console.log(
  JSON.stringify(
    {
      anonymousRead: "allowed",
      visibleDestinations: visibleDestinations.length,
      anonymousWrite: "rejected",
      rejectedCode: writeError.code ?? null,
      anonymousStoriesRead: "published-only",
      visibleStories: visibleStories.length,
      anonymousStoryWrite: "rejected",
      storyWriteRejectedCode: storyWriteError.code ?? null,
      anonymousStoryUpload: "rejected",
      storyUploadRejectedCode: storyUploadError.name ?? storyUploadError.code ?? null,
      anonymousDestinationImageUpload: "rejected",
      destinationUploadRejectedCode:
        destinationUploadError.name ?? destinationUploadError.code ?? null,
    },
    null,
    2,
  ),
);
