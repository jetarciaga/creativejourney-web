// Phase 0 regression guard (P0-3). The pre-rebuild site got src/assets down
// to 1.6MB with no single file over ~190KB, after starting at 14MB. Nothing
// currently stops the rebuild silently re-inflating that. This walks
// public/ — where the rebuilt site's static images live — and fails the
// same way P0-3's original acceptance criterion would.
import { describe, expect, it } from "vitest";
import { readdirSync, statSync } from "node:fs";
import path from "node:path";

const TOTAL_BUDGET_BYTES = 2 * 1024 * 1024; // 2MB
const PER_FILE_BUDGET_BYTES = 300 * 1024; // 300KB
const IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif", ".gif", ".svg"]);

function walkImages(dir: string): { path: string; size: number }[] {
  const entries = readdirSync(dir, { withFileTypes: true });
  return entries.flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return walkImages(full);
    if (!IMAGE_EXTENSIONS.has(path.extname(entry.name).toLowerCase())) return [];
    return [{ path: full, size: statSync(full).size }];
  });
}

describe("Phase 0 asset budget (P0-3)", () => {
  const publicDir = path.resolve(__dirname, "../../public");
  const images = walkImages(publicDir);
  const totalBytes = images.reduce((sum, img) => sum + img.size, 0);

  it("keeps total public/ image weight under 2MB", () => {
    expect(totalBytes).toBeLessThan(TOTAL_BUDGET_BYTES);
  });

  it("keeps every individual image under 300KB", () => {
    const offenders = images.filter((img) => img.size > PER_FILE_BUDGET_BYTES);
    expect(
      offenders.map((o) => `${o.path} (${Math.round(o.size / 1024)}KB)`),
    ).toEqual([]);
  });
});
