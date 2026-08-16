"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/authz";
import {
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

export async function createDestination(formData: FormData) {
  await requireAdmin();
  const input = parseDestinationForm(formData);
  const destination = await createAdminDestination(input);

  revalidateDestinationPaths(destination.slug);
  redirect("/admin");
}

export async function updateDestination(id: string, formData: FormData) {
  await requireAdmin();

  if (!isDestinationId(id)) {
    throw new Error("Invalid destination id.");
  }

  const existing = await getAdminDestinationById(id);
  if (!existing) {
    throw new Error("Destination not found.");
  }

  const input = parseDestinationForm(formData);
  const destination = await updateAdminDestination(id, input);

  revalidateDestinationPaths(existing.slug, destination.slug);
  redirect("/admin/" + id + "/edit");
}

export async function deleteDestination(id: string) {
  await requireAdmin();

  const existing = await getAdminDestinationById(id);
  if (!existing) {
    throw new Error("Destination not found.");
  }

  await deleteAdminDestination(id);
  revalidateDestinationPaths(existing.slug);
  redirect("/admin");
}
