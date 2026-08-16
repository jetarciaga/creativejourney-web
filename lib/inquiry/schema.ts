import { parsePhoneNumberWithError } from "libphonenumber-js";
import { z } from "zod";

function todayUTC() {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

const optionalText = (maximum: number) =>
  z.string().trim().max(maximum).optional().transform((value) => value || undefined);

const optionalRoomConfig = z
  .enum(["single", "twin", "double", "triple", "mixed"])
  .optional()
  .or(z.literal(""))
  .transform((value) => value || undefined);

/**
 * The request field list owns both the schema shape and the inferred payload.
 * Consumers iterate this object for field names instead of maintaining a
 * second hand-written request type.
 */
export const INQUIRY_FIELDS = {
  arrivalDate: z.coerce.date(),
  departureDate: z.coerce.date(),
  nights: z.coerce.number().int().min(0).max(365),
  paxCount: z.coerce.number().int().min(1).max(500),
  accommodationTier: z.enum(["3_star", "4_star", "5_star"]),

  contactName: z.string().trim().min(2).max(120),
  companyName: optionalText(200),
  email: z.string().trim().email(),
  whatsapp: z.string().trim().transform((value, ctx) => {
    try {
      const parsed = parsePhoneNumberWithError(value);
      if (!parsed.isValid()) throw new Error("invalid phone number");
      return parsed.format("E.164");
    } catch {
      ctx.addIssue({
        code: "custom",
        message:
          "Enter your WhatsApp number with country code, e.g. +63 917 123 4567",
      });
      return z.NEVER;
    }
  }),
  address: z.string().trim().min(5).max(500),

  destination: optionalText(120),
  roomConfig: optionalRoomConfig,
  budgetRange: optionalText(120),
  notes: optionalText(2000),

  consentPrivacy: z.literal(true, { message: "Privacy consent is required" }),
  consentMarketing: z.boolean().default(false),
  website: z.literal(""),
  elapsedMs: z.coerce.number().int().min(3001),
} as const;

export type InquiryField = keyof typeof INQUIRY_FIELDS;

export const inquirySchema = z
  .object(INQUIRY_FIELDS)
  .strict()
  .refine((data) => data.arrivalDate >= todayUTC(), {
    message: "Arrival date cannot be in the past",
    path: ["arrivalDate"],
  })
  .refine((data) => data.departureDate > data.arrivalDate, {
    message: "Departure must be after arrival",
    path: ["departureDate"],
  })
  .refine(
    (data) =>
      (data.arrivalDate.getTime() - todayUTC().getTime()) / (1000 * 60 * 60 * 24) <=
      730,
    {
      message: "Arrival date is too far in the future",
      path: ["arrivalDate"],
    },
  );

export type InquiryIn = z.infer<typeof inquirySchema>;
