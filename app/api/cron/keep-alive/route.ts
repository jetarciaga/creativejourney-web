import { createPublicSupabaseClient } from "@/lib/supabase/public";

export const runtime = "nodejs";

function isAuthorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  return Boolean(secret) && request.headers.get("authorization") === `Bearer ${secret}`;
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { error } = await createPublicSupabaseClient()
      .from("destinations")
      .select("id")
      .limit(1);

    if (error) throw error;

    return Response.json({ ok: true }, { status: 200 });
  } catch (error) {
    console.error("cron.keep_alive_failed", error);
    return Response.json({ error: "Keep-alive failed" }, { status: 500 });
  }
}
