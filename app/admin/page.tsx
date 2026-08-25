import Link from "next/link";
import { requireAdmin } from "@/lib/authz";

const sections = [
  {
    href: "/admin/destinations",
    title: "Destinations",
    description: "Manage the destinations and programs shown on the public site.",
  },
  {
    href: "/admin/stories",
    title: "Stories",
    description: "Publish client success stories with a photo, date, and plain-text account.",
  },
] as const;

export default async function AdminPage() {
  await requireAdmin();

  return (
    <main id="main-content" className="bg-bg py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <header className="max-w-prose">
          <h1 className="font-display text-4xl font-semibold tracking-tight text-text">
            Content
          </h1>
          <p className="mt-4 text-base text-muted">
            Choose the content you want to manage.
          </p>
        </header>

        <div className="mt-12 grid gap-5 md:grid-cols-2">
          {sections.map((section) => (
            <Link
              className="group rounded-card border border-border bg-surface p-6 shadow-site transition hover:-translate-y-1 hover:border-accent hover:shadow-site-strong sm:p-8"
              href={section.href}
              key={section.href}
            >
              <h2 className="font-display text-2xl font-semibold text-text transition group-hover:text-accent">
                {section.title}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-muted">
                {section.description}
              </p>
              <span className="mt-6 inline-flex min-h-[var(--site-tap-min)] items-center text-sm font-semibold text-link">
                Manage {section.title.toLowerCase()} <span aria-hidden="true">→</span>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
