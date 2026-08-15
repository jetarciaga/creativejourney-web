/**
 * The verified logo-derived ink/green ramp. These are the same hex values
 * that back `--palette-*` in app/globals.css — kept here too, as plain data,
 * so the contrast tests can check them without parsing CSS. If you change a
 * value in one place, change it in the other; the tests catch drift.
 */
export const palette = {
  ink950: "#0E1013",
  ink900: "#14161B",
  ink800: "#242930",
  ink700: "#343C47",
  ink600: "#46505D",
  ink500: "#5B6472",
  ink300: "#8A93A0",
  ink200: "#D1D5DB",
  ink100: "#E7EAEE",
  ink50: "#F6F7F8",

  green700: "#0A6339",
  green600: "#0D7B46",
  green500: "#23A463",
  green400: "#4CC98A",
  green200: "#B6E8CC",
  green100: "#DDF5E8",
  green50: "#F0FAF4",

  // Metric-only highlight; not used for CTAs, links, or body text.
  gold700: "#8A6520",
  gold500: "#C89B3C",

  white: "#FFFFFF",
} as const;

function linearize(channel: number): number {
  const normalized = channel / 255;
  return normalized <= 0.03928
    ? normalized / 12.92
    : ((normalized + 0.055) / 1.055) ** 2.4;
}

function relativeLuminance(hex: string): number {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  return (
    0.2126 * linearize(r) + 0.7152 * linearize(g) + 0.0722 * linearize(b)
  );
}

/** WCAG 2.x contrast ratio between two colors, 1 (no contrast) to 21 (max). */
export function contrastRatio(hexA: string, hexB: string): number {
  const luminanceA = relativeLuminance(hexA);
  const luminanceB = relativeLuminance(hexB);
  const lighter = Math.max(luminanceA, luminanceB);
  const darker = Math.min(luminanceA, luminanceB);
  return (lighter + 0.05) / (darker + 0.05);
}
