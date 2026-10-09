import { defineFunction } from "@openuidev/react-lang";
import { z } from "zod/v4";
import { finite } from "./shared";

export const Pow = defineFunction({
  name: "Pow",
  description: "base raised to exponent",
  params: z.object({ base: z.number(), exponent: z.number() }),
  returns: z.number(),
  fn: ({ base, exponent }) => finite(Math.pow(base, exponent)),
});

export const Sqrt = defineFunction({
  name: "Sqrt",
  description: "Square root; null for a negative number",
  params: z.object({ number: z.number() }),
  returns: z.number(),
  fn: ({ number }) => finite(Math.sqrt(number)),
});

export const Random = defineFunction({
  name: "Random",
  description: "Random number from min to max (integer true: a whole number, max included); draws anew each time, so call it inside @Set",
  params: z.object({ min: z.number(), max: z.number(), integer: z.boolean().optional() }),
  returns: z.number(),
  fn: ({ min, max, integer }) => {
    const lo = Math.min(min, max);
    const hi = Math.max(min, max);
    if (!integer) return lo + Math.random() * (hi - lo);
    const a = Math.ceil(lo);
    const b = Math.floor(hi);
    if (a > b) throw new Error("no whole number between min and max");
    return a + Math.floor(Math.random() * (b - a + 1));
  },
});

export const Clamp = defineFunction({
  name: "Clamp",
  description: "number kept between min and max",
  params: z.object({ number: z.number(), min: z.number(), max: z.number() }),
  returns: z.number(),
  fn: ({ number, min, max }) => Math.min(Math.max(number, Math.min(min, max)), Math.max(min, max)),
});

export const Percent = defineFunction({
  name: "Percent",
  description: "part / total * 100, e.g. @Percent(3, 4) is 75; 0 when total is 0",
  params: z.object({ part: z.number(), total: z.number() }),
  returns: z.number(),
  fn: ({ part, total }) => (total === 0 ? 0 : finite((part / total) * 100)),
});

export const Lerp = defineFunction({
  name: "Lerp",
  description: "The value a fraction t of the way from a to b",
  params: z.object({ a: z.number(), b: z.number(), t: z.number() }),
  returns: z.number(),
  fn: ({ a, b, t }) => finite(a + (b - a) * t),
});

export const numberFunctions = [Pow, Sqrt, Random, Clamp, Percent, Lerp];
