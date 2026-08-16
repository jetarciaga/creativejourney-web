"use client";

import type { ChangeEvent } from "react";
import Button from "@/components/Button";
import Card from "@/components/Card";
import {
  useInquiryForm,
  type InquiryDestinationOption,
  type InquiryFormErrors,
  type InquiryFormValues,
} from "@/components/InquiryForm/useInquiryForm";

const inputClasses =
  "mt-2 w-full rounded-md border border-border bg-bg px-3 py-3 text-text shadow-sm outline-none transition placeholder:text-muted focus:border-border-strong";
const labelClasses = "text-sm font-semibold text-text";

function FieldError({ field, errors }: { field: keyof InquiryFormErrors; errors: InquiryFormErrors }) {
  const message = errors[field];
  return message ? (
    <p id={`inquiry-${String(field)}-error`} className="mt-1 text-sm font-semibold text-text">
      {message}
    </p>
  ) : null;
}

function fieldProps(
  field: keyof InquiryFormValues,
  errors: InquiryFormErrors,
): { "aria-invalid": boolean; "aria-describedby": string | undefined } {
  return {
    "aria-invalid": Boolean(errors[field]),
    "aria-describedby": errors[field] ? `inquiry-${String(field)}-error` : undefined,
  };
}

export default function InquiryForm({ destinations }: { destinations: InquiryDestinationOption[] }) {
  const { values, status, errors, announcement, referenceCode, updateField, submit } = useInquiryForm(destinations);

  if (status === "success" && referenceCode) {
    return (
      <Card className="p-6 sm:p-8">
        <p className="eyebrow">Inquiry received</p>
        <h2 className="mt-4 font-display text-3xl font-semibold text-text">Thank you — we have your brief.</h2>
        <p className="mt-4 text-muted" role="status" aria-live="polite">
          Your reference code is <strong className="text-text">{referenceCode}</strong>.
          We usually reply within one business day with the next questions or a tailored starting point.
        </p>
      </Card>
    );
  }

  const update = (field: keyof InquiryFormValues) => (event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const rawValue = event.target.type === "checkbox" ? (event.target as HTMLInputElement).checked : event.target.value;
    updateField(field, rawValue as never);
  };

  return (
    <Card className="p-6 sm:p-8">
      <form onSubmit={submit} noValidate>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="eyebrow">Inquiry form</p>
            <h2 className="mt-3 font-display text-3xl font-semibold text-text">Tell us what you’re planning.</h2>
          </div>
          <p className="text-sm text-muted">Fields marked * are required.</p>
        </div>

        <div role="status" aria-live="polite" className="mt-6 min-h-6 text-sm font-semibold text-text">
          {status === "submitting" ? "Sending your inquiry…" : announcement}
        </div>

        <div className="mt-2 grid gap-6 sm:grid-cols-2">
          <div>
            <label className={labelClasses} htmlFor="inquiry-contactName">Contact person name *</label>
            <input id="inquiry-contactName" name="contactName" autoComplete="name" value={values.contactName} onChange={update("contactName")} className={inputClasses} {...fieldProps("contactName", errors)} />
            <FieldError field="contactName" errors={errors} />
          </div>
          <div>
            <label className={labelClasses} htmlFor="inquiry-companyName">Company name <span className="font-normal text-muted">(optional)</span></label>
            <input id="inquiry-companyName" name="companyName" autoComplete="organization" value={values.companyName} onChange={update("companyName")} className={inputClasses} {...fieldProps("companyName", errors)} />
            <FieldError field="companyName" errors={errors} />
          </div>
          <div>
            <label className={labelClasses} htmlFor="inquiry-email">Email *</label>
            <input id="inquiry-email" name="email" type="email" autoComplete="email" value={values.email} onChange={update("email")} className={inputClasses} {...fieldProps("email", errors)} />
            <FieldError field="email" errors={errors} />
          </div>
          <div>
            <label className={labelClasses} htmlFor="inquiry-whatsapp">WhatsApp number *</label>
            <input id="inquiry-whatsapp" name="whatsapp" type="tel" autoComplete="tel" placeholder="+63 917 123 4567" value={values.whatsapp} onChange={update("whatsapp")} className={inputClasses} {...fieldProps("whatsapp", errors)} />
            <FieldError field="whatsapp" errors={errors} />
          </div>
          <div className="sm:col-span-2">
            <label className={labelClasses} htmlFor="inquiry-address">Address *</label>
            <textarea id="inquiry-address" name="address" autoComplete="street-address" rows={3} value={values.address} onChange={update("address")} className={inputClasses} {...fieldProps("address", errors)} />
            <FieldError field="address" errors={errors} />
          </div>

          <div>
            <label className={labelClasses} htmlFor="inquiry-arrivalDate">Arrival date *</label>
            <input id="inquiry-arrivalDate" name="arrivalDate" type="date" value={values.arrivalDate} onChange={update("arrivalDate")} className={inputClasses} {...fieldProps("arrivalDate", errors)} />
            <FieldError field="arrivalDate" errors={errors} />
          </div>
          <div>
            <label className={labelClasses} htmlFor="inquiry-departureDate">Departure date *</label>
            <input id="inquiry-departureDate" name="departureDate" type="date" value={values.departureDate} onChange={update("departureDate")} className={inputClasses} {...fieldProps("departureDate", errors)} />
            <FieldError field="departureDate" errors={errors} />
          </div>
          <div>
            <label className={labelClasses} htmlFor="inquiry-nights">Number of nights *</label>
            <input id="inquiry-nights" name="nights" type="number" min={0} max={365} value={values.nights} onChange={update("nights")} className={inputClasses} {...fieldProps("nights", errors)} />
            <p className="mt-1 text-xs text-muted">Calculated from your dates; adjust it for day-use or open-jaw plans.</p>
            <FieldError field="nights" errors={errors} />
          </div>
          <div>
            <label className={labelClasses} htmlFor="inquiry-paxCount">Number of pax *</label>
            <input id="inquiry-paxCount" name="paxCount" type="number" min={1} max={500} value={values.paxCount} onChange={update("paxCount")} className={inputClasses} {...fieldProps("paxCount", errors)} />
            <FieldError field="paxCount" errors={errors} />
          </div>

          <fieldset className="sm:col-span-2">
            <legend className={labelClasses}>Preferred accommodation tier *</legend>
            <div className="mt-3 flex flex-wrap gap-4">
              {([
                ["3_star", "3-star"],
                ["4_star", "4-star"],
                ["5_star", "5-star"],
              ] as const).map(([value, label]) => (
                <label key={value} className="inline-flex min-h-[var(--site-tap-min)] items-center gap-2 text-sm text-text" htmlFor={`inquiry-${value}`}>
                  <input id={`inquiry-${value}`} name="accommodationTier" type="radio" value={value} checked={values.accommodationTier === value} onChange={update("accommodationTier")} {...fieldProps("accommodationTier", errors)} />
                  {label}
                </label>
              ))}
            </div>
            <FieldError field="accommodationTier" errors={errors} />
          </fieldset>

          <div>
            <label className={labelClasses} htmlFor="inquiry-destination">Destination of interest</label>
            <input id="inquiry-destination" name="destination" type="text" list="inquiry-destination-options" value={values.destination} onChange={update("destination")} className={inputClasses} {...fieldProps("destination", errors)} />
            <datalist id="inquiry-destination-options">
              {destinations.map((destination) => <option key={destination.slug} value={destination.name} />)}
            </datalist>
            <FieldError field="destination" errors={errors} />
          </div>
          <div>
            <label className={labelClasses} htmlFor="inquiry-roomConfig">Room configuration</label>
            <select id="inquiry-roomConfig" name="roomConfig" value={values.roomConfig} onChange={update("roomConfig")} className={inputClasses} {...fieldProps("roomConfig", errors)}>
              <option value="">Choose later</option>
              <option value="single">Single</option>
              <option value="twin">Twin</option>
              <option value="double">Double</option>
              <option value="triple">Triple</option>
              <option value="mixed">Mixed</option>
            </select>
            <FieldError field="roomConfig" errors={errors} />
          </div>
          <div>
            <label className={labelClasses} htmlFor="inquiry-budgetRange">Budget range</label>
            <select id="inquiry-budgetRange" name="budgetRange" value={values.budgetRange} onChange={update("budgetRange")} className={inputClasses} {...fieldProps("budgetRange", errors)}>
              <option value="">Choose later</option>
              <option value="value">Value-conscious</option>
              <option value="comfort">Comfort</option>
              <option value="premium">Premium</option>
              <option value="bespoke">Bespoke / to be discussed</option>
            </select>
            <FieldError field="budgetRange" errors={errors} />
          </div>
          <div className="sm:col-span-2">
            <label className={labelClasses} htmlFor="inquiry-notes">Notes</label>
            <textarea id="inquiry-notes" name="notes" rows={5} placeholder="Tell us about the purpose, pace, interests, or anything else that would help us shape the first response." value={values.notes} onChange={update("notes")} className={inputClasses} {...fieldProps("notes", errors)} />
            <FieldError field="notes" errors={errors} />
          </div>
        </div>

        <div className="mt-8 space-y-3 border-t border-border pt-6">
          <label className="flex items-start gap-3 text-sm text-text" htmlFor="inquiry-consentPrivacy">
            <input id="inquiry-consentPrivacy" name="consentPrivacy" type="checkbox" checked={values.consentPrivacy} onChange={update("consentPrivacy")} className="mt-1 h-4 w-4" {...fieldProps("consentPrivacy", errors)} />
            <span>I agree to the <a className="font-semibold text-link underline" href="/privacy">Privacy Policy</a> and consent to Creative Journeys using these details to respond to my inquiry. *</span>
          </label>
          <FieldError field="consentPrivacy" errors={errors} />
          <label className="flex items-start gap-3 text-sm text-text" htmlFor="inquiry-consentMarketing">
            <input id="inquiry-consentMarketing" name="consentMarketing" type="checkbox" checked={values.consentMarketing} onChange={update("consentMarketing")} className="mt-1 h-4 w-4" {...fieldProps("consentMarketing", errors)} />
            <span>I’d like to hear about occasional travel ideas and updates.</span>
          </label>
        </div>

        <div className="absolute left-[-9999px] top-auto h-px w-px overflow-hidden" aria-hidden="false">
          <label htmlFor="inquiry-website">Website</label>
          <input id="inquiry-website" name="website" tabIndex={-1} autoComplete="off" value={values.website} onChange={update("website")} />
          <label htmlFor="inquiry-elapsedMs">Elapsed time</label>
          <input id="inquiry-elapsedMs" name="elapsedMs" type="number" readOnly value="" aria-hidden="true" />
        </div>

        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-xl text-sm text-muted">Your details stay with Creative Journeys and are used to prepare a thoughtful response.</p>
          <Button type="submit" disabled={status === "submitting"} aria-busy={status === "submitting"}>
            {status === "submitting" ? "Sending…" : "Send inquiry"} <span aria-hidden="true">→</span>
          </Button>
        </div>
      </form>
    </Card>
  );
}
