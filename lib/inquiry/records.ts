import type { InquiryIn } from "@/lib/inquiry/schema";

function utcMidnightMs(date: Date) {
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
}

export function computeTripNights(arrivalDate: Date, departureDate: Date): number {
  return Math.round((utcMidnightMs(departureDate) - utcMidnightMs(arrivalDate)) / 86_400_000);
}

type TripInput = Pick<
  InquiryIn,
  "arrivalDate" | "departureDate" | "nights" | "paxCount" | "accommodationTier" | "roomConfig"
>;

export function buildTripRecord(input: TripInput) {
  const nightsComputed = computeTripNights(input.arrivalDate, input.departureDate);

  return {
    arrival_date: input.arrivalDate.toISOString().slice(0, 10),
    departure_date: input.departureDate.toISOString().slice(0, 10),
    nights_submitted: input.nights,
    nights_computed: nightsComputed,
    nights_mismatch: input.nights !== nightsComputed,
    pax_count: input.paxCount,
    accommodation_tier: input.accommodationTier,
    room_config: input.roomConfig || null,
  };
}
