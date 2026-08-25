import DestinationEditor from "@/components/DestinationEditor";
import { createDestination } from "@/app/admin/destinations/actions";
import { requireAdmin } from "@/lib/authz";

export default async function NewDestinationPage() {
  await requireAdmin();

  return (
    <main id="main-content" className="bg-bg py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <header className="max-w-prose">
          <p className="eyebrow">Admin</p>
          <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight text-text">
            New destination
          </h1>
          <p className="mt-4 text-base text-muted">
            Add a destination to the public site. Every hero image must include descriptive alt text.
          </p>
        </header>
        <div className="mt-12">
          <DestinationEditor action={createDestination} initialDestination={null} submitLabel="Create destination" />
        </div>
      </div>
    </main>
  );
}
