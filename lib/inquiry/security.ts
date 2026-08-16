import { createHash } from "node:crypto";

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || "unknown";
  return request.headers.get("x-real-ip")?.trim() || "unknown";
}

export async function hashIp(ip: string, salt: string): Promise<string> {
  return createHash("sha256").update(ip + salt).digest("hex");
}

export function getIpHashSalt(): string {
  const salt = process.env.IP_HASH_SALT ?? process.env.AUTH_SECRET;
  if (!salt) {
    throw new Error("Missing IP_HASH_SALT environment variable.");
  }
  return salt;
}

export function isAllowedOrigin(
  origin: string | null,
  requestUrl: string,
  configuredOrigin = process.env.NEXT_PUBLIC_SITE_URL,
): boolean {
  if (!origin) return false;

  try {
    const expected = new URL(configuredOrigin ?? requestUrl).origin;
    return new URL(origin).origin === expected;
  } catch {
    return false;
  }
}

export function isSilentSpamPayload(payload: unknown): boolean {
  if (!payload || typeof payload !== "object") return false;
  const value = payload as Record<string, unknown>;
  if ("website" in value && value.website !== "") return true;
  const elapsedMs =
    typeof value.elapsedMs === "number"
      ? value.elapsedMs
      : typeof value.elapsedMs === "string" && value.elapsedMs.trim() !== ""
        ? Number(value.elapsedMs)
        : null;
  return typeof elapsedMs === "number" && Number.isFinite(elapsedMs) && elapsedMs <= 3000;
}
