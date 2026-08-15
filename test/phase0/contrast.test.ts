// Backs Stage 4.5's logo-derived palette section of the rebuild plan.
// Codifying the ratios as a test means a future token edit that breaks
// contrast fails the build instead of shipping unnoticed.
import { describe, expect, it } from "vitest";
import { contrastRatio, palette } from "@/lib/color";

const AA_NORMAL_TEXT = 4.5;
const AA_NON_TEXT = 3;

describe("Design token contrast (WCAG 2.x)", () => {
  it("light theme: ink text on white passes AAA", () => {
    expect(contrastRatio(palette.ink900, palette.white)).toBeGreaterThanOrEqual(7);
  });

  it("light theme: muted ink text on white passes AA", () => {
    expect(contrastRatio(palette.ink500, palette.white)).toBeGreaterThanOrEqual(
      AA_NORMAL_TEXT,
    );
  });

  it("light theme: logo green-700 accent text on white passes AA", () => {
    expect(contrastRatio(palette.green700, palette.white)).toBeGreaterThanOrEqual(
      AA_NORMAL_TEXT,
    );
  });

  it("light theme: logo green-600 works as text and a CTA fill", () => {
    expect(contrastRatio(palette.green600, palette.white)).toBeGreaterThanOrEqual(
      AA_NORMAL_TEXT,
    );
    expect(contrastRatio(palette.white, palette.green600)).toBeGreaterThanOrEqual(
      AA_NORMAL_TEXT,
    );
  });

  it("metric gold passes as light text and dark-mode accent text", () => {
    expect(contrastRatio(palette.gold700, palette.white)).toBeGreaterThanOrEqual(
      AA_NORMAL_TEXT,
    );
    expect(contrastRatio(palette.gold500, palette.ink950)).toBeGreaterThanOrEqual(
      AA_NORMAL_TEXT,
    );
  });

  it("dark theme: white text on ink-950 background passes AAA", () => {
    expect(contrastRatio(palette.white, palette.ink950)).toBeGreaterThanOrEqual(7);
  });

  it("dark theme: green-400 accent on ink-950 passes AAA", () => {
    expect(contrastRatio(palette.green400, palette.ink950)).toBeGreaterThanOrEqual(
      7,
    );
  });

  it("dark theme: white CTA text on green-600 fill passes AA", () => {
    expect(contrastRatio(palette.white, palette.green600)).toBeGreaterThanOrEqual(
      AA_NORMAL_TEXT,
    );
  });

  it("border-strong (form inputs, focus rings) passes the 3:1 non-text threshold on white", () => {
    expect(contrastRatio(palette.ink300, palette.white)).toBeGreaterThanOrEqual(
      AA_NON_TEXT,
    );
  });
});
