// Hand-written OpenUI Lang 1.0 answers for six of the Intelligent UI example
// prompts and two dashboards, built only from the library and its @functions.
// They work in the page with $variables and @Set; nothing goes back to the
// assistant. The benchmark harness also uses them as fake model outputs, so
// this file has no runtime imports.

import type { Program } from "./programs";

/** example: the prompt id in the benchmark (the Intelligent UI example ids, or dash-*). */
export type ToolProgram = Program & { example: string; prompt: string };

const roast = `root = Col([head, dishes, planner, Grid([shopping, schedule], 2, 300, 5)], 5)
$guests = 6
$got = []
$done = []
head = Col([Title("Sunday roast with friends", "xl"), Text("Rosemary and garlic lamb, golden potatoes and all the good things on the side. The shopping list grows with your guest list.", "md", "muted")], 2)
dishes = Grid([d1, d2, d3], 3, 170, 3)
d1 = Col([Image("Lamb roast dinner", null, 1.4, "cover", "lg"), Text("Rosemary & garlic lamb", "sm", null, "semibold"), Caption("The centerpiece, with gravy and mint sauce")], 1)
d2 = Col([Image("Roast potato", null, 1.4, "cover", "lg"), Text("Extra-crispy potatoes", "sm", null, "semibold"), Caption("Fluffy inside, golden edges")], 1)
d3 = Col([Image("Apple crumble", null, 1.4, "cover", "lg"), Text("Bramley apple crumble", "sm", null, "semibold"), Caption("Warm, with custard or cream")], 1)
planner = Card([Row([Col([Text("Guests", "sm", null, "semibold"), Caption("Quantities follow the guest count")], 0), Spacer(), IconButton("minus", @Set($guests, @Clamp($guests - 1, 2, 16)), "Fewer guests"), Title($guests + "", "lg"), IconButton("plus", @Set($guests, @Clamp($guests + 1, 2, 16)), "More guests")], 3)], "soft", 4)
lines = @Each(ingredients, "i", {name: i.name, amount: i.unit == "kg" ? @Format(i.qty * $guests / 6, "number", 1) + " kg" : i.unit == "g" ? @Format(@Round(i.qty * $guests / 300) * 50) + " g" : @Ceil(i.qty * $guests / 6) + ""})
shopping = Card([Row([Title("Shopping list", "md"), Spacer(), Badge(@Count($got) + " of " + @Count(lines) + " in the basket", @Count($got) == @Count(lines) ? "success" : "neutral")], 2), Col(@Each(lines, "l", Pressable([Row([Icon(@Includes($got, l.name) ? "check-circle" : "circle", "sm", @Includes($got, l.name) ? "success" : "faint"), Text(l.name, "sm", null, null, false, @Includes($got, l.name)), Spacer(), Text(l.amount, "sm", "muted", "medium", false, false, true)], 2)], @Set($got, @Toggle($got, l.name)), @Includes($got, l.name), 2)), 1), Button("Copy shopping list", @CopyToClipboard("Sunday roast for " + $guests + "\\n" + @Join(@Each(lines, "l", "- " + l.amount + " " + l.name), "\\n")), "outline", null, "sm", "copy")], null, 4, 3)
schedule = Card([Row([Title("Cooking plan", "md"), Spacer(), Text(@Count($done) + " of " + @Count(steps) + " done", "sm", "muted")], 2), Col(@Each(steps, "s", Pressable([Row([Icon(@Includes($done, s.title) ? "check-circle" : "circle", "sm", @Includes($done, s.title) ? "success" : "faint"), Col([Text(s.time + " · " + s.title, "sm", null, "semibold", false, @Includes($done, s.title)), Caption(s.description)], 0)], 3, "start")], @Set($done, @Toggle($done, s.title)), @Includes($done, s.title), 2)), 1), Button("Start over", @Reset($done, $got), "ghost", null, "sm", "rotate-ccw")], null, 4, 3)
ingredients = [{name: "Bone-in leg of lamb", qty: 2.4, unit: "kg"}, {name: "Potatoes", qty: 1800, unit: "g"}, {name: "Carrots", qty: 9, unit: ""}, {name: "Parsnips", qty: 6, unit: ""}, {name: "Tenderstem broccoli", qty: 750, unit: "g"}, {name: "Apples for the crumble", qty: 5, unit: ""}, {name: "Bunches of rosemary", qty: 1, unit: ""}]
steps = [{time: "Saturday", title: "Get ahead", description: "Make the crumble, marinate the lamb and set the table."}, {time: "12:30 PM", title: "Lamb in", description: "200°C for 20 minutes, then 180°C for about 25 minutes per 500 g."}, {time: "1:15 PM", title: "Potatoes in", description: "Parboil, rough up the edges and roast in hot fat."}, {time: "2:30 PM", title: "Rest and carve", description: "Rest the lamb for 20 minutes while the vegetables finish."}, {time: "3:00 PM", title: "Serve", description: "The crumble goes in as you sit down."}]`;

