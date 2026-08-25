import "server-only";

import {
  STORY_IMAGE_MAX_BYTES,
  STORY_IMAGE_MIME_TYPES,
  STORY_SELECT,
  isStoryId,
  isStoryImagePath,
  slugifyTitle,
  storyFromRow,
  toStoryRow,
  type Story,
  type StoryFormInput,
} from "@/lib/story-model";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { createPublicSupabaseClient } from "@/lib/supabase/public";

const STORY_BUCKET = "story-images";
const storySlugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const imageExtensions: Record<(typeof STORY_IMAGE_MIME_TYPES)[number], string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
};

function throwQueryError(operation: string, error: { message: string }): never {
  throw new Error(operation + " failed: " + error.message);
}

export async function listStories(): Promise<Story[]> {
  const supabase = createPublicSupabaseClient();
  const { data, error } = await supabase
    .from("stories")
    .select(STORY_SELECT)
    .order("story_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    throwQueryError("Listing stories", error);
  }

  return ((data ?? []) as unknown[]).map(storyFromRow);
}

export async function getStoryBySlug(slug: string): Promise<Story | null> {
  if (!storySlugPattern.test(slug)) {
    return null;
  }

  const supabase = createPublicSupabaseClient();
  const { data, error } = await supabase
    .from("stories")
    .select(STORY_SELECT)
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    throwQueryError("Loading story", error);
  }

  return data ? storyFromRow(data) : null;
}

export async function listAdminStories(): Promise<Story[]> {
  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from("stories")
    .select(STORY_SELECT)
    .order("published", { ascending: true })
    .order("story_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    throwQueryError("Listing admin stories", error);
  }

  return ((data ?? []) as unknown[]).map(storyFromRow);
}

export async function getAdminStoryById(id: string): Promise<Story | null> {
  if (!isStoryId(id)) {
    return null;
  }

  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from("stories")
    .select(STORY_SELECT)
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throwQueryError("Loading admin story", error);
  }

  return data ? storyFromRow(data) : null;
}

async function nextStorySlug(
  supabase: ReturnType<typeof createAdminSupabaseClient>,
  title: string,
): Promise<string> {
  for (let collisionNumber = 1; collisionNumber < 1000; collisionNumber += 1) {
    const slug = slugifyTitle(title, collisionNumber);
    const { data, error } = await supabase
      .from("stories")
      .select("slug")
      .eq("slug", slug)
      .maybeSingle();

    if (error) {
      throwQueryError("Checking story slug", error);
    }

    if (!data) {
      return slug;
    }
  }

  throw new Error("Could not generate a unique story slug.");
}

async function assertStoryImageExists(
  supabase: ReturnType<typeof createAdminSupabaseClient>,
  path: string,
) {
  if (!isStoryImagePath(path)) {
    throw new Error("Invalid story image path.");
  }

  const separator = path.lastIndexOf("/");
  const folder = path.slice(0, separator);
  const fileName = path.slice(separator + 1);
  const { data, error } = await supabase.storage
    .from(STORY_BUCKET)
    .list(folder, { limit: 100, search: fileName });

  if (error) {
    throwQueryError("Checking story image", error);
  }

  if (!data?.some((file) => file.name === fileName)) {
    throw new Error("Story image was not found in Storage.");
  }
}

export async function createAdminStory(input: StoryFormInput): Promise<Story> {
  const supabase = createAdminSupabaseClient();
  const slug = await nextStorySlug(supabase, input.title);

  await assertStoryImageExists(supabase, input.coverImagePath);

  const { data, error } = await supabase
    .from("stories")
    .insert(toStoryRow(input, slug))
    .select(STORY_SELECT)
    .single();

  if (error || !data) {
    throw new Error("Creating story failed: " + (error?.message ?? "no row returned"));
  }

  return storyFromRow(data);
}

export async function updateAdminStory(
  id: string,
  input: StoryFormInput,
): Promise<Story> {
  if (!isStoryId(id)) {
    throw new Error("Invalid story id.");
  }

  const supabase = createAdminSupabaseClient();
  const { data: existingRow, error: existingError } = await supabase
    .from("stories")
    .select(STORY_SELECT)
    .eq("id", id)
    .maybeSingle();

  if (existingError) {
    throwQueryError("Loading story for update", existingError);
  }
  if (!existingRow) {
    throw new Error("Story not found.");
  }

  const existing = storyFromRow(existingRow);
  await assertStoryImageExists(supabase, input.coverImagePath);

  const { data, error } = await supabase
    .from("stories")
    .update(toStoryRow(input, existing.slug))
    .eq("id", id)
    .select(STORY_SELECT)
    .single();

  if (error || !data) {
    throw new Error("Updating story failed: " + (error?.message ?? "no row returned"));
  }

  const updated = storyFromRow(data);
  if (existing.coverImagePath !== updated.coverImagePath) {
    await removeStoryImage(supabase, existing.coverImagePath);
  }

  return updated;
}

async function removeStoryImage(
  supabase: ReturnType<typeof createAdminSupabaseClient>,
  path: string,
) {
  if (!isStoryImagePath(path)) {
    throw new Error("Invalid story image path.");
  }

  const { error } = await supabase.storage.from(STORY_BUCKET).remove([path]);
  if (error) {
    throwQueryError("Removing story image", error);
  }
}

export async function deleteStoryImage(path: string): Promise<void> {
  const supabase = createAdminSupabaseClient();
  await removeStoryImage(supabase, path);
}

export async function deleteAdminStory(id: string): Promise<void> {
  if (!isStoryId(id)) {
    throw new Error("Invalid story id.");
  }

  const supabase = createAdminSupabaseClient();
  const { data: existingRow, error: existingError } = await supabase
    .from("stories")
    .select(STORY_SELECT)
    .eq("id", id)
    .maybeSingle();

  if (existingError) {
    throwQueryError("Loading story for deletion", existingError);
  }
  if (!existingRow) {
    throw new Error("Story not found.");
  }

  const existing = storyFromRow(existingRow);
  const { error } = await supabase.from("stories").delete().eq("id", id);

  if (error) {
    throwQueryError("Deleting story", error);
  }

  await removeStoryImage(supabase, existing.coverImagePath);
}

export async function createStoryImageUploadUrl(
  contentType: string,
  byteSize: number,
): Promise<{ path: string; token: string }> {
  if (!(STORY_IMAGE_MIME_TYPES as readonly string[]).includes(contentType)) {
    throw new Error("Unsupported story image MIME type.");
  }

  if (!Number.isInteger(byteSize) || byteSize <= 0 || byteSize > STORY_IMAGE_MAX_BYTES) {
    throw new Error("Story image size must be between 1 byte and 10MB.");
  }

  const extension = imageExtensions[contentType as (typeof STORY_IMAGE_MIME_TYPES)[number]];
  const year = new Date().getUTCFullYear();
  const path = `${year}/${crypto.randomUUID()}.${extension}`;
  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase.storage
    .from(STORY_BUCKET)
    .createSignedUploadUrl(path);

  if (error || !data?.token) {
    throw new Error(
      "Creating story image upload URL failed: " + (error?.message ?? "no token returned"),
    );
  }

  return { path, token: data.token };
}
