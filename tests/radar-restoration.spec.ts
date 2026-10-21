import { test, expect } from "@playwright/test";
import { readFile } from "node:fs/promises";

test("restored price graph uses the actual course price and only same-currency comparisons", async ({ page }) => {
  const result = JSON.parse(await readFile("tests/fixtures/real-analysis.json", "utf8"));
  await page.goto("/");
  await page.evaluate((value) => {
    localStorage.setItem("wisechoice.history.v1", JSON.stringify([value]));
    localStorage.setItem("wisechoice.language", "en");
  }, result);
  await page.reload();
  await page.getByTestId("nav-analysis").filter({ visible: true }).click();
  await page.getByTestId("nav-radar").filter({ visible: true }).click();
  await expect(page.getByTestId("price-chart")).toHaveCount(0);
  await expect(page.getByTestId("comparison-empty")).toBeVisible();
  await expect(page.getByTestId("radar-course-price")).toContainText("45,000");
  await expect(page.getByTestId("radar-median")).toHaveCount(0);
  await expect(page.getByTestId("radar-comparison-count")).toHaveCount(0);

  await page.getByLabel("Course name", { exact: true }).fill("Comparable course");
  await page.getByLabel("Price", { exact: true }).fill("30000");
  await page.getByRole("button", { name: "Add course", exact: true }).click();
  await expect(page.getByTestId("comparison-empty")).toHaveCount(0);
  await expect(page.getByTestId("price-chart")).toBeVisible();
  await expect(page.getByTestId("radar-median")).toContainText("30,000");
  await expect(page.getByTestId("radar-difference")).toHaveText("+50%");
  await expect(page.getByTestId("price-chart").locator(".recharts-reference-line")).toHaveCount(2);
  await expect(page.getByTestId("price-chart").locator(".recharts-area-area")).toBeVisible();

  await page.getByLabel("Course name", { exact: true }).fill("Different currency");
  await page.getByLabel("Price", { exact: true }).fill("1");
  await page.getByLabel("Currency", { exact: true }).selectOption("USD");
  await page.getByRole("button", { name: "Add course", exact: true }).click();
  await expect(page.getByTestId("radar-comparison-count")).toHaveText("1");
  await expect(page.getByTestId("radar-median")).toContainText("30,000");
  await page.reload();
  await page.getByTestId("nav-analysis").filter({ visible: true }).click();
  await page.getByTestId("nav-radar").filter({ visible: true }).click();
  await expect(page.getByTestId("radar-difference")).toHaveText("+50%");
  await expect(page.getByTestId("radar-comparison-count")).toHaveText("1");
  await expect(page.getByRole("button", { name: "Remove from comparison: Different currency", exact: true })).toBeVisible();
  await page.setViewportSize({ width: 375, height: 812 });
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});