const bill = `root = Card([head, people, addPerson, Divider(), itemsHead, items, addItem, Divider(), rates, summary], null, 5, 4)
$mode = "item"
$people = ["You", "Alex", "Sam", "Jordan"]
$items = [{name: "Burrata & sourdough", amount: 18, people: ["You", "Alex", "Sam", "Jordan"]}, {name: "Mains", amount: 96, people: ["You", "Alex", "Sam", "Jordan"]}, {name: "A bottle of red", amount: 42, people: ["You", "Alex", "Jordan"]}]
$name = ""
$itemName = ""
$itemAmount = null
$tax = 8.5
$tip = 20
head = Row([Col([Title("The check, please", "lg"), Text($mode == "item" ? "Tap names on an item to say who shared it." : "Everyone pays the same share.", "sm", "muted")], 1), Spacer(), SegmentedControl($mode, [{value: "item", label: "By item"}, {value: "equal", label: "Equally"}])], 3, null, null, true)
people = Row(@Each($people, "p", Button(p, Action([@Set($people, @Remove($people, "", p)), @Set($items, @Each($items, "it", {name: it.name, amount: it.amount, people: @Remove(it.people, "", p)}))]), "soft", null, "sm", "x")), 2, null, null, true)
addPerson = Row([Input($name, null, "text", "Add a person"), Button("Add", Action([@Set($people, @Append($people, $name)), @Set($items, @Each($items, "it", {name: it.name, amount: it.amount, people: @Append(it.people, $name)})), @Reset($name)]), "outline", null, null, "user-plus", $name == "" || @Includes($people, $name))], 2)
itemsHead = Row([Title("Items", "md"), Spacer(), Text(@Format(subtotal, "currency"), "sm", "muted", "medium", false, false, true)])
items = Col(@Each($items, "it", Card([Row([Text(it.name, "sm", null, "semibold"), Spacer(), Text(@Format(it.amount, "currency"), "sm", null, "medium", false, false, true), IconButton("trash-2", @Set($items, @Remove($items, "name", it.name)), "Remove " + it.name, "ghost")], 2), $mode == "item" ? Row(@Each($people, "p", Button(p, @Set($items, @Update($items, "name", it.name, "people", @Toggle(it.people, p))), @Includes(it.people, p) ? "solid" : "outline", null, "sm", @Includes(it.people, p) ? "check" : null)), 1, null, null, true) : null], null, 3, 2)), 2)
addItem = Row([Input($itemName, null, "text", "Item"), Input($itemAmount, null, "number", "Price"), Button("Add item", Action([@Set($items, @Append($items, {name: $itemName, amount: $itemAmount, people: $people})), @Reset($itemName, $itemAmount)]), "outline", null, null, "plus", $itemName == "" || $itemAmount <= 0)], 2)
rates = Grid([Slider($tax, 0, 15, 0.5, "Tax", "%"), Slider($tip, 0, 30, 1, "Tip", "%")], 2, 220, 6)
subtotal = @Sum($items.amount)
factor = 1 + ($tax + $tip) / 100
unassigned = $mode == "equal" ? 0 : @Sum(@Each($items, "it", @Count(it.people) == 0 ? it.amount : 0))
shares = @Each($people, "p", {name: p, amount: factor * ($mode == "equal" ? subtotal / @Max([@Count($people), 1]) : @Sum(@Each($items, "it", @Includes(it.people, p) ? it.amount / @Count(it.people) : 0)))})
summary = Card([Col(@Each(shares, "s", Row([Text(s.name), Spacer(), Text(@Format(s.amount, "currency"), null, null, "semibold", false, false, true)])), 2), Divider(), Row([Text("Total with tax and tip", "sm", "muted"), Spacer(), Title(@Format(subtotal * factor, "currency"), "lg")]), unassigned > 0 ? Text(@Format(unassigned, "currency") + " is not assigned to anyone yet.", "xs", "warning") : null, Button("Copy the split", @CopyToClipboard(@Join(@Each(shares, "s", s.name + ": " + @Format(s.amount, "currency")), "\\n")), "solid", null, "sm", "copy")], "soft", 4, 3)`;

