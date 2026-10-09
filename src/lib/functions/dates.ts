import { defineFunction } from "@openuidev/react-lang";
import { z } from "zod/v4";
import { date } from "./shared";

const DAY = 86_400_000;
const DATE_ONLY = /^(\d{4})-(\d{2})-(\d{2})$/;

/**
 * A date as a calendar day (days since 1970-01-01) plus, for a timestamp, the
 * instant. "YYYY-MM-DD" is a calendar date with no time zone; a timestamp or an
 * ISO date-time is read in the viewer's time zone.
 */
type Parsed = { day: number; instant: Date | null };

export function parseDate(value: string | number): Parsed {
  if (typeof value === "string") {
    const m = DATE_ONLY.exec(value.trim());
    if (m) {
      const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
      const utc = Date.UTC(y, mo - 1, d);
      const check = new Date(utc);
      if (check.getUTCMonth() !== mo - 1 || check.getUTCDate() !== d) throw new Error(`invalid date "${value}"`);
      return { day: utc / DAY, instant: null };
    }
  }
  const instant = new Date(value);
  if (Number.isNaN(instant.getTime())) throw new Error(`invalid date "${value}"`);
  return { day: Date.UTC(instant.getFullYear(), instant.getMonth(), instant.getDate()) / DAY, instant };
}

export function isoDay(day: number): string {
  return new Date(day * DAY).toISOString().slice(0, 10);
}

const STYLES: Record<string, Intl.DateTimeFormatOptions> = {
  date: { month: "short", day: "numeric", year: "numeric" },
  short: { month: "short", day: "numeric" },
  long: { weekday: "long", month: "long", day: "numeric", year: "numeric" },
  weekday: { weekday: "short" },
  month: { month: "short", year: "numeric" },
  time: { hour: "numeric", minute: "2-digit" },
  datetime: { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" },
};

export const Now = defineFunction({
  name: "Now",
  description: "The current date and time as an ISO string",
  params: z.object({}),
  returns: z.string(),
  fn: () => new Date().toISOString(),
});

export const FormatDate = defineFunction({
  name: "FormatDate",
  description:
    'A date as text: "date" Oct 9, 2026 (default), "short" Oct 9, "long" Friday, October 9, 2026, "weekday" Fri, "month" Oct 2026, "time" 9:30 PM, "datetime", "iso" 2026-10-09. Dates are "YYYY-MM-DD", ISO or a timestamp',
  params: z.object({
    date: date(),
    style: z.enum(["date", "short", "long", "weekday", "month", "time", "datetime", "iso"]).optional(),
  }),
  returns: z.string(),
  fn: ({ date, style = "date" }) => {
    const { day, instant } = parseDate(date);
    if (style === "iso") return isoDay(day);
    // A calendar date formats in UTC so its day never shifts with the viewer's zone
    const at = instant ?? new Date(day * DAY);
    return at.toLocaleString("en-US", { ...STYLES[style], ...(instant ? {} : { timeZone: "UTC" }) });
  },
});

export const AddDays = defineFunction({
  name: "AddDays",
  description: 'The date days later (negative: earlier), as "YYYY-MM-DD"',
  params: z.object({ date: date(), days: z.number() }),
  returns: z.string(),
  fn: ({ date, days }) => isoDay(parseDate(date).day + Math.trunc(days)),
});

export const DaysBetween = defineFunction({
  name: "DaysBetween",
  description: "Calendar days from one date to another (negative if to is earlier)",
  params: z.object({ from: date(), to: date() }),
  returns: z.number(),
  fn: ({ from, to }) => parseDate(to).day - parseDate(from).day,
});

export const dateFunctions = [Now, FormatDate, AddDays, DaysBetween];
