import { test, expect } from "@playwright/test";
import { readFile } from "node:fs/promises";

test("light result keeps the needle, evidence and risk text readable", async ({ page }) => {
  const result = JSON.parse(await readFile("tests/fixtures/author-analysis.json", "utf8"));
  await page.goto("/");
  await page.evaluate(value => localStorage.setItem("wisechoice.history.v1", JSON.stringify([value])), result);
  await page.reload();
  await page.getByTestId("nav-analysis").filter({ visible: true }).first().click();
  await expect(page.getByTestId("analysis-summary")).toBeVisible();
  await page.getByTestId("theme-toggle").filter({ visible: true }).click();
  await expect(page.getByTestId("theme-toggle").filter({ visible: true })).toHaveAttribute("aria-pressed", "true");
  const contrast = await page.evaluate(() => {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 1;
    const context = canvas.getContext("2d")!;
    const luminance = (color: string) => {
      context.clearRect(0, 0, 1, 1); context.fillStyle = color; context.fillRect(0, 0, 1, 1);
      const rgb = [...context.getImageData(0, 0, 1, 1).data].slice(0, 3).map(value => {
        const channel = value / 255;
        return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
      });
      return 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
    };
    const background = getComputedStyle(document.querySelector('[data-testid="analysis-summary"] > div')!).backgroundColor;
    const bg = luminance(background);
    const selectors = ['[data-testid="analysis-summary"] h2', '[data-testid="analysis-evidence"] h3', '[data-testid="analysis-evidence"] blockquote', '[data-testid="idp-needle"] path'];
    return { bg, ratios: selectors.map(selector => {
      const element = document.querySelector(selector)!;
      const foreground = luminance(getComputedStyle(element)[element.tagName === "path" ? "fill" : "color"]);
      return (Math.max(foreground, bg) + 0.05) / (Math.min(foreground, bg) + 0.05);
    }) };
  });
  expect(contrast.bg).toBeGreaterThan(0.8);
  for (const ratio of contrast.ratios) expect(ratio).toBeGreaterThanOrEqual(4.5);
});

test("report keeps the actual price with the conclusion and identifies the selected calculation", async ({ page }) => {
  const result = JSON.parse(await readFile("tests/fixtures/author-analysis.json", "utf8"));
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/");
  await page.evaluate(value => localStorage.setItem("wisechoice.history.v1", JSON.stringify([value])), result);
  await page.reload();
  await page.getByTestId("nav-analysis").filter({ visible: true }).first().click();
  const summary = page.getByTestId("analysis-summary");
  await expect(page.getByTestId("analysis-date")).toHaveAttribute("datetime", result.createdAt);
  await expect(summary.getByTestId("course-price")).toContainText("45 000");
  await expect(summary.getByTestId("nav-radar")).toBeVisible();
  await expect(summary).toContainText(result.verdict.ru);
  await expect(summary.getByRole("heading", { name: "Перед оплатой", exact: true })).toBeVisible();
  const summaryText = await summary.textContent();
  expect(summaryText!.indexOf("Давление рекламы")).toBeLessThan(summaryText!.indexOf("Перед оплатой"));
  expect(summaryText!.indexOf("Перед оплатой")).toBeLessThan(summaryText!.indexOf("Цена из этой рекламы"));
  const summaryWidth = (await summary.boundingBox())!.width;
  const evidenceWidth = (await page.getByTestId("analysis-evidence").boundingBox())!.width;
  expect(evidenceWidth).toBeGreaterThanOrEqual(summaryWidth - 1);
  await expect(page.getByTestId("methodology-toggle")).toHaveAttribute("aria-expanded", "true");
  const cvf = page.getByTestId("method-tab-cvf");
  const imp = page.getByTestId("method-tab-imp");
  await expect(cvf).toHaveAttribute("aria-selected", "true");
  await imp.click();
  await expect(imp).toHaveAttribute("aria-selected", "true");
  await expect(cvf).toHaveAttribute("aria-selected", "false");
  await expect(page.getByRole("tabpanel")).toContainText("Маркетинговое давление");
  await expect(page.getByTestId("limitations-toggle")).toHaveAttribute("aria-expanded", "false");
  await expect(page.getByRole("tabpanel")).not.toContainText(result.verdict.ru);
  // Animate UI moves the active tab's surface onto its sliding indicator.
  const indicator = page.locator('[data-slot="tabs-indicator"]');
  await expect(indicator).toBeVisible();
  const activeSurface = await indicator.evaluate(element => ({ bottom: parseFloat(getComputedStyle(element).borderBottomWidth), top: parseFloat(getComputedStyle(element).borderTopWidth), radius: parseFloat(getComputedStyle(element).borderRadius), background: getComputedStyle(element).backgroundColor }));
  expect(activeSurface.bottom).toBeGreaterThanOrEqual(2);
  expect(activeSurface.top).toBe(0);
  expect(activeSurface.radius).toBe(0);
  expect(activeSurface.background).toBe("rgba(0, 0, 0, 0)");
  const section = await page.getByTestId("methodology-section").evaluate(element => ({ radius: parseFloat(getComputedStyle(element).borderRadius), background: getComputedStyle(element).backgroundColor }));
  expect(section.radius).toBe(0);
  expect(section.background).toBe("rgba(0, 0, 0, 0)");
  const selectedColor = await imp.evaluate(element => getComputedStyle(element).color);
  const inactiveColor = await cvf.evaluate(element => getComputedStyle(element).color);
  expect(selectedColor).not.toBe(inactiveColor);
});