const monty = `root = Card([head, doors, status, actions, record, sim], null, 5, 4)
$choice = -1
$opened = -1
$final = -1
$prize = 0
$switched = 0
$switchWins = 0
$stayed = 0
$stayWins = 0
$simStay = 0
$simGames = 0
head = Col([Title("Should you switch doors?", "lg"), Text("One car. Two goats. A surprisingly good reason to switch.", "sm", "muted")], 1)
doors = Grid(@Each(@Range(0, 3), "d", Pressable([Col([Text("Door " + (d + 1), "sm", "muted", "medium"), Title(d == $opened || $final >= 0 ? (d == $prize ? "🚗" : "🐐") : "🚪", "3xl"), Text(d == $choice ? "Your pick" : d == $opened ? "Opened by the host" : "Closed", "xs", d == $choice ? "info" : "muted", "medium")], 1, "center")], $choice < 0 ? Action([@Set($choice, d), @Set($prize, @Random(0, 2, true)), @Set($opened, $prize == d ? (d + 1 + @Random(0, 1, true)) % 3 : 3 - d - $prize)]) : null, d == $choice, 5, d == $opened || $final >= 0 ? "surface" : "warning", "lg")), 3, null, 3)
status = Box([Title($final >= 0 ? ($final == $prize ? "You found the car!" : "A goat this time.") : $choice >= 0 ? "Door " + ($opened + 1) + " has a goat." : "Start by choosing a door.", "md"), Text($final >= 0 ? "Switching wins whenever your first pick was a goat: 2 out of 3 times." : $choice >= 0 ? "Your door still has a 1 in 3 chance. The other closed door has 2 in 3. Switch or stay?" : "The host knows where the car is and will open another door with a goat behind it.", "sm", "muted")], null, 1, 4, "info", "lg")
actions = Row([$choice >= 0 && $final < 0 ? Button("Switch doors", Action([@Set($final, 3 - $choice - $opened), @Set($switched, $switched + 1), @Set($switchWins, $switchWins + ($final == $prize ? 1 : 0))]), "solid", null, null, "shuffle") : null, $choice >= 0 && $final < 0 ? Button("Keep my door", Action([@Set($final, $choice), @Set($stayed, $stayed + 1), @Set($stayWins, $stayWins + ($final == $prize ? 1 : 0))]), "outline") : null, $final >= 0 ? Button("Play again", @Reset($choice, $opened, $final), "solid", null, null, "rotate-ccw") : null, Button("Simulate 1,000 games", Action([@Set($simStay, $simStay + @Count(@Filter(@Each(@Range(0, 1000), "g", @Random(0, 2, true) == @Random(0, 2, true)), "", "==", true))), @Set($simGames, $simGames + 1000)]), "ghost", null, null, "dices")], 2, null, null, true)
record = $switched + $stayed > 0 ? Text("Your games: switched " + @Plural($switched, "time") + " and won " + $switchWins + "; stayed " + @Plural($stayed, "time") + " and won " + $stayWins + ".", "sm", "muted") : null
sim = $simGames > 0 ? Card([Row([Title("Simulated games", "sm"), Spacer(), Caption(@Format($simGames) + " games")]), Chart("bar", [{strategy: "Stay", wins: @Percent($simStay, $simGames)}, {strategy: "Switch", wins: 100 - @Percent($simStay, $simGames)}], "strategy", ["wins"], "percent", null, false, 160)], "soft", 4, 2) : null`;

