import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import AdminError from "@/app/admin/error";

describe("admin error boundary", () => {
  it("renders a friendly fallback for a thrown error and retries the segment", () => {
    const retry = vi.fn();
    const error = new Error("database connection failed");

    render(<AdminError error={error} retry={retry} />);

    expect(screen.getByRole("heading", { name: "Something went wrong" })).toBeInTheDocument();
    expect(
      screen.getByText("The admin area could not load. Please try again."),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Try again" }));

    expect(retry).toHaveBeenCalledOnce();
  });
});
