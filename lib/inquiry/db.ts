import "server-only";

import type { InquiryIn } from "@/lib/inquiry/schema";
import { buildTripRecord } from "@/lib/inquiry/records";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

export type InquiryNotificationPayload = {
  referenceCode: string;
  contactName: string;
  companyName: string | null;
  email: string;
  whatsapp: string;
  address: string;
  destination: string | null;
  arrivalDate: string;
  departureDate: string;
  nightsSubmitted: number;
  nightsComputed: number;
  nightsMismatch: boolean;
  paxCount: number;
  accommodationTier: InquiryIn["accommodationTier"];
  roomConfig: InquiryIn["roomConfig"] | null;
  budgetRange: string | null;
  notes: string | null;
};

export type OutboxRow = {
  id: number | string;
  sink: "email_agency" | "email_customer";
  payload: InquiryNotificationPayload;
};

export type InquiryPersistenceContext = {
  ipHash: string;
  whatsappRaw: string;
  referrer: string | null;
  utmSource: string | null;
  userAgent: string | null;
  consentAt?: Date;
};

export type PersistedInquiry = {
  id: string;
  referenceCode: string;
  outboxRows: OutboxRow[];
};

function nullable(value: string | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function notificationPayload(
  input: InquiryIn,
  referenceCode: string,
  trip: ReturnType<typeof buildTripRecord>,
): InquiryNotificationPayload {
  return {
    referenceCode,
    contactName: input.contactName,
    companyName: nullable(input.companyName),
    email: input.email,
    whatsapp: input.whatsapp,
    address: input.address,
    destination: nullable(input.destination),
    arrivalDate: trip.arrival_date,
    departureDate: trip.departure_date,
    nightsSubmitted: trip.nights_submitted,
    nightsComputed: trip.nights_computed,
    nightsMismatch: trip.nights_mismatch,
    paxCount: trip.pax_count,
    accommodationTier: input.accommodationTier,
    roomConfig: trip.room_config,
    budgetRange: nullable(input.budgetRange),
    notes: nullable(input.notes),
  };
}

export async function countRecentInquiries(ipHash: string): Promise<number> {
  const supabase = createAdminSupabaseClient();
  const since = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const { count, error } = await supabase
    .from("inquiries")
    .select("id", { count: "exact", head: true })
    .eq("ip_hash", ipHash)
    .gte("submitted_at", since);

  if (error) throw new Error("Counting recent inquiries failed: " + error.message);
  return count ?? 0;
}

export async function persistInquiry(
  input: InquiryIn,
  context: InquiryPersistenceContext,
): Promise<PersistedInquiry> {
  const supabase = createAdminSupabaseClient();
  const trip = buildTripRecord(input);

  // The RPC is a SECURITY DEFINER function owned by Postgres. It inserts the
  // inquiry and both outbox rows in one transaction while this server-only
  // service-role client keeps the PII tables inaccessible to browser roles.
  const { data, error } = await supabase.rpc("create_inquiry_with_outbox", {
    p_inquiry: {
      destination: nullable(input.destination),
      arrivalDate: trip.arrival_date,
      departureDate: trip.departure_date,
      nightsSubmitted: trip.nights_submitted,
      nightsComputed: trip.nights_computed,
      nightsMismatch: trip.nights_mismatch,
      paxCount: trip.pax_count,
      accommodationTier: trip.accommodation_tier,
      roomConfig: trip.room_config,
      budgetRange: nullable(input.budgetRange),
      notes: nullable(input.notes),
      contactName: input.contactName,
      companyName: nullable(input.companyName),
      email: input.email,
      whatsapp: input.whatsapp,
      address: input.address,
      consentPrivacy: input.consentPrivacy,
      consentMarketing: input.consentMarketing,
    },
    p_notification_payload: notificationPayload(input, "", trip),
    p_ip_hash: context.ipHash,
    p_whatsapp_raw: context.whatsappRaw,
    p_referrer: context.referrer,
    p_utm_source: context.utmSource,
    p_user_agent: context.userAgent,
    p_consent_at: (context.consentAt ?? new Date()).toISOString(),
  });

  if (error || !data || typeof data !== "object") {
    throw new Error("Persisting inquiry failed: " + (error?.message ?? "no result returned"));
  }

  const result = data as {
    id?: unknown;
    referenceCode?: unknown;
    outboxRows?: unknown;
  };
  if (
    typeof result.id !== "string" ||
    typeof result.referenceCode !== "string" ||
    !Array.isArray(result.outboxRows)
  ) {
    throw new Error("Persisting inquiry returned an invalid result.");
  }

  return {
    id: result.id,
    referenceCode: result.referenceCode,
    outboxRows: result.outboxRows as OutboxRow[],
  };
}

export async function markOutboxDelivered(id: number | string): Promise<void> {
  const supabase = createAdminSupabaseClient();
  const { error } = await supabase.rpc("mark_outbox_delivered", {
    p_outbox_id: Number(id),
  });
  if (error) throw new Error("Marking outbox delivery failed: " + error.message);
}

export async function markOutboxFailed(id: number | string, error: unknown): Promise<void> {
  const supabase = createAdminSupabaseClient();
  const message = error instanceof Error ? error.message : "Notification failed";
  const { error: updateError } = await supabase.rpc("mark_outbox_failed", {
    p_outbox_id: Number(id),
    p_error: message.slice(0, 2000),
  });
  if (updateError) {
    throw new Error("Recording outbox failure failed: " + updateError.message);
  }
}
