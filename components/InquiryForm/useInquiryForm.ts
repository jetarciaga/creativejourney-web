"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { inquirySchema, type InquiryField } from "@/lib/inquiry/schema";

export type InquiryDestinationOption = {
  slug: string;
  name: string;
};

export type InquiryFormValues = {
  arrivalDate: string;
  departureDate: string;
  nights: string;
  paxCount: string;
  accommodationTier: "3_star" | "4_star" | "5_star" | "";
  contactName: string;
  companyName: string;
  email: string;
  whatsapp: string;
  address: string;
  destination: string;
  roomConfig: "single" | "twin" | "double" | "triple" | "mixed" | "";
  budgetRange: string;
  notes: string;
  consentPrivacy: boolean;
  consentMarketing: boolean;
  website: string;
};

export type InquiryFormStatus = "idle" | "submitting" | "success" | "error";

export type InquiryFormErrors = Partial<Record<InquiryField | "form", string>>;

function initialValues(destination = ""): InquiryFormValues {
  return {
    arrivalDate: "",
    departureDate: "",
    nights: "",
    paxCount: "",
    accommodationTier: "",
    contactName: "",
    companyName: "",
    email: "",
    whatsapp: "",
    address: "",
    destination,
    roomConfig: "",
    budgetRange: "",
    notes: "",
    consentPrivacy: false,
    consentMarketing: false,
    website: "",
  };
}

function computedNights(arrivalDate: string, departureDate: string): string | null {
  if (!arrivalDate || !departureDate) return null;
  const arrival = new Date(`${arrivalDate}T00:00:00Z`);
  const departure = new Date(`${departureDate}T00:00:00Z`);
  const nights = Math.round((departure.getTime() - arrival.getTime()) / 86_400_000);
  return Number.isFinite(nights) && nights >= 0 ? String(nights) : null;
}

function toPayload(values: InquiryFormValues, elapsedMs: number) {
  return {
    ...values,
    nights: Number(values.nights),
    paxCount: Number(values.paxCount),
    elapsedMs,
  };
}

function errorsFromIssues(issues: Array<{ path: PropertyKey[]; message: string }>): InquiryFormErrors {
  const errors: InquiryFormErrors = {};
  for (const issue of issues) {
    const field = typeof issue.path[0] === "string" ? issue.path[0] : "form";
    if (!errors[field as keyof InquiryFormErrors]) {
      errors[field as keyof InquiryFormErrors] = issue.message;
    }
  }
  return errors;
}

export function useInquiryForm(destinations: InquiryDestinationOption[]) {
  const [values, setValues] = useState<InquiryFormValues>(() => initialValues());
  const [status, setStatus] = useState<InquiryFormStatus>("idle");
  const [errors, setErrors] = useState<InquiryFormErrors>({});
  const [announcement, setAnnouncement] = useState("");
  const [referenceCode, setReferenceCode] = useState<string | null>(null);
  const [startedAt] = useState(() => Date.now());

  useEffect(() => {
    const queryDestination = new URLSearchParams(window.location.search).get("destination");
    if (!queryDestination) return;

    const matched = destinations.find(
      (destination) =>
        destination.slug.toLowerCase() === queryDestination.toLowerCase() ||
        destination.name.toLowerCase() === queryDestination.toLowerCase(),
    );
    if (matched) {
      const frame = window.requestAnimationFrame(() => {
        setValues((current) => ({ ...current, destination: matched.name }));
      });
      return () => window.cancelAnimationFrame(frame);
    }
  }, [destinations]);

  const focusFirstError = useCallback((nextErrors: InquiryFormErrors) => {
    const field = Object.keys(nextErrors).find((key) => key !== "form");
    if (!field) return;
    window.requestAnimationFrame(() => {
      document.getElementById(`inquiry-${field}`)?.focus();
    });
  }, []);

  const updateField = useCallback(
    <K extends keyof InquiryFormValues>(field: K, value: InquiryFormValues[K]) => {
      setValues((current) => {
        const next = { ...current, [field]: value };
        if (field === "arrivalDate" || field === "departureDate") {
          const nights = computedNights(next.arrivalDate, next.departureDate);
          if (nights !== null) next.nights = nights;
        }
        return next;
      });
      setErrors((current) => ({ ...current, [field]: undefined }));
      setAnnouncement("");
      if (status === "error") setStatus("idle");
    },
    [status],
  );

  const submit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setStatus("submitting");
      setErrors({});
      setAnnouncement("");

      const payload = toPayload(values, Date.now() - startedAt);
      const clientResult = inquirySchema.safeParse(payload);
      if (!clientResult.success) {
        const nextErrors = errorsFromIssues(clientResult.error.issues);
        setErrors(nextErrors);
        setAnnouncement(Object.values(nextErrors).find(Boolean) ?? "Please check the highlighted fields.");
        setStatus("error");
        focusFirstError(nextErrors);
        return;
      }

      try {
        const response = await fetch("/api/inquiry", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (response.status === 422) {
          const body = (await response.json()) as { errors?: Record<string, string> };
          const nextErrors: InquiryFormErrors = body.errors ?? { form: "Please check the highlighted fields." };
          setErrors(nextErrors);
          setAnnouncement(Object.values(nextErrors).find(Boolean) ?? "Please check the highlighted fields.");
          setStatus("error");
          focusFirstError(nextErrors);
          return;
        }

        if (!response.ok) throw new Error("Inquiry request failed");

        const body = (await response.json()) as { reference_code?: string };
        if (!body.reference_code) throw new Error("Reference code missing");
        setReferenceCode(body.reference_code);
        setAnnouncement("");
        setStatus("success");
      } catch {
        const nextErrors = { form: "We could not send your inquiry. Please try again or email us directly." };
        setErrors(nextErrors);
        setAnnouncement(nextErrors.form);
        setStatus("error");
        focusFirstError(nextErrors);
      }
    },
    [focusFirstError, startedAt, values],
  );

  return {
    values,
    status,
    errors,
    announcement,
    referenceCode,
    updateField,
    submit,
  };
}
