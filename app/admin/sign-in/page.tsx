import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { signIn } from "@/auth";

type SignInPageProps = {
  searchParams: Promise<{ error?: string }>;
};

async function signInWithGoogle() {
  "use server";

  try {
    await signIn("google", { redirectTo: "/admin" });
  } catch (error) {
    if (error instanceof AuthError) {
      redirect("/admin/sign-in?error=AccessDenied");
    }

    throw error;
  }
}

export default async function AdminSignIn({ searchParams }: SignInPageProps) {
  const { error } = await searchParams;

  return (
    <main id="main-content" className="bg-bg py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="max-w-prose">
          <p className="eyebrow">Admin</p>
          <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight text-text">
            Sign in to manage destinations.
          </h1>
          <p className="mt-4 text-base text-muted">
            Continue with a Google account on the Creative Journeys admin allow-list.
          </p>
          {error ? (
            <p className="mt-6 border-l-2 border-accent pl-4 text-sm text-muted">
              This Google account is not allow-listed.
            </p>
          ) : null}
          <form action={signInWithGoogle} className="mt-8">
            <button
              className="min-h-[var(--site-tap-min)] rounded-md border border-border px-5 py-3 text-sm font-semibold text-text transition hover:border-accent hover:text-accent"
              type="submit"
            >
              Continue with Google ↗
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
