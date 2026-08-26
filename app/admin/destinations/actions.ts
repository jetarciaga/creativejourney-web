"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/authz";
import {
  createDestinationImageUploadUrl,
  createAdminDestination,
  deleteAdminDestination,
  getAdminDestinationById,
  updateAdminDestination,
} from "@/lib/destinations";
import { isDestinationId, parseDestinationForm } from "@/lib/destination-model";

function revalidateDestinationPaths(...slugs: string[]) {
  revalidatePath("/");
  revalidatePath("/destinations");
  revalidatePath("/sitemap.xml");

  for (const slug of new Set(slugs.filter(Boolean))) {
    revalidatePath("/destinations/" + slug);
  }
}

type DestinationActionState = { error: string };

function actionError(error: unknown, fallback: string): DestinationActionState {
  return {
    error: error instanceof Error ? error.message : fallback,
  };
}

export async function requestDestinationImageUpload(
  contentType: string,
  byteSize: number,
): Promise<{ path: string; token: string }> {
  await requireAdmin();
  return createDestinationImageUploadUrl(contentType, byteSize);
}

export async function createDestination(
  prevState: DestinationActionState,
  formData: FormData,
): Promise<DestinationActionState> {
  void prevState;
  await requireAdmin();

  let input: ReturnType<typeof parseDestinationForm>;
  try {
    input = parseDestinationForm(formData);
  } catch (error) {
    return actionError(error, "The destination details could not be validated.");
  }

  let destination: Awaited<ReturnType<typeof createAdminDestination>>;
  try {
    destination = await createAdminDestination(input);
  } catch (error) {
    return actionError(error, "The destination could not be saved.");
  }

  revalidateDestinationPaths(destination.slug);
  redirect("/admin/destinations");
}

export async function updateDestination(
  id: string,
  prevState: DestinationActionState,
  formData: FormData,
): Promise<DestinationActionState> {
  void prevState;
  await requireAdmin();

  if (!isDestinationId(id)) {
    throw new Error("Invalid destination id.");
  }

  const existing = await getAdminDestinationById(id);
  if (!existing) {
    throw new Error("Destination not found.");
  }

  let input: ReturnType<typeof parseDestinationForm>;
  try {
    input = parseDestinationForm(formData);
  } catch (error) {
    return actionError(error, "The destination details could not be validated.");
  }

  let destination: Awaited<ReturnType<typeof updateAdminDestination>>;
  try {
    destination = await updateAdminDestination(id, input);
  } catch (error) {
    return actionError(error, "The destination could not be saved.");
  }

  revalidateDestinationPaths(existing.slug, destination.slug);
  redirect("/admin/destinations/" + id + "/edit");
}

export async function deleteDestination(id: string) {
  await requireAdmin();

  const existing = await getAdminDestinationById(id);
  if (!existing) {
    throw new Error("Destination not found.");
  }

  await deleteAdminDestination(id);
  revalidateDestinationPaths(existing.slug);
  redirect("/admin/destinations");
}