const savings = `root = Card([head, kpis, chart, milestone, controls, Text("Assumes monthly compounding and contributions at the end of each month. Returns are not guaranteed; this is an illustration, not advice.", "xs", "muted")], null, 5, 4)
$initial = 10000
$monthly = 500
$years = 30
$rate = 5
head = Row([Col([Title("Retirement savings", "lg"), Text("Turn today's contributions into a picture of tomorrow.", "sm", "muted")], 1), Spacer(), Button("Reset", @Reset($initial, $monthly, $years, $rate), "ghost", null, "sm", "rotate-ccw")], 3, "start")
rows = @Each(@Range(0, $years + 1), "y", {year: "Year " + y, Contributions: $initial + $monthly * 12 * y, Balance: $rate == 0 ? $initial + $monthly * 12 * y : $initial * @Pow(1 + $rate / 1200, 12 * y) + $monthly * (@Pow(1 + $rate / 1200, 12 * y) - 1) / ($rate / 1200)})
final = @Last(rows)
million = @First(@Filter(rows, "Balance", ">=", 1000000))
kpis = Grid([k1, k2, k3], 3, 150, 3)
k1 = Card([Caption("Balance in " + @Plural($years, "year")), Title(@Format(final.Balance, "currency", 0), "xl")], "soft", 3, 1)
k2 = Card([Caption("You put in"), Title(@Format(final.Contributions, "currency", 0), "xl")], "soft", 3, 1)
k3 = Card([Caption("Growth"), Title(@Format(final.Balance - final.Contributions, "currency", 0), "xl", "success")], "soft", 3, 1)
chart = Chart("area", rows, "year", ["Contributions", "Balance"], "currency")
milestone = Row([Icon(million == null ? "hourglass" : "party-popper", "sm", million == null ? "muted" : "success"), Text(million == null ? "At this pace the balance stays under $1 million." : "You pass **$1 million** in " + million.year + ", " + @Format(@Percent(million.Balance - million.Contributions, million.Balance), "percent", 0) + " of it from growth.", "sm")], 2)
controls = Grid([Slider($initial, 0, 200000, 1000, "Starting balance", "$"), Slider($monthly, 0, 5000, 50, "Monthly contribution", "$"), Slider($years, 1, 50, 1, "Years", " yrs"), Slider($rate, 0, 12, 0.5, "Annual return", "%")], 2, 240, 6)`;

const gdp = `root = Card([head, Caption("Total output"), total, bar, legend, note, sliders, Row([Button("Reset economy", @Reset($c, $i, $g, $x), "ghost", null, "sm", "rotate-ccw"), Spacer(), Badge("GDP = C + I + G + (X − M)", "purple")], 2, null, null, true), Text("GDP counts the value of final goods and services produced within a country. Imports are subtracted because they were produced elsewhere.", "sm", "muted"), quiz], null, 5, 4)
$c = 600
$i = 200
$g = 170
$x = 30
$answer = ""
gdp = $c + $i + $g + $x
parts = [{label: "Consumer spending", value: $c, color: "chart1"}, {label: "Business investment", value: $i, color: "chart2"}, {label: "Government spending", value: $g, color: "chart4"}, {label: "Net exports", value: $x, color: "chart3"}]
head = Row([Col([Title("What makes up GDP?", "lg"), Text("An economy, in four parts.", "sm", "muted")], 1), Spacer(), Badge("Illustrative economy")], 3, "start")
total = Title("$" + @Format(gdp / 1000, "number", 2) + " trillion", "2xl")
bar = Box(@Each(parts, "p", Box([p.value >= 80 ? Text("$" + p.value + "B", "xs", "#ffffff", "medium") : null], null, null, null, p.color, 0, null, null, "100%", @Max([p.value, 0]), "center", "center")), "row", 0.5, null, null, "md", null, "100%", 38)
legend = Grid(@Each(parts, "p", Row([Box([], null, null, null, p.color, "full", null, 10, 10), Text(p.label, "sm"), Spacer(), Text((p.value < 0 ? "-$" : "$") + @Format(@Abs(p.value)) + "B", "sm", "muted", "medium", false, false, true)], 2)), 2, 220, 2)
note = $x < 0 ? Text("Positive contributions add up to $" + ($c + $i + $g) + "B. Net imports subtract $" + @Abs($x) + "B, leaving $" + gdp + "B of output.", "sm", "warning") : null
sliders = Grid([Slider($c, 0, 1200, 10, "Consumer spending, $ billions"), Slider($i, 0, 600, 10, "Business investment, $ billions"), Slider($g, 0, 500, 10, "Government spending, $ billions"), Slider($x, -200, 300, 10, "Net exports, $ billions")], 2, 240, 6)
quiz = Card([RadioGroup($answer, [{value: "a", label: "Real GDP increases by 10%"}, {value: "b", label: "Nominal GDP rises; real GDP is unchanged"}, {value: "c", label: "Both measures stay the same"}], "The same goods cost 10% more this year. What changes?"), $answer == "" ? null : Text(($answer == "b" ? "**Correct.** " : "**Not quite.** ") + "Real GDP adjusts for price changes, so higher prices alone raise nominal GDP but not real output.", "sm")], "soft", 4, 2)`;

