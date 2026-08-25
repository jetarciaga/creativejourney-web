// Phase 0 / rebuild-plan guard: every route the site is supposed to have
// must resolve to a real page.tsx, not silently fall through to a 404 —
// which is exactly what happened to /services under the old Vite router
// (linked from Navbar and Footer, but no <Route> existed for it, so it
// fell through to the catch-all "coming soon" page).
import { describe, expect, it } from "vitest";
import { existsSync } from "node:fs";
import path from "node:path";

const appDir = path.resolve(__dirname, "../../app");

const EXPECTED_PAGES = [
  "page.tsx", // /
  "about/page.tsx",
  "contact/page.tsx",
  "privacy/page.tsx",
  "services/page.tsx",
  "services/fit/page.tsx",
  "services/git/page.tsx",
  "services/mice/page.tsx",
  "partners/page.tsx",
  "destinations/page.tsx",
  "destinations/[slug]/page.tsx",
  "stories/page.tsx",
  "not-found.tsx",
];

describe("Every planned route has a real page (P0-1/P0-2 regression, /services fix)", () => {
  it.each(EXPECTED_PAGES)("app/%s exists", (relativePath) => {
    expect(existsSync(path.join(appDir, relativePath))).toBe(true);
  });
});
