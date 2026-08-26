import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import {
  DESTINATION_DESCRIPTION_MAX_CHARS,
  DESTINATION_DISPLAY_ORDER_MAX_CHARS,
  DESTINATION_HERO_IMAGE_ALT_MAX_CHARS,
  DESTINATION_HERO_IMAGE_MAX_CHARS,
  DESTINATION_INQUIRY_DESTINATION_VALUE_MAX_CHARS,
  DESTINATION_LIST_ITEM_MAX_CHARS,
  DESTINATION_LIST_MAX_CHARS,
  DESTINATION_LIST_MAX_ITEMS,
  DESTINATION_NAME_MAX_CHARS,
  DESTINATION_REGION_MAX_CHARS,
  DESTINATION_SLUG_MAX_CHARS,
  DESTINATION_SUMMARY_MAX_CHARS,
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

  it("exports the character limits enforced by the destination parser", () => {
    expect(DESTINATION_SLUG_MAX_CHARS).toBe(120);
    expect(DESTINATION_NAME_MAX_CHARS).toBe(120);
    expect(DESTINATION_REGION_MAX_CHARS).toBe(120);
    expect(DESTINATION_HERO_IMAGE_MAX_CHARS).toBe(500);
    expect(DESTINATION_HERO_IMAGE_ALT_MAX_CHARS).toBe(300);
    expect(DESTINATION_SUMMARY_MAX_CHARS).toBe(500);
    expect(DESTINATION_DESCRIPTION_MAX_CHARS).toBe(5000);
    expect(DESTINATION_DISPLAY_ORDER_MAX_CHARS).toBe(10);
    expect(DESTINATION_LIST_MAX_CHARS).toBe(4000);
    expect(DESTINATION_LIST_MAX_ITEMS).toBe(20);
    expect(DESTINATION_LIST_ITEM_MAX_CHARS).toBe(160);
    expect(DESTINATION_INQUIRY_DESTINATION_VALUE_MAX_CHARS).toBe(120);

    const scalarLimits = [
      ["slug", DESTINATION_SLUG_MAX_CHARS, "a"],
      ["name", DESTINATION_NAME_MAX_CHARS, "x"],
      ["region", DESTINATION_REGION_MAX_CHARS, "x"],
      ["heroImage", DESTINATION_HERO_IMAGE_MAX_CHARS, "x"],
      ["heroImageAlt", DESTINATION_HERO_IMAGE_ALT_MAX_CHARS, "x"],
      ["summary", DESTINATION_SUMMARY_MAX_CHARS, "x"],
      ["description", DESTINATION_DESCRIPTION_MAX_CHARS, "x"],
      ["displayOrder", DESTINATION_DISPLAY_ORDER_MAX_CHARS, "1"],
      [
        "inquiryDestinationValue",
        DESTINATION_INQUIRY_DESTINATION_VALUE_MAX_CHARS,
        "x",
      ],
    ] as const;

    for (const [field, maximum, character] of scalarLimits) {
      const formData = validFormData();
      formData.set(field, character.repeat(maximum + 1));
      expect(() => parseDestinationForm(formData)).toThrow(
        `${field} must be ${maximum} characters or fewer.`,
      );
    }

    const listTextLimit = validFormData();
    listTextLimit.set("highlights", "x".repeat(DESTINATION_LIST_MAX_CHARS + 1));
    expect(() => parseDestinationForm(listTextLimit)).toThrow(
      `highlights must be ${DESTINATION_LIST_MAX_CHARS} characters or fewer.`,
    );

    const itemLimit = validFormData();
    itemLimit.set(
      "suitableFor",
      "x".repeat(DESTINATION_LIST_ITEM_MAX_CHARS + 1),
    );
    expect(() => parseDestinationForm(itemLimit)).toThrow(
      "suitableFor values must be 160 characters or fewer.",
    );

    const itemCountLimit = validFormData();
    itemCountLimit.set(
      "highlights",
      Array.from({ length: DESTINATION_LIST_MAX_ITEMS + 1 }, (_, index) =>
        `item ${index}`,
      ).join("\n"),
    );
    expect(() => parseDestinationForm(itemCountLimit)).toThrow(
      `highlights must contain between 1 and ${DESTINATION_LIST_MAX_ITEMS} values.`,
    );
  });
});
