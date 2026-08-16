import Link from "next/link";
import type { Destination } from "@/lib/destination-model";

type DestinationAction = (formData: FormData) => void | Promise<void>;

export default function DestinationEditor({
  initialDestination,
  action,
  submitLabel,
}: {
  initialDestination: Destination | null;
  action: DestinationAction;
  submitLabel: string;
}) {
  return (
    <form action={action} className="space-y-8">
      <div className="grid gap-6 md:grid-cols-2">
        <label className="flex flex-col gap-2 text-sm font-semibold text-text">
          Name
          <input
            className="rounded-md border border-border bg-bg px-3 py-3 text-text"
            defaultValue={initialDestination?.name ?? ""}
            name="name"
            required
          />
        </label>
        <label className="flex flex-col gap-2 text-sm font-semibold text-text">
          Slug
          <input
            className="rounded-md border border-border bg-bg px-3 py-3 font-mono text-sm text-text"
            defaultValue={initialDestination?.slug ?? ""}
            name="slug"
            pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
            required
          />
        </label>
        <label className="flex flex-col gap-2 text-sm font-semibold text-text">
          Region
          <input
            className="rounded-md border border-border bg-bg px-3 py-3 text-text"
            defaultValue={initialDestination?.region ?? ""}
            name="region"
            required
          />
        </label>
        <label className="flex flex-col gap-2 text-sm font-semibold text-text">
          Inquiry destination value
          <input
            className="rounded-md border border-border bg-bg px-3 py-3 font-mono text-sm text-text"
            defaultValue={initialDestination?.inquiryDestinationValue ?? ""}
            name="inquiryDestinationValue"
            required
          />
          <span className="font-normal text-xs text-muted">
            The exact value used for the Contact query string.
          </span>
        </label>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <label className="flex flex-col gap-2 text-sm font-semibold text-text">
          Hero image path or HTTPS URL
          <input
            className="rounded-md border border-border bg-bg px-3 py-3 font-mono text-sm text-text"
            defaultValue={initialDestination?.heroImage ?? ""}
            name="heroImage"
            placeholder="/destinations/cebu.webp"
            required
          />
        </label>
        <label className="flex flex-col gap-2 text-sm font-semibold text-text">
          Hero image alt text
          <input
            className="rounded-md border border-border bg-bg px-3 py-3 text-text"
            defaultValue={initialDestination?.heroImageAlt ?? ""}
            name="heroImageAlt"
            required
          />
          <span className="font-normal text-xs text-muted">
            Required for the database and for the public page.
          </span>
        </label>
      </div>

      <label className="flex flex-col gap-2 text-sm font-semibold text-text">
        Summary
        <textarea
          className="min-h-24 rounded-md border border-border bg-bg px-3 py-3 text-text"
          defaultValue={initialDestination?.summary ?? ""}
          name="summary"
          required
        />
      </label>

      <label className="flex flex-col gap-2 text-sm font-semibold text-text">
        Description
        <textarea
          className="min-h-40 rounded-md border border-border bg-bg px-3 py-3 text-text"
          defaultValue={initialDestination?.description ?? ""}
          name="description"
          required
        />
      </label>

      <div className="grid gap-6 md:grid-cols-2">
        <label className="flex flex-col gap-2 text-sm font-semibold text-text">
          Highlights
          <textarea
            className="min-h-32 rounded-md border border-border bg-bg px-3 py-3 text-text"
            defaultValue={initialDestination?.highlights.join("\n") ?? ""}
            name="highlights"
            required
          />
          <span className="font-normal text-xs text-muted">
            One per line or separated by commas.
          </span>
        </label>
        <label className="flex flex-col gap-2 text-sm font-semibold text-text">
          Suitable for
          <textarea
            className="min-h-32 rounded-md border border-border bg-bg px-3 py-3 text-text"
            defaultValue={initialDestination?.suitableFor.join(", ") ?? ""}
            name="suitableFor"
            required
          />
          <span className="font-normal text-xs text-muted">
            For example: FIT, GIT, MICE.
          </span>
        </label>
      </div>

      <div className="flex flex-wrap items-end gap-6">
        <label className="flex flex-col gap-2 text-sm font-semibold text-text">
          Display order
          <input
            className="w-32 rounded-md border border-border bg-bg px-3 py-3 text-text"
            defaultValue={initialDestination?.displayOrder ?? 0}
            min="0"
            name="displayOrder"
            required
            type="number"
          />
        </label>
        <label className="flex min-h-12 items-center gap-3 text-sm font-semibold text-text">
          <input
            defaultChecked={initialDestination?.featured ?? false}
            name="featured"
            type="checkbox"
          />
          Featured destination
        </label>
      </div>

      <div className="flex flex-wrap gap-3 border-t border-border pt-6">
        <button
          className="min-h-[var(--site-tap-min)] rounded-md bg-accent-fill px-5 py-3 text-sm font-semibold !text-white transition hover:bg-green-700"
          type="submit"
        >
          {submitLabel}
        </button>
        <Link
          className="inline-flex min-h-[var(--site-tap-min)] items-center rounded-md border border-border px-5 py-3 text-sm font-semibold text-text transition hover:border-accent hover:text-accent"
          href="/admin"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