test("result explains its quoted evidence before optional methodology on a phone", async ({ page }) => {
  const result = JSON.parse(await readFile("tests/fixtures/author-analysis.json", "utf8"));
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/");
  await page.evaluate(value => localStorage.setItem("wisechoice.history.v1", JSON.stringify([value])), result);
  await page.reload();
  await page.getByTestId("nav-analysis").filter({ visible: true }).first().click();
  const evidence = page.getByTestId("analysis-evidence");
  await expect(evidence).toBeVisible();
  await expect(evidence).toContainText(result.triggers[0].quote);
  await expect(evidence).toContainText("срок");
  const newCheck = page.getByRole("button", { name: "Новая проверка", exact: true });
  await expect(newCheck).toBeVisible();
  expect(Math.round((await newCheck.boundingBox())!.width)).toBeGreaterThanOrEqual(44);
  expect(Math.round((await newCheck.boundingBox())!.height)).toBeGreaterThanOrEqual(44);
  expect(Math.round((await page.getByTestId("idp-gauge").boundingBox())!.width)).toBeGreaterThanOrEqual(280);
  await expect(page.getByTestId("idp-segment")).toHaveCount(4);
  const colors = await page.getByTestId("idp-segment").evaluateAll(segments => segments.map(segment => segment.getAttribute("stroke")));
  expect(colors).toEqual(["#ef4444", "#f97316", "#eab308", "#22c55e"]);
  const tickSize = await page.getByTestId("idp-gauge").locator("svg text").first().evaluate(element => Number(element.getAttribute("font-size")) * (element as SVGGraphicsElement).getScreenCTM()!.a);
  expect(tickSize).toBeGreaterThanOrEqual(10);
  await expect(page.getByTestId("methodology-toggle")).toHaveAttribute("aria-expanded", "true");
  await page.getByTestId("methodology-toggle").click();
  await expect(page.getByRole("tab", { name: "CVF", exact: true })).not.toBeVisible();
  await page.getByTestId("methodology-toggle").click();
  await expect(page.getByRole("tab", { name: "CVF", exact: true })).toBeVisible();
  await page.getByRole("tab", { name: "Байес", exact: true }).click();
  await expect(page.getByTestId("bayes-chart").locator(".recharts-line-curve")).toBeVisible();
  await page.getByRole("tab", { name: "Байес", exact: true }).press("Home");
  await expect(page.getByRole("tab", { name: "CVF", exact: true })).toBeFocused();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

for (const width of [375, 768, 1024, 1256, 1440]) {
  test(`charts remain large and readable at ${width}px`, async ({ page }) => {
    const result = JSON.parse(await readFile("tests/fixtures/author-analysis.json", "utf8"));
    await page.setViewportSize({ width, height: 1000 });
    await page.goto("/");
    await page.evaluate(value => localStorage.setItem("wisechoice.history.v1", JSON.stringify([value])), result);
    await page.reload();
    await page.getByTestId("nav-analysis").filter({ visible: true }).first().click();
    const gauge = page.getByTestId("idp-gauge");
    await expect(gauge).toBeVisible();
    expect(Math.round((await gauge.boundingBox())!.width)).toBeGreaterThanOrEqual(width < 640 ? 280 : 360);
    const explanation = page.getByTestId("analysis-evidence").locator("article p").first();
    expect(await explanation.evaluate(element => parseFloat(getComputedStyle(element).fontSize))).toBeGreaterThanOrEqual(16);
    await expect(page.getByTestId("methodology-toggle")).toHaveAttribute("aria-expanded", "true");
    if (width >= 1024) {
      const cards = page.getByTestId("analysis-summary").locator(":scope > div");
      const gaugeCard = (await cards.nth(0).boundingBox())!;
      const verdictCard = (await cards.nth(1).boundingBox())!;
      expect(Math.abs(gaugeCard.y - verdictCard.y)).toBeLessThan(1);
      expect(verdictCard.x).toBeGreaterThan(gaugeCard.x + gaugeCard.width);
      const q = (await page.getByTestId("metric-qQuality").boundingBox())!;
      const r = (await page.getByTestId("metric-rRisk").boundingBox())!;
      expect(Math.abs(q.y - r.y)).toBeLessThan(1);
      expect(r.x).toBeGreaterThan(q.x + q.width);
    }
    for (const key of ["pPriceAnomaly", "aAltCost"]) {
      const unknown = page.getByTestId(`metric-${key}`);
      await expect(unknown.getByTestId("metric-bar")).toHaveCount(0);
      if (width >= 1024) expect((await unknown.boundingBox())!.height).toBeLessThanOrEqual(32);
    }
    const metric = page.getByTestId("metric-qQuality");
    expect(await metric.locator("span").first().evaluate(element => parseFloat(getComputedStyle(element).fontSize))).toBeGreaterThanOrEqual(14);
    expect((await metric.getByTestId("metric-bar").boundingBox())!.height).toBeGreaterThanOrEqual(10);
    await page.getByTestId("method-tab-imp").click();
    const ring = page.getByTestId("imp-ring");
    await expect(ring).toBeVisible();
    expect(await ring.locator("..").evaluate(element => parseFloat(getComputedStyle(element).marginTop))).toBeLessThanOrEqual(16);
    expect(Math.round((await ring.boundingBox())!.width)).toBeGreaterThanOrEqual(width < 640 ? 192 : 224);
    await page.getByTestId("method-tab-bayes").click();
    const chart = page.getByTestId("bayes-chart");
    await expect(chart).toBeVisible();
    expect(Math.round((await chart.boundingBox())!.height)).toBeGreaterThanOrEqual(width < 640 ? 280 : 360);
    await expect(chart).toContainText("До анализа");
    await expect(chart).toContainText("После анализа");
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
}

for (const reduced of [false, true]) {
  test(`meter ${reduced ? "respects reduced motion" : "sweeps its needle with the score"}`, async ({ page }, testInfo) => {
    const result = JSON.parse(await readFile("tests/fixtures/author-analysis.json", "utf8"));
    await page.emulateMedia({ reducedMotion: reduced ? "reduce" : "no-preference" });
    await page.goto("/");
    await page.evaluate(value => localStorage.setItem("wisechoice.history.v1", JSON.stringify([value])), result);
    await page.reload();
    await page.getByTestId("nav-history").filter({ visible: true }).click();
    await page.getByRole("button", { name: `Открыть результат: ${result.title.ru}`, exact: true }).click();
    const score = page.getByTestId("idp-score");
    const needle = page.getByTestId("idp-needle");
    await expect(score).toBeVisible();
    await expect(page.getByTestId("idp-gauge")).toHaveAttribute("data-reduced-motion", String(reduced));
    const initialScore = Number(await score.textContent());
    const initialTransform = await needle.getAttribute("transform");
    if (reduced) {
      expect(initialScore).toBe(result.idp);
    } else {
      expect(initialScore).toBeLessThan(result.idp);
      await expect.poll(async () => Number(await score.textContent())).toBeGreaterThan(initialScore);
      await expect.poll(() => needle.getAttribute("transform")).not.toBe(initialTransform);
      await page.getByTestId("idp-gauge").screenshot({ path: testInfo.outputPath("meter-intermediate.png") });
    }
    await expect(score).toHaveText(String(result.idp));
    await expect(needle).toHaveAttribute("transform", "rotate(-36 150 150)");
    const pivotOffset = await needle.evaluate(element => {
      const group = element as SVGGraphicsElement;
      const svg = group.ownerSVGElement!;
      const pivot = svg.querySelector("circle")!;
      const point = svg.createSVGPoint();
      point.x = 150; point.y = 150;
      const needleOrigin = point.matrixTransform(group.getCTM()!);
      const pivotOrigin = point.matrixTransform(pivot.getCTM()!);
      return Math.hypot(needleOrigin.x - pivotOrigin.x, needleOrigin.y - pivotOrigin.y);
    });
    expect(pivotOffset).toBeLessThan(0.5);
    await page.getByTestId("idp-gauge").screenshot({ path: testInfo.outputPath(`meter-${reduced ? "reduced" : "final"}.png`) });
  });
}

for (const width of [375, 768, 1256, 1440]) {
  for (const theme of ["dark", "light"]) {
    test(`pressure and evidence use a readable vertical flow at ${width}px in ${theme}`, async ({ page }) => {
      const result = JSON.parse(await readFile("tests/fixtures/income-analysis.json", "utf8"));
      await page.setViewportSize({ width, height: 1000 });
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto("/");
      await page.evaluate(value => localStorage.setItem("wisechoice.history.v1", JSON.stringify([value])), result);
      await page.reload();
      await page.getByTestId("nav-analysis").filter({ visible: true }).first().click();
      if (theme === "light") await page.getByTestId("theme-toggle").filter({ visible: true }).click();
      const evidence = page.getByTestId("analysis-evidence");
      const articles = evidence.locator("article");
      expect(result.triggers).toHaveLength(4);
      await expect(articles).toHaveCount(4);
      const list = articles.first().locator("..");
      const surface = await list.evaluate(element => ({ radius: parseFloat(getComputedStyle(element).borderRadius), background: getComputedStyle(element).backgroundColor, leftBorder: parseFloat(getComputedStyle(element).borderLeftWidth) }));
      expect(surface).toEqual({ radius: 0, background: "rgba(0, 0, 0, 0)", leftBorder: 0 });
      for (let index = 0; index < result.triggers.length; index++) {
        const article = articles.nth(index);
        await expect(article.locator("blockquote")).toBeVisible();
        await expect(article.locator("blockquote")).toHaveText(result.triggers[index].quote);
        expect(await article.locator("blockquote").evaluate(element => element.scrollWidth <= element.clientWidth)).toBe(true);
        expect(await article.locator("p").evaluate(element => element.scrollWidth <= element.clientWidth)).toBe(true);
        const title = (await article.locator("h3").boundingBox())!;
        const quote = (await article.locator("blockquote").boundingBox())!;
        if (width >= 768) {
          expect(Math.abs(title.y - quote.y)).toBeLessThan(2);
          expect(quote.x).toBeGreaterThan(title.x + title.width);
        } else {
          expect(quote.y).toBeGreaterThanOrEqual(title.y + title.height + 8);
        }
      }
      await page.getByTestId("method-tab-imp").click();
      await expect(page.getByTestId("imp-ring")).toBeVisible();
      const ring = (await page.getByTestId("imp-ring").boundingBox())!;
      const description = (await page.getByTestId("imp-description").boundingBox())!;
      expect(ring.width).toBeGreaterThanOrEqual(width < 640 ? 192 : 224);
      expect(description.y).toBeGreaterThanOrEqual(ring.y + ring.height + 12);
      expect(Math.abs(ring.x + ring.width / 2 - description.x - description.width / 2)).toBeLessThan(2);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    });
  }
}
