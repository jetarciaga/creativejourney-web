import "server-only";

import { SITE } from "@/lib/site";
import {
  markOutboxDelivered,
  markOutboxFailed,
  type OutboxRow,
} from "@/lib/inquiry/db";

function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing ${name} environment variable.`);
  return value;
}

function agencyRecipients(): string[] {
  return requiredEnv("NOTIFY_TO")
    .split(",")
    .map((address) => address.trim())
    .filter(Boolean);
}

function formatAgencyEmail(row: OutboxRow): { subject: string; text: string; to: string[] } {
  const payload = row.payload;
  return {
    subject: `New travel inquiry ${payload.referenceCode}`,
    to: agencyRecipients(),
    text: [
      `Reference: ${payload.referenceCode}`,
      `Contact: ${payload.contactName}`,
      `Company: ${payload.companyName ?? "Not provided"}`,
      `Email: ${payload.email}`,
      `WhatsApp: ${payload.whatsapp}`,
      `Address: ${payload.address}`,
      `Destination: ${payload.destination ?? "Not specified"}`,
      `Dates: ${payload.arrivalDate} to ${payload.departureDate}`,
      `Nights: ${payload.nightsSubmitted} submitted / ${payload.nightsComputed} computed${payload.nightsMismatch ? " (mismatch flagged)" : ""}`,
      `Pax: ${payload.paxCount}`,
      `Accommodation: ${payload.accommodationTier}`,
      `Room configuration: ${payload.roomConfig ?? "Not specified"}`,
      `Budget: ${payload.budgetRange ?? "Not specified"}`,
      `Notes: ${payload.notes ?? "None"}`,
    ].join("\n"),
  };
}

function formatCustomerEmail(row: OutboxRow): { subject: string; text: string; to: string[] } {
  const payload = row.payload;
  return {
    subject: `We received your Creative Journeys inquiry ${payload.referenceCode}`,
    to: [payload.email],
    text: [
      `Hi ${payload.contactName},`,
      "",
      `Thanks for contacting Creative Journeys. Your reference code is ${payload.referenceCode}.`,
      "We usually reply within one business day with the next questions or a tailored starting point.",
      "",
      "Creative Journeys Travel PH",
      SITE.email,
    ].join("\n"),
  };
}

export async function sendResendEmail(row: OutboxRow): Promise<void> {
  const email = row.sink === "email_customer" ? formatCustomerEmail(row) : formatAgencyEmail(row);
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${requiredEnv("RESEND_API_KEY")}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.RESEND_FROM ?? `Creative Journeys <${SITE.email}>`,
      to: email.to,
      subject: email.subject,
      text: email.text,
      ...(row.sink === "email_agency" ? { reply_to: row.payload.email } : {}),
    }),
  });

  if (!response.ok) {
    const detail = (await response.text()).slice(0, 500);
    throw new Error(`Resend returned ${response.status}: ${detail}`);
  }
}

async function drainOutboxRow(row: OutboxRow): Promise<void> {
  try {
    await sendResendEmail(row);
    await markOutboxDelivered(row.id);
  } catch (error) {
    try {
      await markOutboxFailed(row.id, error);
    } catch (markError) {
      console.error("inquiry.outbox_failure_recording_failed", markError);
    }
    console.error("inquiry.outbox_delivery_failed", error);
  }
}

export async function drainOutbox(rows: OutboxRow[]): Promise<void> {
  await Promise.all(rows.map(drainOutboxRow));
}
