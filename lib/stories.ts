import "server-only";

import {
  assertImageExists,
  createImageUploadUrl,
  removeImage,
} from "@/lib/image-storage";
import {
  STORY_IMAGE_MAX_BYTES,
  STORY_IMAGE_MIME_TYPES,
  STORY_SELECT,
  isStoryId,
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

export async function createAdminStory(input: StoryFormInput): Promise<Story> {
  const supabase = createAdminSupabaseClient();
  const slug = await nextStorySlug(supabase, input.title);

  await assertImageExists(STORY_BUCKET, input.coverImagePath);

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
  await assertImageExists(STORY_BUCKET, input.coverImagePath);

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
    await removeImage(STORY_BUCKET, existing.coverImagePath);
  }

  return updated;
}

export async function deleteStoryImage(path: string): Promise<void> {
  await removeImage(STORY_BUCKET, path);
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

  await removeImage(STORY_BUCKET, existing.coverImagePath);
}

export async function createStoryImageUploadUrl(
  contentType: string,
  byteSize: number,
): Promise<{ path: string; token: string }> {
  return createImageUploadUrl(
    STORY_BUCKET,
    contentType,
    byteSize,
    STORY_IMAGE_MIME_TYPES,
    STORY_IMAGE_MAX_BYTES,
  );
}
