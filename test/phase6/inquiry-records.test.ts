import { describe, expect, it } from "vitest";
import { computeTripNights } from "@/lib/inquiry/records";

describe("Stage 6 inquiry persistence rules", () => {
  it("computes nights from UTC calendar dates", () => {
    expect(computeTripNights(new Date("2026-09-10"), new Date("2026-09-15"))).toBe(5);
    expect(computeTripNights(new Date("2026-12-31"), new Date("2027-01-02"))).toBe(2);
  });

  it("leaves submitted nights overridable while exposing mismatch data", async () => {
    const { buildTripRecord } = await import("@/lib/inquiry/records");
    const record = buildTripRecord({
      arrivalDate: new Date("2026-09-10"),
      departureDate: new Date("2026-09-15"),
      nights: 7,
      paxCount: 2,
      accommodationTier: "4_star",
      roomConfig: "twin",
    });

    expect(record.nights_submitted).toBe(7);
    expect(record.nights_computed).toBe(5);
    expect(record.nights_mismatch).toBe(true);
  });
});
