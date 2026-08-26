"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import Button from "@/components/Button";
import StoryImageField, {
  type StoryImageUploadState,
} from "@/components/StoryImageField";
import type { Story } from "@/lib/story-model";

type StoryActionState = { error: string };
type StoryAction = (
  prevState: StoryActionState,
  formData: FormData,
) => StoryActionState | Promise<StoryActionState>;

export default function StoryEditor({
  initialStory,
  initialImageUrl,
  action,
  submitLabel,
}: {
  initialStory: Story | null;
  initialImageUrl?: string;
  action: StoryAction;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, { error: "" });
  const [imageUploadState, setImageUploadState] =
    useState<StoryImageUploadState>("idle");

  return (
    <form action={formAction} className="space-y-8">
      <StoryImageField
        initialPath={initialStory?.coverImagePath ?? ""}
        initialPreviewUrl={initialImageUrl}
        onUploadStateChange={setImageUploadState}
        uploadState={imageUploadState}
      />

      <div className="grid gap-6 md:grid-cols-2">
        <label className="flex flex-col gap-2 text-sm font-semibold text-text">
          Title
          <input
            className="rounded-md border border-border bg-bg px-3 py-3 text-text"
            defaultValue={initialStory?.title ?? ""}
            maxLength={160}
            name="title"
            required
          />
        </label>
        <label className="flex flex-col gap-2 text-sm font-semibold text-text">
          Trip date
          <input
            className="rounded-md border border-border bg-bg px-3 py-3 text-text"
            defaultValue={initialStory?.storyDate ?? ""}
            name="storyDate"
            required
            type="date"
          />
        </label>
      </div>

      <label className="flex flex-col gap-2 text-sm font-semibold text-text">
        Cover photo alt text
        <input
          className="rounded-md border border-border bg-bg px-3 py-3 text-text"
          defaultValue={initialStory?.coverImageAlt ?? ""}
          maxLength={300}
          name="coverImageAlt"
          required
        />
        <span className="font-normal text-xs text-muted">
          Describe what is visible in the photo for people using a screen reader.
        </span>
      </label>

      <label className="flex flex-col gap-2 text-sm font-semibold text-text">
        Story
        <textarea
          className="min-h-64 rounded-md border border-border bg-bg px-3 py-3 leading-relaxed text-text"
          defaultValue={initialStory?.body ?? ""}
          maxLength={12000}
          name="body"
          required
        />
        <span className="font-normal text-xs text-muted">
          Use a blank line between paragraphs. This is rendered as plain text.
        </span>
      </label>

      <label className="flex min-h-12 items-center gap-3 text-sm font-semibold text-text">
        <input
          defaultChecked={initialStory?.published ?? false}
          name="published"
          type="checkbox"
        />
        Published
      </label>

      {state?.error ? (
        <p className="border-l-2 border-accent pl-4 text-sm text-muted" role="alert">
          {state.error}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-3 border-t border-border pt-6">
        <Button
          disabled={pending || imageUploadState !== "idle"}
          type="submit"
        >
          {pending ? "Saving…" : submitLabel}
        </Button>
        <Link
          className="inline-flex min-h-[var(--site-tap-min)] items-center rounded-md border border-border px-5 py-3 text-sm font-semibold text-text transition hover:border-accent hover:text-accent"
          href="/admin/stories"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
