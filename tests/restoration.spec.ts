import { test, expect } from "@playwright/test";
import { readFile } from "node:fs/promises";

test("original IDP needle, colored scale and calculation tabs use the saved result", async ({ page }) => {
  const result = JSON.parse(await readFile("tests/fixtures/real-analysis.json", "utf8"));
  await page.goto("/");
  await page.evaluate((value) => localStorage.setItem("wisechoice.history.v1", JSON.stringify([value])), result);
  await page.reload();
  await page.getByTestId("nav-analysis").filter({ visible: true }).click();
  await expect(page.getByTestId("idp-segment")).toHaveCount(4);
  await expect(page.getByTestId("idp-needle")).toBeVisible();
  await expect(page.getByTestId("idp-score")).toHaveText(String(result.idp));
  await expect(page.getByTestId("methodology-toggle")).toHaveAttribute("aria-expanded", "true");
  await expect(page.getByTestId("method-tab-cvf")).toHaveAttribute("aria-selected", "true");
  await expect(page.getByTestId("metric-qQuality")).toContainText(String(result.metrics.qQuality));
  await expect(page.getByTestId("metric-pPriceAnomaly")).toContainText("0*");
  await page.getByTestId("method-tab-imp").click();
  await expect(page.getByTestId("imp-ring")).toBeVisible();
  await expect(page.getByText(result.triggers[0].quote, { exact: true })).toBeVisible();
  await page.getByTestId("method-tab-bayes").click();
  await expect(page.getByTestId("bayes-panel")).toBeVisible();
  await page.getByTestId("method-tab-bayes").press("Home");
  await expect(page.getByTestId("method-tab-cvf")).toBeFocused();
  await page.setViewportSize({ width: 375, height: 812 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});
