import {
  isStorageImagePath,
  storageImageUrl,
} from "@/lib/image-storage";

export type Story = {
  id: string;
  slug: string;
  title: string;
  storyDate: string;
  coverImagePath: string;
  coverImageAlt: string;
  body: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
};

export type StoryFormInput = {
  title: string;
  storyDate: string;
  coverImagePath: string;
  coverImageAlt: string;
  body: string;
  published: boolean;
};

export const STORY_SELECT =
  "id, slug, title, story_date, cover_image_path, cover_image_alt, body, published, created_at, updated_at";

export const STORY_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
] as const;

export const STORY_IMAGE_MAX_BYTES = 10 * 1024 * 1024;
export const STORY_TITLE_MAX_CHARS = 160;
export const STORY_BODY_MAX_CHARS = 12000;
export const STORY_IMAGE_ALT_MAX_CHARS = 300;

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const storyIdPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isStoryId(value: unknown): value is string {
  return typeof value === "string" && storyIdPattern.test(value);
}

export function isStoryImagePath(value: unknown): value is string {
  return isStorageImagePath(value);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object");
}

function rowText(row: Record<string, unknown>, field: string): string {
  const value = row[field];

  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error("Supabase returned an invalid story " + field + ".");
  }

  return value;
}

function isDateText(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const date = new Date(value + "T00:00:00.000Z");
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function validateDateText(value: string, field: string): string {
  if (!isDateText(value)) {
    throw new Error(field + " must be a valid date in YYYY-MM-DD format.");
  }

  return value;
}

export function storyFromRow(value: unknown): Story {
  if (!isRecord(value)) {
    throw new Error("Supabase returned an invalid story row.");
  }

  const id = rowText(value, "id");
  const slug = rowText(value, "slug");
  const title = rowText(value, "title");
  const storyDate = validateDateText(rowText(value, "story_date"), "story_date");
  const coverImagePath = rowText(value, "cover_image_path");
  const coverImageAlt = rowText(value, "cover_image_alt");
  const body = rowText(value, "body");
  const createdAt = rowText(value, "created_at");
  const updatedAt = rowText(value, "updated_at");

  if (typeof value.published !== "boolean") {
    throw new Error("Supabase returned an invalid story published flag.");
  }

  return {
    id,
    slug,
    title,
    storyDate,
    coverImagePath,
    coverImageAlt,
    body,
    published: value.published,
    createdAt,
    updatedAt,
  };
}

function formText(formData: FormData, field: string, maximum: number): string {
  const value = formData.get(field);

  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(field + " is required.");
  }

  const trimmed = value.trim();
  if (trimmed.length > maximum) {
    throw new Error(field + " must be " + maximum + " characters or fewer.");
  }

  return trimmed;
}

export function parseStoryForm(formData: FormData): StoryFormInput {
  const title = formText(formData, "title", STORY_TITLE_MAX_CHARS);
  const storyDate = validateDateText(
    formText(formData, "storyDate", 10),
    "storyDate",
  );
  const coverImagePath = formText(formData, "coverImagePath", 100);

  if (!isStoryImagePath(coverImagePath)) {
    throw new Error("coverImagePath must be a validated story image path.");
  }

  return {
    title,
    storyDate,
    coverImagePath,
    coverImageAlt: formText(formData, "coverImageAlt", STORY_IMAGE_ALT_MAX_CHARS),
    body: formText(formData, "body", STORY_BODY_MAX_CHARS),
    published: formData.get("published") === "on" || formData.get("published") === "true",
  };
}

export function toStoryRow(input: StoryFormInput, slug: string) {
  if (!slugPattern.test(slug)) {
    throw new Error("Invalid story slug.");
  }

  return {
    slug,
    title: input.title,
    story_date: input.storyDate,
    cover_image_path: input.coverImagePath,
    cover_image_alt: input.coverImageAlt,
    body: input.body,
    published: input.published,
  };
}

export function slugifyTitle(title: string, collisionNumber = 1): string {
  const base = title
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "story";

  if (!Number.isInteger(collisionNumber) || collisionNumber < 1) {
    throw new Error("collisionNumber must be a positive integer.");
  }

  return collisionNumber === 1 ? base : `${base}-${collisionNumber}`;
}

export function storyExcerpt(body: string, maximum = 180): string {
  const firstParagraph = body.trim().split(/\n\s*\n/)[0]?.replace(/\s+/g, " ").trim() ?? "";

  if (firstParagraph.length <= maximum) {
    return firstParagraph;
  }

  const candidate = firstParagraph.slice(0, maximum).trimEnd();
  const boundary = candidate.lastIndexOf(" ");
  const truncated = boundary > 0 ? candidate.slice(0, boundary) : candidate;
  return truncated.trimEnd() + "…";
}

export function storyImageUrl(path: string): string {
  return storageImageUrl("story-images", path);
}
