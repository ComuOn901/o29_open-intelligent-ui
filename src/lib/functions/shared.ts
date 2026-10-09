import { z } from "zod/v4";

export const list = () => z.array(z.any());
export const numbers = () => z.array(z.number());
export const date = () => z.union([z.string(), z.number()]);
export const agg = () => z.enum(["sum", "avg", "count", "min", "max"]);

/** Reads `field` from a row, with dot paths; "" is the item itself, like @Filter. */
export function read(item: unknown, field: string): unknown {
  if (!field) return item;
  let cur: unknown = item;
  for (const key of field.split(".")) {
    if (cur == null || typeof cur !== "object") return undefined;
    cur = (cur as Record<string, unknown>)[key];
  }
  return cur;
}

/** Strict equality, except a number and its string form match (ids from inputs are often strings). */
export function same(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  const mixed = (typeof a === "number" && typeof b === "string") || (typeof a === "string" && typeof b === "number");
  return mixed && String(a) === String(b);
}

/** A finite number or a thrown error, which the runtime turns into null. */
export function finite(value: number): number {
  if (!Number.isFinite(value)) throw new Error("result is not a finite number");
  return value;
}

export function toNum(value: unknown): number | null {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value === "string" && value.trim() !== "") {
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

export type Agg = "sum" | "avg" | "count" | "min" | "max";

/** Aggregates the numbers read from rows; count counts rows. */
export function aggregate(rows: unknown[], field: string | undefined, how: Agg): number {
  if (how === "count") return rows.length;
  const values = rows.map((r) => toNum(read(r, field ?? ""))).filter((v): v is number => v !== null);
  if (!values.length) return 0;
  switch (how) {
    case "sum":
      return values.reduce((a, b) => a + b, 0);
    case "avg":
      return values.reduce((a, b) => a + b, 0) / values.length;
    case "min":
      return Math.min(...values);
    case "max":
      return Math.max(...values);
  }
}

/** Groups items by a key in first-seen order. */
export function groups(rows: unknown[], key: string): Map<string | number, unknown[]> {
  const out = new Map<string | number, unknown[]>();
  for (const row of rows) {
    const raw = read(row, key);
    const k = typeof raw === "number" ? raw : raw == null || raw === "" ? "Unknown" : String(raw);
    const bucket = out.get(k);
    if (bucket) bucket.push(row);
    else out.set(k, [row]);
  }
  return out;
}

export const MAX_ITEMS = 10000;
