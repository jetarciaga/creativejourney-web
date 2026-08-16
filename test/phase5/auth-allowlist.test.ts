import { describe, expect, it } from "vitest";
import {
  isAllowedGoogleSignIn,
  parseAllowedEmails,
} from "@/lib/auth-allowlist";

const configuredEmails =
  "hello@creativejourneysph.com, jet.arciaga@gmail.com, engelus@creativejourneysph.com";

describe("Google admin email allow-list", () => {
  it("normalizes whitespace and email casing", () => {
    expect(parseAllowedEmails(configuredEmails)).toEqual([
      "hello@creativejourneysph.com",
      "jet.arciaga@gmail.com",
      "engelus@creativejourneysph.com",
    ]);
  });

  it("allows each configured email case-insensitively", () => {
    expect(
      isAllowedGoogleSignIn({
        provider: "google",
        email: "JET.ARCIAGA@GMAIL.COM",
        allowedEmails: configuredEmails,
      }),
    ).toBe(true);
  });

  it("rejects an otherwise valid Google account not on the list", () => {
    expect(
      isAllowedGoogleSignIn({
        provider: "google",
        email: "unapproved@example.com",
        allowedEmails: configuredEmails,
      }),
    ).toBe(false);
  });

  it("rejects missing emails and non-Google providers", () => {
    expect(
      isAllowedGoogleSignIn({
        provider: "google",
        email: null,
        allowedEmails: configuredEmails,
      }),
    ).toBe(false);
    expect(
      isAllowedGoogleSignIn({
        provider: "github",
        email: "jet.arciaga@gmail.com",
        allowedEmails: configuredEmails,
      }),
    ).toBe(false);
  });
});
