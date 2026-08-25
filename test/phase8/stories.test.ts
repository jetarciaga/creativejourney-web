import { readFileSync } from "node:fs";
import path from "node:path";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  STORY_BODY_MAX_CHARS,
  STORY_IMAGE_MAX_BYTES,
  STORY_SELECT,
  parseStoryForm,
  slugifyTitle,
  storyExcerpt,
  storyFromRow,
  storyImageUrl,
  toStoryRow,
} from "@/lib/story-model";

const publicSupabaseMock = vi.hoisted(() => ({
  from: vi.fn(),
}));

vi.mock("@/lib/supabase/public", () => ({
  createPublicSupabaseClient: () => publicSupabaseMock,
}));
vi.mock("@/lib/supabase/admin", () => ({
  createAdminSupabaseClient: vi.fn(),
}));

import { getStoryBySlug, listStories } from "@/lib/stories";

const migrationsDir = path.resolve(__dirname, "../../migrations");

const validRow = {
  id: "11111111-1111-4111-8111-111111111111",
  slug: "a-well-run-program-in-cebu",
  title: "A well-run program in Cebu",
  story_date: "2026-08-12",
  cover_image_path:
    "2026/11111111-1111-4111-8111-111111111111.webp",
  cover_image_alt: "A group of travellers beside the sea in Cebu",
  body: "The team needed a practical island program.\n\nWe shaped the route around their brief.",
  published: true,
  created_at: "2026-08-13T00:00:00.000Z",
  updated_at: "2026-08-13T00:00:00.000Z",
};

function validFormData() {
  const formData = new FormData();
  formData.set("title", validRow.title);
  formData.set("storyDate", validRow.story_date);
  formData.set("coverImagePath", validRow.cover_image_path);
  formData.set("coverImageAlt", validRow.cover_image_alt);
  formData.set("body", validRow.body);
  formData.set("published", "on");
  return formData;
}

describe("Stage 8 story migrations", () => {
  it("restricts story reads to published rows and keeps writes server-only", () => {
    const migration = readFileSync(
      path.join(migrationsDir, "006_stories.sql"),
      "utf8",
    );

    expect(migration).toMatch(/create table public\.stories/i);
    expect(migration).toMatch(/cover_image_alt\s+text\s+not null/i);
    expect(migration).toMatch(
      /alter table public\.stories enable row level security/i,
    );
    expect(migration).toMatch(
      /revoke all on public\.stories from anon, authenticated/i,
    );
    expect(migration).toMatch(/using\s*\(published\s*=\s*true\)/i);
  });

  it("creates a public read-only story image bucket", () => {
    const migration = readFileSync(
      path.join(migrationsDir, "007_story-images-bucket.sql"),
      "utf8",
    );

    expect(migration).toMatch(/insert into storage\.buckets/i);
    expect(migration).toMatch(/'story-images'\s*,\s*'story-images'\s*,\s*true/i);
    expect(migration).toMatch(/10485760/);
    expect(migration).toMatch(
      /array\s*\[\s*'image\/jpeg'\s*,\s*'image\/png'\s*,\s*'image\/webp'\s*,\s*'image\/avif'\s*\]/i,
    );
    expect(migration).not.toMatch(
      /create policy[\s\S]*for\s+insert[\s\S]*to\s+anon/i,
    );
  });
});

