import { describe, expect, it } from "vitest";
import { INQUIRY_FIELDS, inquirySchema } from "@/lib/inquiry/schema";

function dateAfterToday(days: number) {
  const date = new Date();
  date.setUTCHours(0, 0, 0, 0);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function validPayload() {
  return {
    arrivalDate: dateAfterToday(30),
    departureDate: dateAfterToday(35),
    nights: 5,
    paxCount: 2,
    accommodationTier: "4_star",
    contactName: "Jane Traveler",
    companyName: "",
    email: "jane@example.com",
    whatsapp: "+63 917 123 4567",
    address: "123 Example Street, Muntinlupa City",
    destination: "cebu",
    roomConfig: "twin",
    budgetRange: "comfort",
    notes: "A relaxed island itinerary.",
    consentPrivacy: true,
    consentMarketing: false,
    website: "",
    elapsedMs: 5000,
  };
}

describe("Stage 6 inquiry schema", () => {
  it("keeps the request field list as the schema's single source of truth", () => {
    expect(INQUIRY_FIELDS).toEqual(
      expect.objectContaining({
        arrivalDate: expect.anything(),
        departureDate: expect.anything(),
        nights: expect.anything(),
        paxCount: expect.anything(),
        accommodationTier: expect.anything(),
        contactName: expect.anything(),
        companyName: expect.anything(),
        email: expect.anything(),
        whatsapp: expect.anything(),
        address: expect.anything(),
        destination: expect.anything(),
        roomConfig: expect.anything(),
        budgetRange: expect.anything(),
        notes: expect.anything(),
        consentPrivacy: expect.anything(),
        consentMarketing: expect.anything(),
        website: expect.anything(),
        elapsedMs: expect.anything(),
      }),
    );
  });

  it("accepts a valid inquiry and normalizes WhatsApp to E.164", () => {
    const result = inquirySchema.safeParse(validPayload());

    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.whatsapp).toBe("+639171234567");
  });

  it("requires arrival today or later and no more than 730 days away", () => {
    expect(
      inquirySchema.safeParse({
        ...validPayload(),
        arrivalDate: dateAfterToday(-1),
      }).success,
    ).toBe(false);

    const tooFar = inquirySchema.safeParse({
      ...validPayload(),
      arrivalDate: dateAfterToday(731),
      departureDate: dateAfterToday(732),
    });
    expect(tooFar.success).toBe(false);
  });

  it("requires departure after arrival", () => {
    const result = inquirySchema.safeParse({
      ...validPayload(),
      departureDate: validPayload().arrivalDate,
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((issue) => issue.path[0] === "departureDate")).toBe(
        true,
      );
    }
  });

  it("enforces nights, pax, accommodation, and room-config bounds", () => {
    for (const nights of [-1, 366, 1.5]) {
      expect(inquirySchema.safeParse({ ...validPayload(), nights }).success).toBe(false);
    }
    for (const paxCount of [0, 501, 2.5]) {
      expect(inquirySchema.safeParse({ ...validPayload(), paxCount }).success).toBe(false);
    }
    expect(
      inquirySchema.safeParse({ ...validPayload(), accommodationTier: "2_star" }).success,
    ).toBe(false);
    expect(
      inquirySchema.safeParse({ ...validPayload(), roomConfig: "quad" }).success,
    ).toBe(false);
    expect(
      inquirySchema.safeParse({ ...validPayload(), roomConfig: undefined }).success,
    ).toBe(true);
  });

  it("enforces contact, email, address, and country-coded WhatsApp rules", () => {
    expect(inquirySchema.safeParse({ ...validPayload(), contactName: "A" }).success).toBe(
      false,
    );
    expect(inquirySchema.safeParse({ ...validPayload(), email: "not-an-email" }).success).toBe(
      false,
    );
    expect(inquirySchema.safeParse({ ...validPayload(), address: "123" }).success).toBe(false);
    expect(
      inquirySchema.safeParse({ ...validPayload(), whatsapp: "9171234567" }).success,
    ).toBe(false);
  });

  it("requires literal privacy consent, defaults marketing consent, and rejects spam fields", () => {
    const withoutMarketing = { ...validPayload(), consentMarketing: undefined };
    const accepted = inquirySchema.safeParse(withoutMarketing);
    expect(accepted.success).toBe(true);
    if (accepted.success) expect(accepted.data.consentMarketing).toBe(false);

    expect(
      inquirySchema.safeParse({ ...validPayload(), consentPrivacy: false }).success,
    ).toBe(false);
    expect(inquirySchema.safeParse({ ...validPayload(), website: "bot" }).success).toBe(false);
    expect(inquirySchema.safeParse({ ...validPayload(), elapsedMs: 3000 }).success).toBe(false);
  });

  it("rejects unexpected keys", () => {
    const result = inquirySchema.safeParse({ ...validPayload(), unexpected: "pollution" });

    expect(result.success).toBe(false);
  });
});