const clt = `root = Card([head, SegmentedControl($dist, ["Skewed", "Uniform", "Bimodal"]), Grid([popCard, meanCard], 2, 260, 4), Slider($n, 1, 50, 1, "Values per sample"), buttons, stats, Text("As the sample size grows, the averages of samples pile up in a bell shape around the population mean, even when the population itself is skewed.", "sm", "muted"), quiz], null, 5, 4)
$dist = "Skewed"
$n = 5
$means = []
$answer = ""
head = Col([Title("The central limit theorem", "lg"), Text("Different populations. The same bell-shaped pattern.", "sm", "muted")], 1)
pop = @Each(@Range(0.0025, 1, 0.005), "u", $dist == "Skewed" ? @Pow(u, 3) : $dist == "Uniform" ? u : (u < 0.5 ? 0.05 + 0.4 * u : 0.55 + 0.4 * u))
current = @Filter(@Filter($means, "dist", "==", $dist), "n", "==", $n).mean
draw = @Each(@Range(0, 100), "s", {dist: $dist, n: $n, mean: @Avg(@Each(@Each(@Range(0, $n), "k", @Random(0, 1)), "u", $dist == "Skewed" ? @Pow(u, 3) : $dist == "Uniform" ? u : (u < 0.5 ? 0.05 + 0.4 * u : 0.55 + 0.4 * u)))})
popCard = Col([Title("Population", "sm"), Caption("The values we draw from"), Chart("bar", @Histogram(pop, 20, 0, 1), "key", ["value"], null, null, false, 150)], 1)
meanCard = Col([Title("Sample means", "sm"), Caption("The average of each sample of " + $n), @Count(current) == 0 ? Box([Text("Draw samples to see the pattern", "sm", "muted")], null, null, 6, "surface", "lg", true, "100%", 150, null, "center", "center") : Chart("bar", @Histogram(current, 20, 0, 1), "key", ["value"], null, null, false, 150)], 1)
buttons = Row([Button("Draw 100 samples", @Set($means, @Take(@Concat($means, draw), -6000)), "solid", null, null, "dices"), Button("Draw 500", Action([@Set($means, @Take(@Concat($means, draw), -6000)), @Set($means, @Take(@Concat($means, draw), -6000)), @Set($means, @Take(@Concat($means, draw), -6000)), @Set($means, @Take(@Concat($means, draw), -6000)), @Set($means, @Take(@Concat($means, draw), -6000))]), "outline"), Button("Reset", @Reset($means), "ghost", null, null, "rotate-ccw")], 2, null, null, true)
stats = Grid([s1, s2, s3], 3, 140, 3)
s1 = Card([Caption("Samples"), Title(@Format(@Count(current)), "xl")], "soft", 3, 1)
s2 = Card([Caption("Mean of the means"), Title(@Count(current) == 0 ? "-" : @Format(@Stats(current).mean, "number", 3), "xl"), Caption("Population: " + @Format(@Stats(pop).mean, "number", 3))], "soft", 3, 1)
s3 = Card([Caption("Spread of the means"), Title(@Count(current) == 0 ? "-" : @Format(@Stats(current).stdev, "number", 3), "xl"), Caption("Theory, σ/√n: " + @Format(@Stats(pop).stdev / @Sqrt($n), "number", 3))], "soft", 3, 1)
quiz = Card([RadioGroup($answer, [{value: "a", label: "The population becomes normal"}, {value: "b", label: "The sample means form a narrower bell shape"}, {value: "c", label: "Every mean becomes exactly the same"}], "What changes when the sample size grows?"), $answer == "" ? null : Text(($answer == "b" ? "**Correct.** " : "**Not quite.** ") + "The population stays the same. The means become more normal and their spread shrinks like 1/√n.", "sm")], "soft", 4, 2)`;

