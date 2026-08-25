// Phase 0 regression guard (P0-6). The old public/sitemap.xml was hand
// maintained and only ever listed 3 of the site's routes. app/sitemap.ts
// and app/robots.ts are plain functions (MetadataRoute.Sitemap /
// MetadataRoute.Robots) with no Next-runtime dependency, so they're
// importable directly here — generated from the same route list every
// other Phase 0 test checks against, so it can't drift again.
import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/destinations", () => ({
  listDestinations: vi.fn().mockResolvedValue([
    {
      id: "11111111-1111-4111-8111-111111111111",
      slug: "cebu",
      updatedAt: "2026-08-15T00:00:00.000Z",
      featured: true,
    },
  ]),
}));
vi.mock("@/lib/stories", () => ({
  listStories: vi.fn().mockResolvedValue([]),
}));
import sitemap from "@/app/sitemap";
import robots from "@/app/robots";

const EXPECTED_ROUTES = ["/", "/about", "/contact", "/privacy", "/services", "/partners", "/destinations", "/stories"];

describe("Phase 0 sitemap + robots (P0-6)", () => {
  it("lists every known route in the sitemap", async () => {
    const entries = await sitemap();
    const paths = entries.map((entry) => new URL(entry.url).pathname);
    for (const route of EXPECTED_ROUTES) {
      expect(paths, `sitemap missing ${route}`).toContain(route);
    }
  });

  it("does not disallow the routes it just listed", () => {
    const config = robots();
    const rules = Array.isArray(config.rules) ? config.rules : [config.rules];
    const disallowed = rules.flatMap((rule) =>
      Array.isArray(rule.disallow) ? rule.disallow : rule.disallow ? [rule.disallow] : [],
    );
    for (const route of EXPECTED_ROUTES) {
      expect(disallowed).not.toContain(route);
    }
  });

  it("points at a sitemap from robots.txt", () => {
    const config = robots();
    expect(config.sitemap).toBeTruthy();
  });
});
