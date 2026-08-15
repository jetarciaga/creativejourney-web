// Converts "remember to replace the placeholder copy" from a hope into a
// build failure. Any real placeholder value used during the rebuild (an
// accreditation figure, a testimonial, a price) must be written as
// PLACEHOLDER_SOMETHING so this test — and eventually a build-time check —
// catches it before it reaches production.
import { describe, expect, it } from "vitest";
import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

const SCAN_DIRS = ["app", "components", "lib"];
const SENTINEL = /PLACEHOLDER_[A-Z0-9_]+/;

function walkFiles(dir: string): string[] {
  if (!statSync(dir, { throwIfNoEntry: false })) return [];
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return walkFiles(full);
    if (!/\.(tsx?|jsx?)$/.test(entry.name)) return [];
    return [full];
  });
}

describe("No PLACEHOLDER_ sentinel reachable from a rendered route", () => {
  const root = path.resolve(__dirname, "../..");
  const files = SCAN_DIRS.flatMap((dir) => walkFiles(path.join(root, dir)));

  it("found source files to scan", () => {
    // Fails loudly if the scan dirs don't exist yet, rather than passing
    // vacuously with zero files checked.
    expect(files.length).toBeGreaterThan(0);
  });

  it.each(files)("%s has no PLACEHOLDER_ sentinel", (file) => {
    const content = readFileSync(file, "utf-8");
    const match = content.match(SENTINEL);
    expect(match, `${file} contains unresolved ${match?.[0]}`).toBeNull();
  });
});
