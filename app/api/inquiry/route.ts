import { countRecentInquiries, persistInquiry } from "@/lib/inquiry/db";
import { drainOutbox } from "@/lib/inquiry/notify";
import { inquirySchema } from "@/lib/inquiry/schema";
import {
  getClientIp,
  getIpHashSalt,
  hashIp,
  isAllowedOrigin,
  isSilentSpamPayload,
} from "@/lib/inquiry/security";

export const runtime = "nodejs";

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function validationErrors(error: { issues: Array<{ path: PropertyKey[]; message: string; code: string }> }) {
  const errors: Record<string, string> = {};

  for (const issue of error.issues) {
    const field = typeof issue.path[0] === "string" ? issue.path[0] : "form";
    if (!errors[field]) {
      errors[field] =
        issue.code === "unrecognized_keys" ? "Unexpected field in request" : issue.message;
    }
  }

  return errors;
}

function utmSourceFromReferrer(referrer: string | null): string | null {
  if (!referrer) return null;
  try {
    return new URL(referrer).searchParams.get("utm_source");
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  if (!isAllowedOrigin(request.headers.get("origin"), request.url)) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (isSilentSpamPayload(body)) {
    return new Response(null, { status: 204 });
  }

  try {
    const ipHash = await hashIp(getClientIp(request), getIpHashSalt());
    if (await countRecentInquiries(ipHash) >= 5) {
      return Response.json(
        { error: "Too many inquiries. Please try again later." },
        { status: 429 },
      );
    }

    const result = inquirySchema.safeParse(body);
    if (!result.success) {
      return Response.json({ errors: validationErrors(result.error) }, { status: 422 });
    }

    const referrer = request.headers.get("referer");
    const persisted = await persistInquiry(result.data, {
      ipHash,
      whatsappRaw:
        isRecord(body) && typeof body.whatsapp === "string"
          ? body.whatsapp.trim()
          : result.data.whatsapp,
      referrer,
      utmSource: utmSourceFromReferrer(referrer),
      userAgent: request.headers.get("user-agent"),
    });

    // The database transaction has already committed. Delivery is best effort:
    // an outage leaves pending outbox rows and never turns a successful inquiry
    // into a failed user response.
    try {
      await drainOutbox(persisted.outboxRows);
    } catch (error) {
      console.error("inquiry.outbox_drain_failed", error);
    }

    return Response.json(
      { reference_code: persisted.referenceCode },
      { status: 201 },
    );
  } catch (error) {
    console.error("inquiry.request_failed", error);
    return Response.json({ error: "Unable to submit inquiry" }, { status: 500 });
  }
}
