export function parseAllowedEmails(raw: string | undefined): string[] {
  return [
    ...new Set(
      (raw ?? "")
        .split(",")
        .map((email) => email.trim().toLowerCase())
        .filter(Boolean),
    ),
  ];
}

export function isAllowedEmail(
  email: string | null | undefined,
  rawAllowedEmails = process.env.AUTH_ALLOWED_EMAILS,
): boolean {
  const normalizedEmail = email?.trim().toLowerCase();

  return Boolean(
    normalizedEmail && parseAllowedEmails(rawAllowedEmails).includes(normalizedEmail),
  );
}

export function isAllowedGoogleSignIn({
  provider,
  email,
  allowedEmails,
}: {
  provider: string | undefined;
  email: string | null | undefined;
  allowedEmails?: string;
}): boolean {
  return provider === "google" && isAllowedEmail(email, allowedEmails);
}
