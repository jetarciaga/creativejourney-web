"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/authz";
import {
  createAdminStory,
  createStoryImageUploadUrl,
  deleteAdminStory,
  getAdminStoryById,
  updateAdminStory,
} from "@/lib/stories";
import { isStoryId, parseStoryForm } from "@/lib/story-model";

function revalidateStoryPaths(...slugs: string[]) {
  revalidatePath("/");
  revalidatePath("/stories");
  revalidatePath("/sitemap.xml");
  revalidatePath("/admin/stories");

  for (const slug of new Set(slugs.filter(Boolean))) {
    revalidatePath("/stories/" + slug);
  }
}

type StoryActionState = { error: string };

function actionError(error: unknown, fallback: string): StoryActionState {
  return {
    error: error instanceof Error ? error.message : fallback,
  };
}

export async function createStory(
  prevState: StoryActionState,
  formData: FormData,
): Promise<StoryActionState> {
  void prevState;
  await requireAdmin();

  let input: ReturnType<typeof parseStoryForm>;
  try {
    input = parseStoryForm(formData);
  } catch (error) {
    return actionError(error, "The story details could not be validated.");
  }

  let story: Awaited<ReturnType<typeof createAdminStory>>;
  try {
    story = await createAdminStory(input);
  } catch (error) {
    return actionError(error, "The story could not be saved.");
  }

  revalidateStoryPaths(story.slug);
  redirect("/admin/stories");
}

export async function updateStory(
  id: string,
  prevState: StoryActionState,
  formData: FormData,
): Promise<StoryActionState> {
  void prevState;
  await requireAdmin();

  if (!isStoryId(id)) {
    throw new Error("Invalid story id.");
  }

  const existing = await getAdminStoryById(id);
  if (!existing) {
    throw new Error("Story not found.");
  }

  let input: ReturnType<typeof parseStoryForm>;
  try {
    input = parseStoryForm(formData);
  } catch (error) {
    return actionError(error, "The story details could not be validated.");
  }

  let story: Awaited<ReturnType<typeof updateAdminStory>>;
  try {
    story = await updateAdminStory(id, input);
  } catch (error) {
    return actionError(error, "The story could not be saved.");
  }

  revalidateStoryPaths(existing.slug, story.slug);
  redirect("/admin/stories/" + id + "/edit");
}

export async function deleteStory(id: string) {
  await requireAdmin();

  if (!isStoryId(id)) {
    throw new Error("Invalid story id.");
  }

  const existing = await getAdminStoryById(id);
  if (!existing) {
    throw new Error("Story not found.");
  }

  await deleteAdminStory(id);
  revalidateStoryPaths(existing.slug);
  redirect("/admin/stories");
}

export async function requestStoryImageUpload(
  contentType: string,
  byteSize: number,
) {
  await requireAdmin();
  return createStoryImageUploadUrl(contentType, byteSize);
}
