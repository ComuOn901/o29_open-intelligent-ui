import { defineFunction } from "@openuidev/react-lang";
import { z } from "zod/v4";
import { finite, numbers } from "./shared";

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

export const Allocate = defineFunction({
  name: "Allocate",
  description: "Splits total in proportion to weights, rounded to decimals (default 2), so the parts add up to exactly total, e.g. @Allocate(100, [1, 1, 1]) is [33.34, 33.33, 33.33]",
  params: z.object({ total: z.number(), weights: numbers(), decimals: z.number().optional() }),
  returns: z.array(z.number()),
  fn: ({ total, weights, decimals }) => {
    const sum = weights.reduce((a, b) => a + b, 0);
    if (!weights.length || weights.some((w) => !Number.isFinite(w) || w < 0) || !(sum > 0)) throw new Error("weights must be zero or more, with a positive sum");
    // Whole units (cents for 2 decimals); the leftover units go to the largest remainders
    const scale = 10 ** Math.min(6, Math.max(0, Math.round(decimals ?? 2)));
    const units = Math.round(Math.abs(total) * scale);
    const exact = weights.map((w) => (units * w) / sum);
    const parts = exact.map(Math.floor);
    let left = units - parts.reduce((a, b) => a + b, 0);
    const order = exact.map((x, i) => ({ i, rest: x - Math.floor(x) })).sort((a, b) => b.rest - a.rest || a.i - b.i);
    for (const { i } of order) {
      if (left <= 0) break;
      parts[i] += 1;
      left -= 1;
    }
    return parts.map((p) => (total < 0 ? -p : p) / scale);
  },
});

export const numberFunctions = [Pow, Sqrt, Random, Clamp, Percent, Allocate];
