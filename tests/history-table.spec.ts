import { navigateTo } from "./ui-helpers";
import { test, expect } from "@playwright/test";
import { readFile } from "node:fs/promises";

test("history keeps metrics in mobile rows and a desktop table", async ({ page }) => {
  const result = JSON.parse(await readFile("tests/fixtures/real-analysis.json", "utf8"));
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/");
  await page.evaluate(value => localStorage.setItem("wisechoice.history.v1", JSON.stringify([value])), result);
  await page.reload();
  await navigateTo(page, "history");
  const mobile = page.getByTestId("history-mobile");
  await expect(mobile).toBeVisible();
  for (const metric of ["CVF", "IMP", "IDP"]) await expect(mobile).toContainText(metric);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.setViewportSize({ width: 1440, height: 900 });
  const table = page.getByRole("table");
  await expect(table).toBeVisible();
  for (const metric of ["CVF", "IMP", "IDP"]) await expect(table.getByRole("columnheader", { name: metric, exact: true })).toBeVisible();
  await expect(table.getByRole("cell", { name: String(result.idp), exact: true })).toHaveCount(1);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await table.getByRole("button", { name: `Открыть результат: ${result.title.ru}`, exact: true }).click();
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await navigateTo(page, "history");
  await table.getByRole("button", { name: `Удалить проверку: ${result.title.ru}`, exact: true }).click();
  await page.reload();
  await navigateTo(page, "history");
  await expect(page.getByTestId("empty-history")).toBeVisible();
});