const sales = `root = Col([head, kpis, Grid([trend, mix], 2, 300, 4), Grid([regions, top], 2, 300, 4)], 4)
$days = "90"
$channel = "All"
$view = "Weekly"
orders = Query("get_orders", {days: $days}, {rows: []}, 300)
rows = $channel == "All" ? orders.rows : @Filter(orders.rows, "channel", "==", $channel)
weekly = @Bucket(rows, "date", "week", "amount")
daily = @Bucket(rows, "date", "day", "amount")
last7 = @Sum(@Take(daily, -7).value)
prev7 = @Sum(@Slice(daily, -14, -7).value)
change = @Change(last7, prev7)
head = Row([Col([Title("Store performance", "lg"), Caption("Demo data, refreshed every 5 minutes")], 1), Spacer(), Box([Select($channel, [{value: "All", label: "All channels"}, "Web", "Mobile", "Retail"])], null, null, null, null, null, null, 150), SegmentedControl($days, [{value: "30", label: "30d"}, {value: "90", label: "90d"}, {value: "365", label: "1y"}])], 3, null, null, true)
kpis = Grid([k1, k2, k3, k4], 4, 150, 3)
k1 = Card([Caption("Revenue"), Title(@Format(@Sum(rows.amount), "compact", 1, "USD"), "xl")], null, 3, 1)
k2 = Card([Caption("Orders"), Title(@Format(@Count(rows)), "xl")], null, 3, 1)
k3 = Card([Caption("Average order"), Title(@Format(@Avg(rows.amount), "currency"), "xl")], null, 3, 1)
k4 = Card([Caption("Last 7 days"), Row([Title(@Format(last7, "compact", 1, "USD"), "xl"), change == null ? null : Badge((change >= 0 ? "+" : "") + @Format(change, "percent", 1) + " vs prior 7", change >= 0 ? "success" : "danger")], 2, null, null, true)], null, 3, 1)
trend = Card([Row([Title("Revenue", "sm"), Spacer(), SegmentedControl($view, ["Weekly", "Cumulative"])], 2), Chart("area", $view == "Weekly" ? weekly : @Cumulative(weekly, "value"), "key", ["value"], "currency")], null, 4, 2)
mix = Card([Title("Channel mix", "sm"), Chart("donut", @GroupBy(orders.rows, "channel", "amount"), "key", ["value"], "currency")], null, 4, 2)
regions = Card([Title("Revenue by region and category", "sm"), Chart("bar", @Pivot(rows, "region", "category", "amount"), "key", null, "currency", null, true)], null, 4, 2)
top = Card([Title("Top products", "sm"), Table(["Product", "Units", "Revenue"], @Each(@Top(@GroupBy(rows, "product", "amount"), "value", 5), "p", [p.key, @Sum(@Filter(rows, "product", "==", p.key).units), @Format(p.value, "currency", 0)]))], null, 4, 2)`;

