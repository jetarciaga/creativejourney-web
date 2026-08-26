"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import {
  DESTINATION_DESCRIPTION_MAX_CHARS,
  DESTINATION_HERO_IMAGE_ALT_MAX_CHARS,
  DESTINATION_HERO_IMAGE_MAX_CHARS,
  DESTINATION_INQUIRY_DESTINATION_VALUE_MAX_CHARS,
  DESTINATION_LIST_ITEM_MAX_CHARS,
  DESTINATION_LIST_MAX_CHARS,
  DESTINATION_LIST_MAX_ITEMS,
  DESTINATION_NAME_MAX_CHARS,
  DESTINATION_REGION_MAX_CHARS,
  DESTINATION_SLUG_MAX_CHARS,
  DESTINATION_SUMMARY_MAX_CHARS,
  type Destination,
} from "@/lib/destination-model";

type DestinationActionState = { error: string };
type DestinationAction = (
  prevState: DestinationActionState,
  formData: FormData,
) => DestinationActionState | Promise<DestinationActionState>;

type ListField = "highlights" | "suitableFor";

type ListCheck = {
  count: number;
  overLength: number | null;
  tooMany: boolean;
};

function splitList(value: string): string[] {
  return value
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function checkList(value: string): ListCheck {
  const items = splitList(value);
  const overLength = items.find(
    (item) => item.length > DESTINATION_LIST_ITEM_MAX_CHARS,
  );

  return {
    count: items.length,
    overLength: overLength?.length ?? null,
    tooMany: items.length > DESTINATION_LIST_MAX_ITEMS,
  };
}

function listStatus(check: ListCheck) {
  if (check.overLength !== null) {
    return `One line is ${check.overLength}/${DESTINATION_LIST_ITEM_MAX_CHARS} characters — trim it before saving`;
  }

  if (check.tooMany) {
    return `There are ${check.count}/${DESTINATION_LIST_MAX_ITEMS} items — remove some before saving`;
  }

  return null;
}

export default function DestinationEditor({
  initialDestination,
  action,
  submitLabel,
}: {
  initialDestination: Destination | null;
  action: DestinationAction;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, { error: "" });
  const [listValues, setListValues] = useState<Record<ListField, string>>({
    highlights: initialDestination?.highlights.join("\n") ?? "",
    suitableFor: initialDestination?.suitableFor.join(", ") ?? "",
  });
  const listChecks = {
    highlights: checkList(listValues.highlights),
    suitableFor: checkList(listValues.suitableFor),
  };
  const hasListError =
    listChecks.highlights.overLength !== null ||
    listChecks.highlights.tooMany ||
    listChecks.suitableFor.overLength !== null ||
    listChecks.suitableFor.tooMany;

  function handleListChange(field: ListField, value: string) {
    setListValues((current) => ({ ...current, [field]: value }));
  }

  return (
    <form action={formAction} className="space-y-8">
      <div className="grid gap-6 md:grid-cols-2">
        <label className="flex flex-col gap-2 text-sm font-semibold text-text">
          Name
          <input
            className="rounded-md border border-border bg-bg px-3 py-3 text-text"
            defaultValue={initialDestination?.name ?? ""}
            maxLength={DESTINATION_NAME_MAX_CHARS}
            name="name"
            required
          />
        </label>
        <label className="flex flex-col gap-2 text-sm font-semibold text-text">
          Slug
          <input
            className="rounded-md border border-border bg-bg px-3 py-3 font-mono text-sm text-text"
            defaultValue={initialDestination?.slug ?? ""}
            maxLength={DESTINATION_SLUG_MAX_CHARS}
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
            maxLength={DESTINATION_REGION_MAX_CHARS}
            name="region"
            required
          />
        </label>
        <label className="flex flex-col gap-2 text-sm font-semibold text-text">
          Inquiry destination value
          <input
            className="rounded-md border border-border bg-bg px-3 py-3 font-mono text-sm text-text"
            defaultValue={initialDestination?.inquiryDestinationValue ?? ""}
            maxLength={DESTINATION_INQUIRY_DESTINATION_VALUE_MAX_CHARS}
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
            maxLength={DESTINATION_HERO_IMAGE_MAX_CHARS}
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
            maxLength={DESTINATION_HERO_IMAGE_ALT_MAX_CHARS}
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
          maxLength={DESTINATION_SUMMARY_MAX_CHARS}
          name="summary"
          required
        />
      </label>

      <label className="flex flex-col gap-2 text-sm font-semibold text-text">
        Description
        <textarea
          className="min-h-40 rounded-md border border-border bg-bg px-3 py-3 text-text"
          defaultValue={initialDestination?.description ?? ""}
          maxLength={DESTINATION_DESCRIPTION_MAX_CHARS}
          name="description"
          required
        />
      </label>

      <div className="grid gap-6 md:grid-cols-2">
        <label className="flex flex-col gap-2 text-sm font-semibold text-text">
          Highlights
          <textarea
            className="min-h-32 rounded-md border border-border bg-bg px-3 py-3 text-text"
            maxLength={DESTINATION_LIST_MAX_CHARS}
            name="highlights"
            onChange={(event) =>
              handleListChange("highlights", event.target.value)
            }
            required
            value={listValues.highlights}
          />
          <span className="font-normal text-xs text-muted">
            One per line or separated by commas.
          </span>
          <span className="font-normal text-xs text-muted">
            {listChecks.highlights.count}/{DESTINATION_LIST_MAX_ITEMS} items
          </span>
          {listStatus(listChecks.highlights) ? (
            <span className="font-normal text-xs text-accent" role="alert">
              {listStatus(listChecks.highlights)}
            </span>
          ) : null}
        </label>
        <label className="flex flex-col gap-2 text-sm font-semibold text-text">
          Suitable for
          <textarea
            className="min-h-32 rounded-md border border-border bg-bg px-3 py-3 text-text"
            maxLength={DESTINATION_LIST_MAX_CHARS}
            name="suitableFor"
            onChange={(event) =>
              handleListChange("suitableFor", event.target.value)
            }
            required
            value={listValues.suitableFor}
          />
          <span className="font-normal text-xs text-muted">
            For example: FIT, GIT, MICE.
          </span>
          <span className="font-normal text-xs text-muted">
            {listChecks.suitableFor.count}/{DESTINATION_LIST_MAX_ITEMS} items
          </span>
          {listStatus(listChecks.suitableFor) ? (
            <span className="font-normal text-xs text-accent" role="alert">
              {listStatus(listChecks.suitableFor)}
            </span>
          ) : null}
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

      {state?.error ? (
        <p className="border-l-2 border-accent pl-4 text-sm text-muted" role="alert">
          {state.error}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-3 border-t border-border pt-6">
        <button
          className="min-h-[var(--site-tap-min)] rounded-md bg-accent-fill px-5 py-3 text-sm font-semibold !text-white transition hover:bg-green-700"
          disabled={pending || hasListError}
          type="submit"
        >
          {pending ? "Saving…" : submitLabel}
        </button>
        <Link
          className="inline-flex min-h-[var(--site-tap-min)] items-center rounded-md border border-border px-5 py-3 text-sm font-semibold text-text transition hover:border-accent hover:text-accent"
          href="/admin/destinations"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
