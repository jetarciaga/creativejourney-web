import {
  isStorageImagePath,
  storageImageUrl,
} from "@/lib/image-storage";

export { isStorageImagePath };

export type Destination = {
  id: string;
  slug: string;
  name: string;
  region: string;
  heroImage: string;
  heroImageAlt: string;
  summary: string;
  description: string;
  highlights: string[];
  suitableFor: string[];
  featured: boolean;
  displayOrder: number;
  inquiryDestinationValue: string;
  createdAt: string;
  updatedAt: string;
};

export type DestinationFormInput = {
  slug: string;
  name: string;
  region: string;
  heroImage: string;
  heroImageAlt: string;
  summary: string;
  description: string;
  highlights: string[];
  suitableFor: string[];
  featured: boolean;
  displayOrder: number;
  inquiryDestinationValue: string;
};

export const DESTINATION_SELECT =
  "id, slug, name, region, hero_image, hero_image_alt, summary, description, highlights, suitable_for, featured, display_order, inquiry_destination_value, created_at, updated_at";

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const destinationIdPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isDestinationId(value: unknown): value is string {
  return typeof value === "string" && destinationIdPattern.test(value);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object");
}

function rowText(row: Record<string, unknown>, field: string): string {
  const value = row[field];

  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error("Supabase returned an invalid destination " + field + ".");
  }

  return value;
}

function rowStringArray(row: Record<string, unknown>, field: string): string[] {
  const value = row[field];

  if (!Array.isArray(value) || !value.every((item) => typeof item === "string")) {
    throw new Error("Supabase returned an invalid destination " + field + ".");
  }

  return value;
}

export function destinationFromRow(value: unknown): Destination {
  if (!isRecord(value)) {
    throw new Error("Supabase returned an invalid destination row.");
  }

  const id = rowText(value, "id");
  const slug = rowText(value, "slug");
  const name = rowText(value, "name");
  const region = rowText(value, "region");
  const heroImage = rowText(value, "hero_image");
  const heroImageAlt = rowText(value, "hero_image_alt");
  const summary = rowText(value, "summary");
  const description = rowText(value, "description");
  const highlights = rowStringArray(value, "highlights");
  const suitableFor = rowStringArray(value, "suitable_for");
  const inquiryDestinationValue = rowText(value, "inquiry_destination_value");
  const createdAt = rowText(value, "created_at");
  const updatedAt = rowText(value, "updated_at");

  if (typeof value.featured !== "boolean") {
    throw new Error("Supabase returned an invalid destination featured flag.");
  }

  if (
    typeof value.display_order !== "number" ||
    !Number.isInteger(value.display_order)
  ) {
    throw new Error("Supabase returned an invalid destination display order.");
  }

  return {
    id,
    slug,
    name,
    region,
    heroImage,
    heroImageAlt,
    summary,
    description,
    highlights,
    suitableFor,
    featured: value.featured,
    displayOrder: value.display_order,
    inquiryDestinationValue,
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

function formList(formData: FormData, field: string, maximumItems: number): string[] {
  const value = formText(formData, field, 4000);
  const items = value
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter(Boolean);

  if (items.length === 0 || items.length > maximumItems) {
    throw new Error(
      field + " must contain between 1 and " + maximumItems + " values.",
    );
  }

  if (items.some((item) => item.length > 160)) {
    throw new Error(field + " values must be 160 characters or fewer.");
  }

  return [...new Set(items)];
}

export function parseDestinationForm(formData: FormData): DestinationFormInput {
  const slug = formText(formData, "slug", 120).toLowerCase();
  if (!slugPattern.test(slug)) {
    throw new Error(
      "slug must contain only lowercase letters, numbers, and single hyphens.",
    );
  }

  const heroImage = formText(formData, "heroImage", 500);
  if (!heroImage.startsWith("/") && !isStorageImagePath(heroImage)) {
    throw new Error("heroImage must be a local path or a validated Storage image path.");
  }

  const displayOrderText = formText(formData, "displayOrder", 10);
  const displayOrder = Number(displayOrderText);
  if (!Number.isInteger(displayOrder) || displayOrder < 0 || displayOrder > 9999) {
    throw new Error("displayOrder must be an integer from 0 to 9999.");
  }

  return {
    slug,
    name: formText(formData, "name", 120),
    region: formText(formData, "region", 120),
    heroImage,
    heroImageAlt: formText(formData, "heroImageAlt", 300),
    summary: formText(formData, "summary", 500),
    description: formText(formData, "description", 5000),
    highlights: formList(formData, "highlights", 20),
    suitableFor: formList(formData, "suitableFor", 20),
    featured: formData.get("featured") === "on" || formData.get("featured") === "true",
    displayOrder,
    inquiryDestinationValue: formText(formData, "inquiryDestinationValue", 120),
  };
}

export function destinationImageUrl(path: string): string {
  return storageImageUrl("destination-images", path);
}

export function toDestinationRow(input: DestinationFormInput) {
  return {
    slug: input.slug,
    name: input.name,
    region: input.region,
    hero_image: input.heroImage,
    hero_image_alt: input.heroImageAlt,
    summary: input.summary,
    description: input.description,
    highlights: input.highlights,
    suitable_for: input.suitableFor,
    featured: input.featured,
    display_order: input.displayOrder,
    inquiry_destination_value: input.inquiryDestinationValue,
  };
}