const support = `root = Col([head, kpis, Grid([weekly, teams], 2, 300, 4), Grid([spread, csat], 2, 300, 4), queue], 4)
$days = "60"
$team = "All"
tickets = Query("get_tickets", {days: $days}, {rows: []})
rows = $team == "All" ? tickets.rows : @Filter(tickets.rows, "team", "==", $team)
solved = @Filter(rows, "status", "==", "solved")
waiting = @Filter(rows, "status", "!=", "solved")
hours = @Stats(solved.hours)
weeks = @Each(@Bucket(rows, "opened", "week"), "w", {week: @FormatDate(w.key, "short"), Opened: w.value, Solved: @Count(@Between(solved, "opened", w.key, @AddDays(w.key, 6)))})
head = Row([Col([Title("Support desk", "lg"), Caption("Tickets opened in the selected period")], 1), Spacer(), Box([Select($team, [{value: "All", label: "All teams"}, "Billing", "Technical", "Accounts", "Shipping"])], null, null, null, null, null, null, 150), SegmentedControl($days, [{value: "30", label: "30d"}, {value: "60", label: "60d"}, {value: "180", label: "6m"}])], 3, null, null, true)
kpis = Grid([k1, k2, k3, k4], 4, 150, 3)
k1 = Card([Caption("Opened"), Title(@Format(@Count(rows)), "xl")], null, 3, 1)
k2 = Card([Caption("Waiting"), Title(@Format(@Count(waiting)), "xl", @Count(waiting) > 40 ? "danger" : null), Caption(@Count(@Filter(waiting, "priority", "==", "urgent")) + " urgent")], null, 3, 1)
k3 = Card([Caption("Median time to solve"), Title(@Format(hours.median, "number", 1) + " h", "xl"), Caption("Slowest " + @Format(hours.max, "number", 0) + " h")], null, 3, 1)
k4 = Card([Caption("Satisfaction"), Title(@Format(@Avg(@Filter(solved, "csat", ">", 0).csat), "number", 2) + " / 5", "xl")], null, 3, 1)
weekly = Card([Title("Opened and solved by week", "sm"), Chart("bar", weeks, "week", ["Opened", "Solved"])], null, 4, 2)
teams = Card([Title("Average hours to solve, by team", "sm"), Chart("bar", @Sort(@GroupBy(solved, "team", "hours", "avg"), "value", "desc"), "key", ["value"])], null, 4, 2)
spread = Card([Title("How long tickets take (hours)", "sm"), Chart("bar", @Histogram(solved.hours, 12), "key", ["value"])], null, 4, 2)
csat = Card([Title("Satisfaction, 7-day average", "sm"), Chart("line", @MovingAvg(@Bucket(@Filter(solved, "csat", ">", 0), "opened", "day", "csat", "avg"), "value", 7), "key", ["value"])], null, 4, 2)
queue = Card([Title("Waiting longest", "sm"), Table(["Ticket", "Team", "Priority", "Waiting"], @Each(@Top(@Each(waiting, "t", {id: t.id, team: t.team, priority: t.priority, age: @DaysBetween(t.opened, @Now())}), "age", 6), "t", [t.id, t.team, Badge(t.priority, t.priority == "urgent" ? "danger" : t.priority == "high" ? "warning" : "neutral"), @Plural(t.age, "day")]))], null, 4, 2)`;

export const toolPrograms: ToolProgram[] = [
  {
    id: "recipe",
    example: "recipe",
    title: "Sunday roast",
    prompt: "Plan a Sunday roast for friends, with a shopping list",
    note: "A guest stepper rescales the shopping list (@Each, @Clamp, @Format); tick items and steps with @Toggle; @CopyToClipboard with @Join.",
    code: roast,
  },
  {
    id: "bill",
    example: "bill",
    title: "Split the bill",
    prompt: "Make a bill splitter for dinner with friends",
    note: "Add and remove people and items (@Append, @Remove); who shared what with @Update and @Toggle; tax, tip and per-person shares; copy the split.",
    code: bill,
  },
  {
    id: "monty",
    example: "monty",
    title: "The Monty Hall problem",
    prompt: "Explain the Monty Hall problem with an interactive game",
    note: "Pick a door: @Random inside @Set hides the car and opens a goat door. Switch or stay, and simulate 1,000 games with @Range and @Each.",
    code: monty,
  },
  {
    id: "savings",
    example: "savings",
    title: "Retirement savings",
    prompt: "Help me explore how my retirement savings could grow",
    note: "@Each over @Range builds the yearly balance with @Pow; four sliders drive the chart, the totals and the $1 million milestone.",
    code: savings,
  },
  {
    id: "gdp-explained",
    example: "gdp",
    title: "GDP, explained",
    prompt: "How does GDP work? Let me explore an economy",
    note: "Four sliders; the bar and legend come from one parts list with @Each; negative net exports explain themselves; a knowledge check.",
    code: gdp,
  },
  {
    id: "clt",
    example: "clt",
    title: "Central limit theorem",
    prompt: "Help me understand the central limit theorem intuitively",
    note: "Draw samples with @Random inside @Set; @Histogram and @Stats show the means narrowing like 1/√n for three populations.",
    code: clt,
  },
  {
    id: "dash-sales",
    example: "dash-sales",
    title: "Sales dashboard",
    prompt: "Build a live sales dashboard for the last 90 days: revenue, orders, average order value, revenue by week and by region, and the top products.",
    note: "Query(get_orders) with channel and period filters; @Bucket, @Cumulative, @Change, @GroupBy, @Pivot and @Top.",
    code: sales,
  },
  {
    id: "dash-support",
    example: "dash-support",
    title: "Support dashboard",
    prompt: "Make a support dashboard: open tickets, median resolution time, tickets by week, the slowest teams and satisfaction.",
    note: "Query(get_tickets); weekly opened vs solved with @Bucket and @Between; @Stats, @Histogram, @MovingAvg; the oldest waiting tickets.",
    code: support,
  },
];
