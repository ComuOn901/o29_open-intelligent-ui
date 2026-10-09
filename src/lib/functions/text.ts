import { defineFunction } from "@openuidev/react-lang";
import { z } from "zod/v4";
import { list, read } from "./shared";

const LOCALE = "en-US";

function currencyCode(code: string | undefined): string {
  const upper = (code ?? "USD").toUpperCase();
  return /^[A-Z]{3}$/.test(upper) ? upper : "USD";
}

/** Formats with Intl; an unknown currency code falls back to USD instead of throwing. */
function format(value: number, options: Intl.NumberFormatOptions): string {
  try {
    return value.toLocaleString(LOCALE, options);
  } catch {
    return value.toLocaleString(LOCALE, { ...options, currency: "USD" });
  }
}

export const Format = defineFunction({
  name: "Format",
  description:
    'Number as text: "number" 12,345.6, "currency" $12,345.68 (currency is a code like "EUR"), "percent" 45 -> 45%, "compact" 1.2M ($1.2M with a currency)',
  params: z.object({
    value: z.number(),
    kind: z.enum(["number", "currency", "percent", "compact"]).optional(),
    decimals: z.number().optional(),
    currency: z.string().optional(),
  }),
  returns: z.string(),
  fn: ({ value, kind = "number", decimals, currency }) => {
    if (!Number.isFinite(value)) throw new Error("value is not a finite number");
    const d = decimals === undefined ? undefined : Math.min(Math.max(Math.trunc(decimals), 0), 10);
    const digits = (fallbackMax: number, fallbackMin = 0) =>
      d === undefined ? { minimumFractionDigits: fallbackMin, maximumFractionDigits: fallbackMax } : { minimumFractionDigits: d, maximumFractionDigits: d };
    switch (kind) {
      case "currency":
        return format(value, { style: "currency", currency: currencyCode(currency), ...digits(2, 2) });
      case "percent":
        return `${format(value, digits(1))}%`;
      case "compact":
        return format(value, {
          notation: "compact",
          ...digits(1),
          ...(currency ? { style: "currency", currency: currencyCode(currency) } : {}),
        });
      default:
        return format(value, digits(2));
    }
  },
});

export const Join = defineFunction({
  name: "Join",
  description: 'Joins the items (or their field) into text with sep (default ", "), skipping nulls',
  params: z.object({ list: list(), sep: z.string().optional(), field: z.string().optional() }),
  returns: z.string(),
  fn: ({ list, sep = ", ", field = "" }) =>
    list
      .map((item) => read(item, field))
      .filter((v) => v != null)
      .map((v) => (typeof v === "object" ? JSON.stringify(v) : String(v)))
      .join(sep),
});

export const Plural = defineFunction({
  name: "Plural",
  description: 'Count and word: @Plural(1, "guest") is "1 guest", 3 gives "3 guests"; plural defaults to word + "s"',
  params: z.object({ n: z.number(), word: z.string(), plural: z.string().optional() }),
  returns: z.string(),
  fn: ({ n, word, plural }) => `${format(n, { maximumFractionDigits: 2 })} ${Math.abs(n) === 1 ? word : (plural ?? `${word}s`)}`,
});

export const Pad = defineFunction({
  name: "Pad",
  description: 'Pads the start of value to length with char (default "0"), e.g. 7 -> "07"',
  params: z.object({ value: z.union([z.string(), z.number()]), length: z.number(), char: z.string().optional() }),
  returns: z.string(),
  fn: ({ value, length, char = "0" }) => String(value).padStart(Math.min(Math.trunc(length), 1000), char || "0"),
});

export const Upper = defineFunction({
  name: "Upper",
  description: "Text in upper case",
  params: z.object({ text: z.string() }),
  returns: z.string(),
  fn: ({ text }) => text.toUpperCase(),
});

export const Lower = defineFunction({
  name: "Lower",
  description: "Text in lower case",
  params: z.object({ text: z.string() }),
  returns: z.string(),
  fn: ({ text }) => text.toLowerCase(),
});

export const textFunctions = [Format, Join, Plural, Pad, Upper, Lower];
