"use client";

import Link from "next/link";
import { useState } from "react";
import { useFormStatus } from "react-dom";
import Button from "@/components/Button";
import StoryImageField, {
  type StoryImageUploadState,
} from "@/components/StoryImageField";
import type { Story } from "@/lib/story-model";

type StoryAction = (formData: FormData) => void | Promise<void>;

function SubmitButton({ label, disabled }: { label: string; disabled: boolean }) {
  const { pending } = useFormStatus();

  return (
    <Button disabled={pending || disabled} type="submit">
      {pending ? "Saving…" : label}
    </Button>
  );
}

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
  const [imageUploadState, setImageUploadState] =
    useState<StoryImageUploadState>("idle");

  return (
    <form action={action} className="space-y-8">
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

      <div className="flex flex-wrap gap-3 border-t border-border pt-6">
        <SubmitButton
          disabled={imageUploadState !== "idle"}
          label={submitLabel}
        />
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
