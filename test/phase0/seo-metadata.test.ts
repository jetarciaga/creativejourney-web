// Phase 0 regression guard (P0-5). index.html carried a full set of SEO/OG
// tags before the rebuild — title, description, canonical, og:*, twitter:*.
// This is a CSR-turned-SSG site: the rendered HTML is the only thing a
// crawler or an unfurler (WhatsApp, LinkedIn, Slack) ever sees, so losing
// this silently is a real regression, not a cosmetic one.
//
// lib/seo.ts must have no Next-specific imports (no next/font, no
// server-only APIs) so this file can import it directly without going
// through Next's build pipeline.
import { describe, expect, it } from "vitest";
import { SITE, absoluteUrl, routeMetadata } from "@/lib/seo";

describe("Phase 0 SEO metadata (P0-5)", () => {
  it("defines site-wide identity used to seed every route", () => {
    expect(SITE.name).toBeTruthy();
    expect(SITE.description.length).toBeGreaterThan(20);
    expect(SITE.ogImage).toMatch(/\.(jpg|jpeg|png)$/);
  });

  it("resolves absolute URLs against the production origin", () => {
    expect(absoluteUrl("/about")).toMatch(/^https:\/\/.+\/about$/);
  });

  it.each(["/", "/about", "/contact", "/privacy", "/services", "/partners", "/destinations", "/stories"])(
    "gives %s a title, a description, and Open Graph + Twitter cards",
    (route) => {
      const meta = routeMetadata[route];
      expect(meta, `no metadata registered for ${route}`).toBeDefined();
      if (!meta) throw new Error(`no metadata registered for ${route}`);
      expect(meta.title.length).toBeGreaterThan(0);
      expect(meta.description.length).toBeGreaterThan(20);
      expect(meta.openGraph?.title).toBeTruthy();
      expect(meta.openGraph?.description).toBeTruthy();
      expect(meta.openGraph?.images).toBeTruthy();
      expect(meta.twitter?.card).toBe("summary_large_image");
    },
  );
});
