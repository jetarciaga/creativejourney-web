import { describe, expect, it } from "vitest";
import {
  getClientIp,
  hashIp,
  isAllowedOrigin,
  isSilentSpamPayload,
} from "@/lib/inquiry/security";

describe("Stage 6 inquiry request guards", () => {
  it("uses the first forwarded IP without exposing the raw value in the hash", async () => {
    const request = new Request("http://localhost:3000/api/inquiry", {
      headers: {
        "x-forwarded-for": "203.0.113.10, 198.51.100.5",
      },
    });

    expect(getClientIp(request)).toBe("203.0.113.10");
    const digest = await hashIp("203.0.113.10", "test-salt");
    expect(digest).toMatch(/^[a-f0-9]{64}$/);
    expect(digest).not.toContain("203.0.113.10");
    expect(digest).toBe(await hashIp("203.0.113.10", "test-salt"));
  });

  it("accepts only the configured same-site Origin", () => {
    expect(
      isAllowedOrigin("https://www.creativejourneysph.com", "https://www.creativejourneysph.com/api/inquiry", "https://www.creativejourneysph.com"),
    ).toBe(true);
    expect(
      isAllowedOrigin("https://attacker.example", "https://www.creativejourneysph.com/api/inquiry", "https://www.creativejourneysph.com"),
    ).toBe(false);
    expect(isAllowedOrigin(null, "http://localhost:3000/api/inquiry", undefined)).toBe(false);
  });

  it("silently identifies a populated honeypot or too-fast submission", () => {
    expect(isSilentSpamPayload({ website: "https://bot.example", elapsedMs: 5000 })).toBe(true);
    expect(isSilentSpamPayload({ website: "", elapsedMs: 3000 })).toBe(true);
    expect(isSilentSpamPayload({ website: "", elapsedMs: "3000" })).toBe(true);
    expect(isSilentSpamPayload({ website: "", elapsedMs: 3001 })).toBe(false);
    expect(isSilentSpamPayload({ website: "", elapsedMs: "3001" })).toBe(false);
  });
});
