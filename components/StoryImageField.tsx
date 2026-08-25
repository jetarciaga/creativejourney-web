"use client";

import { useEffect, useRef, useState } from "react";
import { createPublicSupabaseClient } from "@/lib/supabase/public";
import { requestStoryImageUpload } from "@/app/admin/stories/actions";
import { prepareStoryImage } from "@/lib/image-optimize";

export type StoryImageUploadState = "idle" | "preparing" | "uploading";

export default function StoryImageField({
  initialPath,
  initialPreviewUrl,
  uploadState,
  onUploadStateChange,
}: {
  initialPath: string;
  initialPreviewUrl?: string;
  uploadState: StoryImageUploadState;
  onUploadStateChange: (state: StoryImageUploadState) => void;
}) {
  const [path, setPath] = useState(initialPath);
  const [previewUrl, setPreviewUrl] = useState(initialPreviewUrl ?? "");
  const [error, setError] = useState("");
  const objectUrlRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
      }
    };
  }, []);

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setError("");
    onUploadStateChange("preparing");

    try {
      const prepared = await prepareStoryImage(file);
      onUploadStateChange("uploading");

      const upload = await requestStoryImageUpload(
        prepared.contentType,
        prepared.blob.size,
      );
      const supabase = createPublicSupabaseClient();
      const { error: uploadError } = await supabase.storage
        .from("story-images")
        .uploadToSignedUrl(upload.path, upload.token, prepared.blob, {
          contentType: prepared.contentType,
        });

      if (uploadError) {
        throw new Error(uploadError.message);
      }

      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
      }
      const objectUrl = URL.createObjectURL(prepared.blob);
      objectUrlRef.current = objectUrl;
      setPath(upload.path);
      setPreviewUrl(objectUrl);
      onUploadStateChange("idle");
    } catch (uploadError) {
      onUploadStateChange("idle");
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "The photo could not be uploaded.",
      );
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="flex flex-col gap-2 text-sm font-semibold text-text" htmlFor="story-cover-image">
          Cover photo
          <input
            accept="image/jpeg,image/png,image/webp,image/avif"
            className="rounded-md border border-border bg-bg px-3 py-3 text-sm text-text"
            id="story-cover-image"
            onChange={handleFileChange}
            type="file"
          />
        </label>
        <p className="mt-2 text-xs text-muted">
          Photos are prepared in the browser before they are stored.
        </p>
      </div>

      <input name="coverImagePath" type="hidden" value={path} readOnly />

      {uploadState === "preparing" ? (
        <p aria-live="polite" className="text-sm font-semibold text-accent">
          Preparing photo…
        </p>
      ) : null}
      {uploadState === "uploading" ? (
        <p aria-live="polite" className="text-sm font-semibold text-accent">
          Uploading photo…
        </p>
      ) : null}
      {error ? (
        <p className="border-l-2 border-accent pl-4 text-sm text-muted" role="alert">
          {error}
        </p>
      ) : null}

      {previewUrl ? (
        <div className="relative aspect-[4/3] max-w-xl overflow-hidden rounded-card border border-border bg-surface">
          {/* A blob URL is created locally for the just-uploaded preview. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            alt="Selected story cover preview"
            className="absolute inset-0 h-full w-full object-cover"
            src={previewUrl}
          />
        </div>
      ) : null}
    </div>
  );
}
