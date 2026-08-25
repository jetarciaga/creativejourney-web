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

export async function createStory(formData: FormData) {
  await requireAdmin();
  const input = parseStoryForm(formData);
  const story = await createAdminStory(input);

  revalidateStoryPaths(story.slug);
  redirect("/admin/stories");
}

export async function updateStory(id: string, formData: FormData) {
  await requireAdmin();

  if (!isStoryId(id)) {
    throw new Error("Invalid story id.");
  }

  const existing = await getAdminStoryById(id);
  if (!existing) {
    throw new Error("Story not found.");
  }

  const input = parseStoryForm(formData);
  const story = await updateAdminStory(id, input);

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
