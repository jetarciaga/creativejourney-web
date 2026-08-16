import Link from "next/link";
import { deleteDestination } from "@/app/admin/actions";
import { requireAdmin } from "@/lib/authz";
import { listAdminDestinations } from "@/lib/destinations";

export default async function AdminPage() {
  await requireAdmin();
  const destinations = await listAdminDestinations();

  return (
    <main id="main-content" className="bg-bg py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <header className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-prose">
            <h1 className="font-display text-4xl font-semibold tracking-tight text-text">
              Destinations
            </h1>
            <p className="mt-4 text-base text-muted">
              Manage the destinations and programs shown on the public site.
            </p>
          </div>
          <Link
            className="inline-flex min-h-[var(--site-tap-min)] items-center rounded-md bg-accent-fill px-5 py-3 text-sm font-semibold !text-white transition hover:bg-green-700"
            href="/admin/new"
          >
            New destination
          </Link>
        </header>

        <div className="mt-12 space-y-6">
          {destinations.length === 0 ? (
            <p className="border-t border-border pt-6 text-muted">
              No destinations have been added yet.
            </p>
          ) : (
            destinations.map((destination) => (
              <article
                className="border-t border-border pt-6"
                key={destination.id}
              >
                <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                  <div className="max-w-2xl">
                    <div className="flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-[0.12em] text-muted">
                      <span className="text-accent">
                        {destination.featured ? "Featured" : "Standard"}
                      </span>
                      <span>Order {destination.displayOrder}</span>
                      <span>{destination.slug}</span>
                    </div>
                    <h2 className="mt-3 font-display text-2xl font-semibold text-text">
                      <Link
                        className="transition hover:text-accent"
                        href={"/admin/" + destination.id + "/edit"}
                      >
                        {destination.name}
                      </Link>
                    </h2>
                    <p className="mt-2 text-sm text-muted">
                      {destination.region} · {destination.summary}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <Link
                      className="inline-flex min-h-[var(--site-tap-min)] items-center rounded-md border border-border px-4 py-2 text-sm font-semibold text-text transition hover:border-accent hover:text-accent"
                      href={"/destinations/" + destination.slug}
                    >
                      View
                    </Link>
                    <Link
                      className="inline-flex min-h-[var(--site-tap-min)] items-center rounded-md border border-border px-4 py-2 text-sm font-semibold text-text transition hover:border-accent hover:text-accent"
                      href={"/admin/" + destination.id + "/edit"}
                    >
                      Edit
                    </Link>
                    <form action={deleteDestination.bind(null, destination.id)}>
                      <button
                        className="min-h-[var(--site-tap-min)] rounded-md border border-border px-4 py-2 text-sm font-semibold text-muted transition hover:border-accent hover:text-accent"
                        type="submit"
                      >
                        Delete
                      </button>
                    </form>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>
      </div>
    </main>
  );
}
