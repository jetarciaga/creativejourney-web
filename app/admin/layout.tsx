import type { ReactNode } from "react";
import { auth, signOut } from "@/auth";
import { AdminNav } from "@/app/admin/admin-nav";

async function signOutOfAdmin() {
  "use server";

  await signOut({ redirectTo: "/" });
}

export default async function AdminLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const session = await auth();

  return (
    <div className="min-h-screen">
      <header className="border-b border-border bg-bg">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8 sm:flex-row sm:items-end sm:justify-between sm:px-6">
          <div>
            <p className="eyebrow">Admin</p>
            <AdminNav />
          </div>
          {session ? (
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted">
              <span>
                Signed in as {session.user?.name ?? session.user?.email ?? "admin"}.
              </span>
              <form action={signOutOfAdmin}>
                <button
                  className="min-h-[var(--site-tap-min)] rounded-md border border-border px-4 py-2 font-medium text-text transition hover:border-accent hover:text-accent"
                  type="submit"
                >
                  Sign out
                </button>
              </form>
            </div>
          ) : null}
        </div>
      </header>
      {children}
    </div>
  );
}
