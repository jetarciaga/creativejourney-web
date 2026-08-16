import { beforeEach, describe, expect, it, vi } from "vitest";

const dbMock = vi.hoisted(() => ({
  countRecentInquiries: vi.fn(),
  persistInquiry: vi.fn(),
}));
const notifyMock = vi.hoisted(() => ({
  drainOutbox: vi.fn(),
}));

vi.mock("@/lib/inquiry/db", () => dbMock);
vi.mock("@/lib/inquiry/notify", () => notifyMock);

import { POST } from "@/app/api/inquiry/route";

function validBody() {
  const arrival = new Date();
  arrival.setUTCDate(arrival.getUTCDate() + 30);
  const departure = new Date(arrival);
  departure.setUTCDate(departure.getUTCDate() + 5);

  return {
    arrivalDate: arrival.toISOString().slice(0, 10),
    departureDate: departure.toISOString().slice(0, 10),
    nights: 5,
    paxCount: 2,
    accommodationTier: "4_star",
    contactName: "Jane Traveler",
    companyName: "",
    email: "jane@example.com",
    whatsapp: "+639171234567",
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

function request(body: Record<string, unknown>, headers: Record<string, string> = {}) {
  return new Request("http://localhost:3000/api/inquiry", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      origin: "http://localhost:3000",
      "x-forwarded-for": "203.0.113.10",
      "user-agent": "vitest",
      ...headers,
    },
    body: JSON.stringify(body),
  });
}

describe("POST /api/inquiry", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    dbMock.countRecentInquiries.mockResolvedValue(0);
    dbMock.persistInquiry.mockResolvedValue({
      referenceCode: "CJ-2026-0001",
      outboxRows: [],
    });
    notifyMock.drainOutbox.mockResolvedValue(undefined);
    process.env.NEXT_PUBLIC_SITE_URL = "http://localhost:3000";
    process.env.IP_HASH_SALT = "test-salt";
  });

  it("guards Origin before processing a request", async () => {
    const response = await POST(request(validBody(), { origin: "https://attacker.example" }));

    expect(response.status).toBe(403);
    expect(dbMock.countRecentInquiries).not.toHaveBeenCalled();
  });

  it("silently rejects honeypot and too-fast submissions", async () => {
    const honeypot = await POST(request({ ...validBody(), website: "bot" }));
    const tooFast = await POST(request({ ...validBody(), elapsedMs: 3000 }));

    expect(honeypot.status).toBe(204);
    expect(tooFast.status).toBe(204);
    expect(dbMock.persistInquiry).not.toHaveBeenCalled();
  });

  it("returns 429 at five inquiries per hour for the hashed IP", async () => {
    dbMock.countRecentInquiries.mockResolvedValue(5);

    const response = await POST(request(validBody()));

    expect(response.status).toBe(429);
    expect(dbMock.persistInquiry).not.toHaveBeenCalled();
  });

  it("returns one message per invalid field", async () => {
    const response = await POST(
      request({ ...validBody(), email: "invalid", contactName: "A" }),
    );
    const body = await response.json();

    expect(response.status).toBe(422);
    expect(body.errors.email).toBeTruthy();
    expect(body.errors.contactName).toBeTruthy();
    expect(dbMock.persistInquiry).not.toHaveBeenCalled();
  });

  it("persists before attempting notification and returns the DB reference code", async () => {
    const response = await POST(request(validBody()));
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body).toEqual({ reference_code: "CJ-2026-0001" });
    expect(dbMock.persistInquiry).toHaveBeenCalledOnce();
    expect(notifyMock.drainOutbox).toHaveBeenCalledOnce();
  });

  it("still returns 201 when immediate Resend draining fails", async () => {
    notifyMock.drainOutbox.mockRejectedValue(new Error("Resend unavailable"));

    const response = await POST(request(validBody()));

    expect(response.status).toBe(201);
  });
});