describe("stories data contract", () => {
  it("maps a database row into the public story shape", () => {
    expect(storyFromRow(validRow)).toEqual({
      id: validRow.id,
      slug: validRow.slug,
      title: validRow.title,
      storyDate: validRow.story_date,
      coverImagePath: validRow.cover_image_path,
      coverImageAlt: validRow.cover_image_alt,
      body: validRow.body,
      published: true,
      createdAt: validRow.created_at,
      updatedAt: validRow.updated_at,
    });
    expect(STORY_SELECT).toContain("cover_image_alt");
  });

  it("parses the four story fields and publishing state", () => {
    expect(parseStoryForm(validFormData())).toEqual({
      title: validRow.title,
      storyDate: validRow.story_date,
      coverImagePath: validRow.cover_image_path,
      coverImageAlt: validRow.cover_image_alt,
      body: validRow.body,
      published: true,
    });
  });

  it("rejects a blank cover image alt in both form and database row", () => {
    const missingAlt = validFormData();
    missingAlt.set("coverImageAlt", " ");
    expect(() => parseStoryForm(missingAlt)).toThrow(/coverImageAlt/);

    expect(() => storyFromRow({ ...validRow, cover_image_alt: " " })).toThrow(
      /cover_image_alt/,
    );
  });

  it("rejects missing titles, oversize bodies, invalid dates, and unsafe image paths", () => {
    const missingTitle = validFormData();
    missingTitle.set("title", "");
    expect(() => parseStoryForm(missingTitle)).toThrow(/title/);

    const oversizeBody = validFormData();
    oversizeBody.set("body", "x".repeat(STORY_BODY_MAX_CHARS + 1));
    expect(() => parseStoryForm(oversizeBody)).toThrow(/body/);

    const badDate = validFormData();
    badDate.set("storyDate", "2026-02-30");
    expect(() => parseStoryForm(badDate)).toThrow(/storyDate/);

    const badPath = validFormData();
    badPath.set("coverImagePath", "https://attacker.example/photo.webp");
    expect(() => parseStoryForm(badPath)).toThrow(/coverImagePath/);
  });

  it("generates stable slugs and supports collision suffixes", () => {
    expect(slugifyTitle("Cebu & Bohol: A Group Program")).toBe(
      "cebu-bohol-a-group-program",
    );
    expect(slugifyTitle("Cebu & Bohol: A Group Program", 2)).toBe(
      "cebu-bohol-a-group-program-2",
    );
  });

  it("derives a first-paragraph excerpt at a word boundary", () => {
    const excerpt = storyExcerpt(
      "The team needed a practical island program with clear pacing and support.\n\nThis paragraph must not appear in the card.",
      48,
    );

    expect(excerpt).toBe("The team needed a practical island program…");
    expect(excerpt).not.toContain("This paragraph");
  });

  it("composes the public Storage URL from the object path", () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co/";

    expect(storyImageUrl(validRow.cover_image_path)).toBe(
      "https://example.supabase.co/storage/v1/object/public/story-images/2026/11111111-1111-4111-8111-111111111111.webp",
    );
    expect(toStoryRow(parseStoryForm(validFormData()), validRow.slug)).toEqual({
      slug: validRow.slug,
      title: validRow.title,
      story_date: validRow.story_date,
      cover_image_path: validRow.cover_image_path,
      cover_image_alt: validRow.cover_image_alt,
      body: validRow.body,
      published: true,
    });
    expect(STORY_IMAGE_MAX_BYTES).toBe(10 * 1024 * 1024);
  });
});

describe("public story query errors", () => {
  const missingTableError = {
    code: "PGRST205",
    message: "Could not find the table 'public.stories' in the schema cache",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("propagates a missing stories table from listStories", async () => {
    const query = {
      select: vi.fn(),
      order: vi.fn(),
    };
    query.select.mockReturnValue(query);
    query.order
      .mockReturnValueOnce(query)
      .mockResolvedValueOnce({ data: null, error: missingTableError });
    publicSupabaseMock.from.mockReturnValue(query);

    await expect(listStories()).rejects.toThrow(
      "Listing stories failed: Could not find the table 'public.stories' in the schema cache",
    );
  });

  it("propagates a missing stories table from getStoryBySlug", async () => {
    const query = {
      select: vi.fn(),
      eq: vi.fn(),
      maybeSingle: vi.fn(),
    };
    query.select.mockReturnValue(query);
    query.eq.mockReturnValue(query);
    query.maybeSingle.mockResolvedValue({ data: null, error: missingTableError });
    publicSupabaseMock.from.mockReturnValue(query);

    await expect(getStoryBySlug("a-story")).rejects.toThrow(
      "Loading story failed: Could not find the table 'public.stories' in the schema cache",
    );
  });
});
