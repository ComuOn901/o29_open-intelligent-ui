// Screenshots of the dev gallery in light and dark at phone and desktop widths,
// with console errors, horizontal overflow and a few scripted interactions.
//
//   PLAYWRIGHT_CORE=/path/to/node_modules/playwright-core \
//   CHROME=/path/to/chrome-headless-shell \
//   node scripts/gallery-shots.mjs http://localhost:3000 ./shots
import { mkdirSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_CORE ?? "playwright-core");
const base = process.argv[2] ?? "http://localhost:3000";
const out = path.resolve(process.argv[3] ?? "shots");
mkdirSync(out, { recursive: true });

const browser = await chromium.launch(process.env.CHROME ? { executablePath: process.env.CHROME } : {});
const report = [];
// Keeps react-lang's dev-only OpenUI Inspect bubble out of the screenshots.
const hideInspector = () => { globalThis[Symbol.for("openui.devtools.autoMount")] = true; };
/** Scrolls through the page so lazy images load, then returns to the top. */
async function scrollThrough(page) {
  const height = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < height; y += 700) {
    await page.evaluate((top) => window.scrollTo(0, top), y);
    await page.waitForTimeout(120);
  }
  await page.evaluate(() => window.scrollTo(0, 0));
}

for (const theme of ["light", "dark"]) {
  for (const width of [390, 1280]) {
    // A tall viewport keeps long sections whole in element screenshots.
    const page = await browser.newPage({ viewport: { width, height: 1800 }, deviceScaleFactor: 2 });
    await page.addInitScript(hideInspector);
    const problems = [];
    page.on("console", (m) => { if (m.type() === "error" || m.type() === "warning") problems.push(`${m.type()}: ${m.text()}`); });
    page.on("pageerror", (e) => problems.push(`pageerror: ${e.message}`));
    await page.goto(`${base}/gallery?theme=${theme}`, { waitUntil: "networkidle", timeout: 120000 });
    await scrollThrough(page);
    // Map tiles, the street route and image searches settle in the background.
    await page.waitForTimeout(6000);

    const overflow = await page.evaluate(() => {
      const vw = document.documentElement.clientWidth;
      const wide = [...document.querySelectorAll(".gallery-preview *")]
        .filter((el) => { const r = el.getBoundingClientRect(); return r.width > 0 && r.right > vw + 1 && !el.closest(".iui-table-scroll, .iui-segmented, .maplibregl-map"); })
        .slice(0, 8)
        .map((el) => `${el.tagName.toLowerCase()}.${String(el.className).split(" ")[0]} right=${Math.round(el.getBoundingClientRect().right)}`);
      return { page: document.documentElement.scrollWidth > vw, elements: wide };
    });
    const parseErrors = await page.$$eval(".gallery-errors li", (els) => els.map((e) => e.textContent));
    const name = `${theme}-${width}`;
    await page.screenshot({ path: `${out}/${name}-full.png`, fullPage: true });
    for (const id of await page.$$eval(".gallery-example", (els) => els.map((e) => e.id))) {
      await page.locator(`#${id}`).screenshot({ path: `${out}/${name}-${id}.png` });
    }
    report.push({ name, overflow, parseErrors, problems });
    await page.close();
  }
}

// Interactions, once, in light at desktop width.
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
await page.addInitScript(hideInspector);
await page.goto(`${base}/gallery?theme=light`, { waitUntil: "networkidle", timeout: 120000 });
const text = (sel) => page.locator(sel).innerText();
const checks = {};
const total = "#gdp .iui-title-2xl";
checks.gdpBefore = await text(total);
const slider = page.locator("#gdp input[type=range]").first();
await slider.focus();
for (let i = 0; i < 20; i++) await page.keyboard.press("ArrowRight");
checks.gdpAfterSlider = await text(total);
await page.locator("#gdp button", { hasText: "Reset economy" }).click();
checks.gdpAfterReset = await text(total);
await page.locator("#segmented [role=radio]", { hasText: "Equally" }).click();
checks.segmentedShowsInput = await page.locator("#segmented input").count();
checks.packedBefore = await page.locator("#checklist p", { hasText: "packed" }).innerText();
await page.locator("#checklist label", { hasText: "Relaxed Oxford shirt" }).click();
checks.packedAfter = await page.locator("#checklist p", { hasText: "packed" }).innerText();
await page.locator("#pressable [role=button]", { hasText: "Kale" }).click();
checks.pressableSelected = await page.locator("#pressable [aria-pressed=true]").innerText();
checks.svgBefore = await page.locator("#svg svg text").first().textContent();
const crank = page.locator("#svg input[type=range]");
await crank.focus();
for (let i = 0; i < 6; i++) await page.keyboard.press("ArrowRight");
checks.svgAfter = await page.locator("#svg svg text").first().textContent();
await page.locator("#chart [role=radio]", { hasText: "line" }).click();
checks.chartLinePaths = await page.locator("#chart .iui-chart-plot path").count();
await page.locator("#inputs input").first().fill("Ada");
await page.locator("#inputs button", { hasText: "Customize my trip" }).click();
checks.formNotice = await page.locator(".gallery-notice").innerText().catch(() => null);
checks.mapPins = await page.locator("#map .iui-map-marker").count();
checks.mapRouteNote = await page.locator("#map .iui-map-status").innerText();
await page.locator(".gallery-notice button").click().catch(() => {});
await page.locator("#map .iui-map-marker", { hasText: "Coit Tower" }).dispatchEvent("click");
checks.mapSelected = await page.locator("#map .iui-card-soft").innerText();
await scrollThrough(page);
await page.waitForTimeout(3000);
checks.images = await page.$$eval("#images .iui-image", (els) => els.map((el) => (el.querySelector("img")?.getAttribute("src") ?? (el.querySelector("svg") ? "placeholder" : "pending")).slice(0, 80)));
const frame = page.frameLocator("#html iframe");
await frame.locator("#go").click();
await page.waitForTimeout(400);
checks.gameTimer = await frame.locator("#time").innerText();
checks.gameHeight = await page.locator("#html .iui-html-view").evaluate((el) => el.getBoundingClientRect().height);
await page.locator("#segmented").screenshot({ path: `${out}/interact-segmented.png` });
await page.locator("#checklist").screenshot({ path: `${out}/interact-checklist.png` });
await page.locator("#map").screenshot({ path: `${out}/interact-map.png` });
await page.locator("#html").screenshot({ path: `${out}/interact-game.png` });
report.push({ name: "interactions", checks });

await browser.close();
writeFileSync(`${out}/report.json`, JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
