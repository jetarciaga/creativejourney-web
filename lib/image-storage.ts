import "server-only";

import { createAdminSupabaseClient } from "@/lib/supabase/admin";

const imageExtensions: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
};
const storageImagePathPattern =
  /^\d{4}\/[0-9a-f-]{36}\.(jpe?g|png|webp|avif)$/;

function imageLabel(bucket: string): string {
  if (bucket === "story-images") return "story image";
  if (bucket === "destination-images") return "destination image";
  return "image";
}

function titleCase(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function maxBytesLabel(maxBytes: number): string {
  return maxBytes === 10 * 1024 * 1024 ? "10MB" : maxBytes + " bytes";
}

export type ImageUploadUrl = {
  path: string;
  token: string;
};

export function isStorageImagePath(value: unknown): value is string {
  return typeof value === "string" && storageImagePathPattern.test(value);
}

export async function createImageUploadUrl(
  bucket: string,
  contentType: string,
  byteSize: number,
  allowedMimeTypes: readonly string[],
  maxBytes: number,
): Promise<ImageUploadUrl> {
  const label = imageLabel(bucket);

  if (!allowedMimeTypes.includes(contentType)) {
    throw new Error("Unsupported " + label + " MIME type.");
  }

  if (!Number.isInteger(byteSize) || byteSize <= 0 || byteSize > maxBytes) {
    throw new Error(
      titleCase(label) +
        " size must be between 1 byte and " +
        maxBytesLabel(maxBytes) +
        ".",
    );
  }

  const extension = imageExtensions[contentType];
  if (!extension) {
    throw new Error("Unsupported " + label + " MIME type.");
  }

  const year = new Date().getUTCFullYear();
  const path = `${year}/${crypto.randomUUID()}.${extension}`;
  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUploadUrl(path);

  if (error || !data?.token) {
    throw new Error(
      "Creating " +
        label +
        " upload URL failed: " +
        (error?.message ?? "no token returned"),
    );
  }

  return { path, token: data.token };
}

export async function assertImageExists(bucket: string, path: string): Promise<void> {
  const label = imageLabel(bucket);

  if (!isStorageImagePath(path)) {
    throw new Error("Invalid " + label + " path.");
  }

  const separator = path.lastIndexOf("/");
  const folder = path.slice(0, separator);
  const fileName = path.slice(separator + 1);
  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase.storage
    .from(bucket)
    .list(folder, { limit: 100, search: fileName });

  if (error) {
    throw new Error("Checking " + label + " failed: " + error.message);
  }

  if (!data?.some((file) => file.name === fileName)) {
    throw new Error(titleCase(label) + " was not found in Storage.");
  }
}

export async function removeImage(bucket: string, path: string): Promise<void> {
  const label = imageLabel(bucket);

  if (!isStorageImagePath(path)) {
    throw new Error("Invalid " + label + " path.");
  }

  const supabase = createAdminSupabaseClient();
  const { error } = await supabase.storage.from(bucket).remove([path]);

  if (error) {
    throw new Error("Removing " + label + " failed: " + error.message);
  }
}

export function storageImageUrl(bucket: string, path: string): string {
  if (!isStorageImagePath(path)) {
    throw new Error("Invalid " + imageLabel(bucket) + " path.");
  }

  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!baseUrl) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL.");
  }

  return baseUrl.replace(/\/+$/, "") + "/storage/v1/object/public/" + bucket + "/" + path;
}
