import { describe, expect, it } from "vitest";
import {
  IMAGE_MAX_EDGE,
  shouldReencode,
  targetDimensions,
} from "@/lib/image-optimize";

describe("image optimizer helpers", () => {
  it("caps landscape, portrait, and square images without changing their ratio", () => {
    expect(targetDimensions(4032, 3024, IMAGE_MAX_EDGE)).toEqual({
      width: 2400,
      height: 1800,
    });
    expect(targetDimensions(3024, 4032, IMAGE_MAX_EDGE)).toEqual({
      width: 1800,
      height: 2400,
    });
    expect(targetDimensions(3000, 3000, IMAGE_MAX_EDGE)).toEqual({
      width: 2400,
      height: 2400,
    });
  });

  it("never upscales an image whose dimensions are already within the cap", () => {
    expect(targetDimensions(400, 300, IMAGE_MAX_EDGE)).toEqual({
      width: 400,
      height: 300,
    });
  });

  it("only re-encodes files that are too large or too wide", () => {
    expect(shouldReencode(600 * 1024, 1200, 900)).toBe(false);
    expect(shouldReencode(600 * 1024 + 1, 1200, 900)).toBe(true);
    expect(shouldReencode(500 * 1024, 3000, 1000)).toBe(true);
  });
});
