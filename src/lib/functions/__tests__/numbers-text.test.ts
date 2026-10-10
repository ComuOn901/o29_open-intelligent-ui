import { afterEach, describe, expect, it, vi } from "vitest";
import { value } from "./run";

afterEach(() => vi.restoreAllMocks());

const cases: Record<string, [string, unknown][]> = {
  Pow: [
    ["@Pow(2, 10)", 1024],
    ["@Pow(9, 0.5)", 3],
    ["@Pow(2, -1)", 0.5],
    ["@Pow(0, -1)", null],
    ["@Pow(-8, 1 / 3)", null],
    ['@Pow("2", 2)', null],
  ],
  Sqrt: [
    ["@Sqrt(9)", 3],
    ["@Sqrt(0)", 0],
    ["@Sqrt(-1)", null],
    ["@Sqrt(null)", null],
  ],
  Clamp: [
    ["@Clamp(5, 0, 3)", 3],
    ["@Clamp(-1, 0, 3)", 0],
    ["@Clamp(2, 0, 3)", 2],
    ["@Clamp(2, 3, 0)", 2],
    ["@Clamp(2, 0)", null],
  ],
  Percent: [
    ["@Percent(3, 4)", 75],
    ["@Percent(1, 0)", 0],
    ["@Percent(-1, 4)", -25],
    ["@Percent(1, null)", null],
  ],
  Allocate: [
    ["@Allocate(100, [1, 1, 1])", [33.34, 33.33, 33.33]],
    ["@Allocate(10, [1, 2, 1])", [2.5, 5, 2.5]],
    ["@Allocate(-1, [1, 1, 1])", [-0.34, -0.33, -0.33]],
    ["@Allocate(7, [1, 1], 0)", [4, 3]],
    ["@Allocate(5, [0, 0])", null],
    ["@Allocate(5, [1, -1])", null],
  ],
  MixColor: [
    ['@MixColor("#ffffff", "#000000", 0.5)', "#808080"],
    ['@MixColor("#fff", "#0285ff", 1)', "#0285ff"],
    ['@MixColor("#ff0000", "#0000ff", 2)', "#0000ff"],
    ['@MixColor("red", "#000000", 0.5)', null],
  ],
  Format: [
    ["@Format(12345.678)", "12,345.68"],
    ['@Format(12345.6, "number")', "12,345.6"],
    ['@Format(2.5, "number", 0)', "3"],
    ['@Format(1234.5, "currency")', "$1,234.50"],
    ['@Format(1234.5, "currency", 0, "EUR")', "€1,235"],
    ['@Format(1, "currency", 2, "nope")', "$1.00"],
    ['@Format(45, "percent")', "45%"],
    ['@Format(12.345, "percent", 1)', "12.3%"],
    ['@Format(1234567, "compact")', "1.2M"],
    ['@Format(1234567, "compact", null, "USD")', "$1.2M"],
    ['@Format(999, "compact")', "999"],
    ['@Format(-5, "currency")', "-$5.00"],
    ['@Format("12", "number")', null],
    ['@Format(1234.5, "money")', "1,234.5"],
  ],
  Join: [
    ['@Join(["a", "b"])', "a, b"],
    ['@Join(["a", "b"], " / ")', "a / b"],
    ['@Join([{n: "x"}, {n: "y"}], "\\n", "n")', "x\ny"],
    ['@Join(["a", null, "b"], "-")', "a-b"],
    ["@Join([1, 2.5])", "1, 2.5"],
    ["@Join([])", ""],
    ['@Join("ab")', null],
  ],
  Plural: [
    ['@Plural(1, "guest")', "1 guest"],
    ['@Plural(3, "guest")', "3 guests"],
    ['@Plural(0, "item")', "0 items"],
    ['@Plural(2, "person", "people")', "2 people"],
    ['@Plural(1500, "step")', "1,500 steps"],
    ['@Plural("2", "cat")', null],
  ],
  Pad: [
    ["@Pad(7, 2)", "07"],
    ['@Pad("5", 3, " ")', "  5"],
    ["@Pad(123, 2)", "123"],
    ["@Pad(7)", null],
  ],
};

describe.each(Object.entries(cases))("@%s", (_name, rows) => {
  it.each(rows)("%s", (expr, expected) => expect(value(expr)).toEqual(expected));
});

describe("@Random", () => {
  it("scales a draw into the range, swapping reversed bounds", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.5);
    expect(value("@Random(0, 10)")).toBe(5);
    expect(value("@Random(10, 0)")).toBe(5);
  });

  it("gives whole numbers with max included when integer is true", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.999);
    expect(value("@Random(1, 6, true)")).toBe(6);
    vi.spyOn(Math, "random").mockReturnValue(0);
    expect(value("@Random(1, 6, true)")).toBe(1);
  });

  it("is null without a whole number in range or with missing args", () => {
    expect(value("@Random(0.2, 0.8, true)")).toBeNull();
    expect(value("@Random(1)")).toBeNull();
  });
});
