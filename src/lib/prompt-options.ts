import type { PromptOptions } from "@openuidev/react-lang";
import { demoToolSpecs } from "./demo-data";

/**
 * Prompt options that teach the model to answer with working tools: the page
 * holds its inputs and lists in $variables and computes with @functions, so
 * it works without sending anything back to the assistant.
 */

export const exampleShoppingList = `root = Card([title, stepper, list, copy])
$guests = 4
$got = []
title = Title("Pasta night for " + @Plural($guests, "guest"), "lg")
stepper = Row([IconButton("minus", @Set($guests, @Clamp($guests - 1, 1, 20)), "Fewer"), Text($guests + "", "lg", null, "semibold"), IconButton("plus", @Set($guests, @Clamp($guests + 1, 1, 20)), "More")], 3)
lines = @Each(base, "i", {name: i.name, qty: @Round(i.qty * $guests / 4) + i.unit})
list = Col(@Each(lines, "l", Pressable([Row([Icon(@Includes($got, l.name) ? "check-circle" : "circle", "sm"), Text(l.qty + " " + l.name, "sm", null, null, false, @Includes($got, l.name))], 2)], @Set($got, @Toggle($got, l.name)), @Includes($got, l.name), 2)), 1)
copy = Button("Copy list", @CopyToClipboard(@Join(@Each(lines, "l", l.qty + " " + l.name), "\\n")), "outline", null, "sm", "copy")
base = [{name: "spaghetti", qty: 400, unit: " g"}, {name: "tomatoes", qty: 6, unit: ""}, {name: "parmesan", qty: 80, unit: " g"}]`;

export const exampleBillSplitter = `root = Card([Title("Split the bill", "lg"), shares, add, Slider($tip, 0, 30, 1, "Tip", "%"), totalRow])
$people = ["You", "Alex"]
$orders = [{who: "You", amount: 24}, {who: "Alex", amount: 31}]
$name = ""
$spent = 0
$tip = 18
shares = Col(@Each($people, "p", Row([Text(p), Spacer(), Text(@Format(@Sum(@Filter($orders, "who", "==", p).amount) * (1 + $tip / 100), "currency")), IconButton("x", Action([@Set($people, @Remove($people, "", p)), @Set($orders, @Remove($orders, "who", p))]), "Remove " + p, "ghost")], 2)), 2)
add = Row([Input($name, null, "text", "Name"), Input($spent, null, "number", "Spent"), Button("Add", Action([@Set($people, @Append($people, $name)), @Set($orders, @Append($orders, {who: $name, amount: $spent})), @Reset($name, $spent)]), "outline", null, null, "plus", $name == "")], 2)
totalRow = Row([Text("Total with tip"), Spacer(), Title(@Format(@Sum($orders.amount) * (1 + $tip / 100), "currency"), "lg")])`;

export const exampleDashboard = `root = Col([head, kpis, Grid([weekly, byRegion], 2, 280, 4), top], 4)
$region = "All"
orders = Query("get_orders", {days: 90}, {rows: []})
rows = $region == "All" ? orders.rows : @Filter(orders.rows, "region", "==", $region)
head = Row([Title("Sales, last 90 days", "lg"), Spacer(), SegmentedControl($region, ["All", "North", "South", "East", "West"])], 3, null, null, true)
kpis = Grid([Card([Caption("Revenue"), Title(@Format(@Sum(rows.amount), "compact", 1, "USD"), "xl")]), Card([Caption("Orders"), Title(@Format(@Count(rows)), "xl")])], 2, 160, 3)
weekly = Card([Title("Revenue by week", "sm"), Chart("line", @Bucket(rows, "date", "week", "amount"), "key", ["value"], "currency")])
byRegion = Card([Title("By region", "sm"), Chart("donut", @GroupBy(orders.rows, "region", "amount"), "key", ["value"], "currency")])
top = Table(["Product", "Revenue"], @Each(@Top(@GroupBy(rows, "product", "amount"), "value", 5), "p", [p.key, @Format(p.value, "currency")]))`;

const rules = [
  "Answer with a working tool whenever the request involves numbers, choices, lists, steps, a game or something to explore: keep inputs and lists in $variables, compute everything shown from them with expressions and @functions, and change them with @Set. The page must work on its own, without another message.",
  "Use @ToAssistant only for a genuinely new request the page cannot compute (\"Plan another day\", \"Suggest recipes like this\"), never to calculate, filter, add, remove or reveal what the page already has.",
  "$variable defaults are literals, and may be lists or objects. Edit lists with @Append, @Remove, @RemoveAt and @Update; track selections with @Toggle and @Includes.",
  "Derive rows once in a statement with @Each(list, \"x\", {...}), then reuse them in @Each, Table, Chart, @Sum(rows.field) and @Join. @Each(@Range(0, n), \"i\", ...) builds a series or repeats a step.",
  "@Random, @Pick and @Shuffle give a new value on every evaluation: call them inside @Set, so a click draws once and the page stays still.",
  "Pick the medium that shows the idea: Chart for numbers across time or categories; Svg shapes that read $variables for mechanisms, geometry and diagrams; Map with MapMarker for places and routes; Image for real things (alt is a search phrase); Table for comparisons; HtmlView only for a game or animation that needs a loop.",
  "Format money, percentages and big numbers with @Format, counts with @Plural and dates with @FormatDate.",
  "Dates relative to now (today, this week, next month) start from @Today(), never a fixed date.",
];

/** The chat prompt: no tools, $variables and functions. */
export const promptOptions: PromptOptions = {
  bindings: true,
  additionalRules: rules,
  examples: [
    `Example 1: A guest stepper that rescales a shopping list, with a checklist and a copy button:\n\n${exampleShoppingList}`,
    `Example 2: A bill splitter that adds and removes people:\n\n${exampleBillSplitter}`,
  ],
};

/** For dashboards over the demo data tools: Query rows, shaped with the data functions. */
export const dashboardPromptOptions: PromptOptions = {
  ...promptOptions,
  tools: demoToolSpecs,
  toolExamples: [`Example 3: A live dashboard over Query rows:\n\n${exampleDashboard}`],
  additionalRules: [
    ...rules,
    "Fetch rows with Query and compute every number, group and series from them with @Sum, @Count, @GroupBy, @Bucket, @Top, @Stats and @Change. A filter is a $variable (from this library's Select or SegmentedControl) applied with @Filter; select dates and ranges with @Between, since @Filter's < and > compare numbers only.",
  ],
};
