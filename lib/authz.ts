import "server-only";

import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { isAllowedEmail } from "@/lib/auth-allowlist";

export async function requireAdmin() {
  const session = await auth();

  if (!isAllowedEmail(session?.user?.email)) {
    redirect("/admin/sign-in");
  }

  return session;
}
