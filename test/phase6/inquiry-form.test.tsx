import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import InquiryForm from "@/components/InquiryForm/InquiryForm";

const destinations = [{ slug: "cebu", name: "Cebu" }];

function dateAfterToday(days: number) {
  const date = new Date();
  date.setUTCHours(0, 0, 0, 0);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function fillRequiredFields() {
  fireEvent.change(screen.getByLabelText(/contact person name/i), {
    target: { value: "Jane Traveler" },
  });
  fireEvent.change(screen.getByLabelText(/arrival date/i), {
    target: { value: dateAfterToday(30) },
  });
  fireEvent.change(screen.getByLabelText(/departure date/i), {
    target: { value: dateAfterToday(35) },
  });
  fireEvent.change(screen.getByLabelText(/number of pax/i), {
    target: { value: "2" },
  });
  fireEvent.click(screen.getByLabelText("4-star"));
  fireEvent.change(screen.getByLabelText(/whatsapp number/i), {
    target: { value: "+639171234567" },
  });
  fireEvent.change(screen.getByLabelText(/email/i), {
    target: { value: "jane@example.com" },
  });
  fireEvent.change(screen.getByLabelText(/address/i), {
    target: { value: "123 Example Street, Muntinlupa City" },
  });
  fireEvent.click(screen.getByLabelText(/I agree to the Privacy Policy/i));
}

describe("InquiryForm", () => {
  beforeEach(() => {
    window.history.replaceState({}, "", "/contact?destination=cebu");
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("renders labeled native controls and prefills the destination from the URL", async () => {
    render(<InquiryForm destinations={destinations} />);

    expect(screen.getByLabelText(/contact person name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/arrival date/i)).toHaveAttribute("type", "date");
    expect(screen.getByLabelText(/whatsapp number/i)).toHaveAttribute("type", "tel");
    expect(screen.getByLabelText(/^email/i)).toHaveAttribute("type", "email");
    expect(screen.getByLabelText(/number of pax/i)).toHaveAttribute("type", "number");

    await waitFor(() => {
      expect(screen.getByLabelText(/destination/i)).toHaveValue("Cebu");
    });
  });

  it("accepts a free-text destination and exposes known destinations as datalist options", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ reference_code: "CJ-2026-0002" }), { status: 201 }),
    );
    window.history.replaceState({}, "", "/contact");
    render(
      <InquiryForm
        destinations={[
          { slug: "cebu", name: "Cebu" },
          { slug: "bohol", name: "Bohol" },
        ]}
      />,
    );

    const destination = screen.getByLabelText(/destination/i);
    expect(destination).toHaveAttribute("type", "text");
    expect(destination).toHaveAttribute("list", "inquiry-destination-options");
    expect(Array.from(document.querySelectorAll<HTMLOptionElement>("#inquiry-destination-options option")).map((option) => option.value)).toEqual([
      "Cebu",
      "Bohol",
    ]);

    fireEvent.change(destination, { target: { value: "Palawan" } });
    expect(destination).toHaveValue("Palawan");
    fillRequiredFields();
    vi.spyOn(Date, "now").mockReturnValue(Date.now() + 5001);
    fireEvent.submit(screen.getByRole("button", { name: /send inquiry/i }).closest("form")!);

    await waitFor(() => expect(vi.mocked(fetch)).toHaveBeenCalled());
    const call = vi.mocked(fetch).mock.calls[0];
    if (!call) throw new Error("fetch was not called");
    const [, requestInit] = call;
    expect(JSON.parse(String(requestInit?.body))).toMatchObject({ destination: "Palawan" });
  });

  it("replaces the form with the reference code on success", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ reference_code: "CJ-2026-0001" }), { status: 201 }),
    );
    render(<InquiryForm destinations={destinations} />);
    fillRequiredFields();
    const elapsedNow = Date.now() + 5001;
    vi.spyOn(Date, "now").mockReturnValue(elapsedNow);
    expect(screen.getByLabelText("4-star")).toBeChecked();
    expect(screen.getByLabelText(/I agree to the Privacy Policy/i)).toBeChecked();

    fireEvent.submit(screen.getByRole("button", { name: /send inquiry/i }).closest("form")!);

    await waitFor(() => expect(vi.mocked(fetch)).toHaveBeenCalled());
    await waitFor(() => {
      expect(screen.getByText("CJ-2026-0001")).toBeInTheDocument();
      expect(screen.getByText(/we usually reply within/i)).toBeInTheDocument();
    });
  });

  it("maps a 422 response to fields, focuses the first error, and announces it", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(
        JSON.stringify({ errors: { contactName: "Name is required", email: "Email is invalid" } }),
        { status: 422 },
      ),
    );
    render(<InquiryForm destinations={destinations} />);
    fillRequiredFields();
    const elapsedNow = Date.now() + 5001;
    vi.spyOn(Date, "now").mockReturnValue(elapsedNow);
    expect(screen.getByLabelText("4-star")).toBeChecked();
    expect(screen.getByLabelText(/I agree to the Privacy Policy/i)).toBeChecked();

    fireEvent.submit(screen.getByRole("button", { name: /send inquiry/i }).closest("form")!);

    await waitFor(() => expect(vi.mocked(fetch)).toHaveBeenCalled());
    await waitFor(() => {
      expect(screen.getAllByText("Name is required").length).toBeGreaterThanOrEqual(1);
      expect(screen.getByRole("status")).toHaveTextContent(/name is required/i);
      expect(document.activeElement).toBe(screen.getByLabelText(/contact person name/i));
    });
  });
});
