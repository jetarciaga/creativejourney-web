import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import DestinationEditor from "@/components/DestinationEditor";

vi.mock("@/app/admin/destinations/actions", () => ({
  requestDestinationImageUpload: vi.fn(),
}));

describe("DestinationEditor", () => {
  it("blocks submit for an over-length list item and re-enables it after fixing the item", () => {
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
    const suitableFor = screen.getByRole("textbox", { name: /Suitable for/ });
    const overLengthItem = "x".repeat(161);

    fireEvent.change(suitableFor, { target: { value: overLengthItem } });

    expect(
      screen.getByText(
        "One line is 161/160 characters — trim it before saving",
      ),
    ).toBeInTheDocument();
    expect(submitButton).toBeDisabled();

    fireEvent.change(suitableFor, { target: { value: "FIT" } });

    expect(
      screen.queryByText(
        "One line is 161/160 characters — trim it before saving",
      ),
    ).not.toBeInTheDocument();
    expect(submitButton).toBeEnabled();
  });

  it("renders a returned createDestination error inline instead of navigating away", async () => {
    const createDestination = vi.fn(async () => ({
      error: "Creating destination failed: duplicate slug",
    }));

    render(
      <DestinationEditor
        action={createDestination}
        initialDestination={null}
        submitLabel="Create destination"
      />,
    );

    const form = screen
      .getByRole("button", { name: "Create destination" })
      .closest("form");
    expect(form).not.toBeNull();

    fireEvent.submit(form!);

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent(
        "Creating destination failed: duplicate slug",
      );
    });
    expect(createDestination).toHaveBeenCalled();
  });
});
