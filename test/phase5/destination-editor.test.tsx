import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import DestinationEditor from "@/components/DestinationEditor";

vi.mock("@/app/admin/destinations/actions", () => ({
  requestDestinationImageUpload: vi.fn(),
}));

vi.mock("@/components/ImageUploadField", () => ({
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

describe("DestinationEditor", () => {
  it("blocks submit while the hero image is uploading", () => {
    const action = vi.fn();

    render(
      <DestinationEditor
        action={action}
        initialDestination={null}
        submitLabel="Create destination"
      />,
    );

    const submitButton = screen.getByRole("button", {
      name: "Create destination",
    });
    expect(submitButton).toBeEnabled();

    fireEvent.click(screen.getByRole("button", { name: "Start upload" }));

    expect(submitButton).toBeDisabled();
    fireEvent.click(submitButton);
    expect(action).not.toHaveBeenCalled();
  });
});
