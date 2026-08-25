import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import {
  destinationFromRow,
  destinationImageUrl,
  parseDestinationForm,
} from "@/lib/destination-model";

const validRow = {
  id: "11111111-1111-4111-8111-111111111111",
  slug: "cebu",
  name: "Cebu",
  region: "Central Visayas",
  hero_image: "/destinations/cebu.webp",
  hero_image_alt: "A whale shark swimming beneath a snorkeller in clear blue water",
  summary: "Island energy, heritage, and ocean adventures in one flexible program.",
  description: "A flexible destination for island adventures and considered group programs.",
  highlights: ["Whale shark encounters", "Heritage experiences"],
  suitable_for: ["FIT", "GIT", "MICE"],
  featured: true,
  display_order: 1,
  inquiry_destination_value: "cebu",
  created_at: "2026-08-15T00:00:00.000Z",
  updated_at: "2026-08-15T00:00:00.000Z",
};

function validFormData() {
  const formData = new FormData();
  formData.set("slug", "cebu");
  formData.set("name", "Cebu");
  formData.set("region", "Central Visayas");
  formData.set("heroImage", "/destinations/cebu.webp");
  formData.set("heroImageAlt", validRow.hero_image_alt);
  formData.set("summary", validRow.summary);
  formData.set("description", validRow.description);
  formData.set("highlights", "Whale shark encounters\nHeritage experiences");
  formData.set("suitableFor", "FIT, GIT, MICE");
  formData.set("featured", "on");
  formData.set("displayOrder", "1");
  formData.set("inquiryDestinationValue", "cebu");
  return formData;
}

describe("destinations data contract", () => {
  it("maps a database row into the public destination shape", () => {
    expect(destinationFromRow(validRow)).toEqual({
      id: validRow.id,
      slug: "cebu",
      name: "Cebu",
      region: "Central Visayas",
      heroImage: "/destinations/cebu.webp",
      heroImageAlt: validRow.hero_image_alt,
      summary: validRow.summary,
      description: validRow.description,
      highlights: ["Whale shark encounters", "Heritage experiences"],
      suitableFor: ["FIT", "GIT", "MICE"],
      featured: true,
      displayOrder: 1,
      inquiryDestinationValue: "cebu",
      createdAt: validRow.created_at,
      updatedAt: validRow.updated_at,
    });
  });

  it("parses the admin form into typed values and arrays", () => {
    expect(parseDestinationForm(validFormData())).toMatchObject({
      slug: "cebu",
      heroImageAlt: validRow.hero_image_alt,
      highlights: ["Whale shark encounters", "Heritage experiences"],
      suitableFor: ["FIT", "GIT", "MICE"],
      featured: true,
      displayOrder: 1,
    });
  });

  it("accepts local and Storage image paths but rejects bare HTTPS URLs", () => {
    expect(parseDestinationForm(validFormData()).heroImage).toBe(
      "/destinations/cebu.webp",
    );

    const storageImage = validFormData();
    storageImage.set(
      "heroImage",
      "2026/22222222-2222-4222-8222-222222222222.webp",
    );
    expect(parseDestinationForm(storageImage).heroImage).toBe(
      "2026/22222222-2222-4222-8222-222222222222.webp",
    );

    const externalImage = validFormData();
    externalImage.set("heroImage", "https://images.example/cebu.webp");
    expect(() => parseDestinationForm(externalImage)).toThrow(/heroImage/);
  });

  it("composes the public Storage URL for an uploaded destination image", () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co/";

    expect(
      destinationImageUrl("2026/22222222-2222-4222-8222-222222222222.webp"),
    ).toBe(
      "https://example.supabase.co/storage/v1/object/public/destination-images/2026/22222222-2222-4222-8222-222222222222.webp",
    );
  });

  it("rejects a missing hero image alt in both form and database row", () => {
    const missingAlt = validFormData();
    missingAlt.set("heroImageAlt", "");
    expect(() => parseDestinationForm(missingAlt)).toThrow(/heroImageAlt/);

    const invalidRow = { ...validRow, hero_image_alt: null };
    expect(() => destinationFromRow(invalidRow)).toThrow(/hero_image_alt/);
  });

  it("keeps the alt column required at the database boundary", () => {
    const migration = readFileSync(
      path.resolve(__dirname, "../../migrations/002_destinations.sql"),
      "utf8",
    );

    expect(migration).toMatch(/hero_image_alt\s+text\s+NOT NULL/i);
    expect(migration).toMatch(/ENABLE ROW LEVEL SECURITY/i);
    expect(migration).toMatch(/FOR SELECT\s+TO anon, authenticated/i);
  });
});
