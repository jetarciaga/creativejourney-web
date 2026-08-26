import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import StoryEditor from "@/components/StoryEditor";

vi.mock("@/components/StoryImageField", () => ({
  default: ({
    onUploadStateChange,
  }: {
    onUploadStateChange?: (state: "idle" | "preparing" | "uploading") => void;
  }) => (
    <button
      type="button"
      onClick={() => onUploadStateChange?.("uploading")}
    >
      Start upload
    </button>
  ),
}));

describe("StoryEditor", () => {
  it("blocks submit while the cover photo is uploading", () => {
    const action = vi.fn(async () => ({ error: "" }));

    render(
      <StoryEditor
        action={action}
        initialStory={null}
        submitLabel="Create story"
      />,
    );

    const submitButton = screen.getByRole("button", { name: "Create story" });
    expect(submitButton).toBeEnabled();

    fireEvent.click(screen.getByRole("button", { name: "Start upload" }));

    expect(submitButton).toBeDisabled();
    fireEvent.click(submitButton);
    expect(action).not.toHaveBeenCalled();
  });
});
