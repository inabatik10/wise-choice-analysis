import { test, expect, type Locator } from "@playwright/test";
import { readFile } from "node:fs/promises";

async function contrastAgainstBody(locator: Locator, property = "color") {
  return locator.evaluate((element, property) => {
    const luminance = (color: string) => {
      const rgb = color.match(/[\d.]+/g)!.slice(0, 3).map(Number).map(value => value / 255).map(value => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4);
      return 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
    };
    const foreground = luminance(getComputedStyle(element).getPropertyValue(property));
    const background = luminance(getComputedStyle(document.body).backgroundColor);
    return (Math.max(foreground, background) + 0.05) / (Math.min(foreground, background) + 0.05);
  }, property);
}

test("theme switches colors and persists the chosen appearance", async ({ page }) => {
  await page.goto("/");
  const toggle = page.getByTestId("theme-toggle").filter({ visible: true });
  await expect(toggle).toHaveAttribute("aria-pressed", "false");
  await expect(toggle).toHaveAttribute("title", "Светлая тема");
  await expect(page.locator("body")).toHaveCSS("background-color", "rgb(10, 15, 26)");
  await toggle.click();
  await expect(toggle).toHaveAttribute("aria-pressed", "true");
  await expect(toggle).toHaveAttribute("title", "Тёмная тема");
  await expect(page.locator("body")).toHaveCSS("background-color", "rgb(246, 248, 251)");
  expect(await contrastAgainstBody(page.locator("body"))).toBeGreaterThan(7);
  expect(await page.evaluate(() => localStorage.getItem("wisechoice.theme"))).toBe("light");
  await page.reload();
  await expect(toggle).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator("html")).toHaveCSS("color-scheme", "light");
  await toggle.click();
  await expect(page.locator("body")).toHaveCSS("background-color", "rgb(10, 15, 26)");
  await expect(page.locator("html")).toHaveCSS("color-scheme", "dark");
});

test("light theme keeps the mobile menu and price comparison readable at 375px", async ({ page }) => {
  const result = JSON.parse(await readFile("tests/fixtures/author-analysis.json", "utf8"));
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/");
  await page.evaluate(value => localStorage.setItem("wisechoice.history.v1", JSON.stringify([value])), result);
  await page.reload();
  await page.getByTestId("theme-toggle").filter({ visible: true }).click();
  await page.getByTestId("menu-open").click();
  const menu = page.getByTestId("mobile-menu");
  await expect(menu).toBeVisible();
  await expect(menu.getByTestId("nav-history")).toBeVisible();
  expect(await contrastAgainstBody(menu.getByTestId("nav-history"))).toBeGreaterThan(4.5);
  await page.keyboard.press("Escape");
  await expect(menu).toBeHidden();
  await page.getByTestId("nav-analysis").filter({ visible: true }).click();
  await page.getByTestId("nav-radar").click();
  expect(await contrastAgainstBody(page.getByRole("heading", { level: 1 }))).toBeGreaterThan(7);
  await page.getByLabel("Название курса", { exact: true }).fill("Похожий курс");
  await page.getByLabel("Цена", { exact: true }).fill("30000");
  await page.getByRole("button", { name: "Добавить курс", exact: true }).click();
  await expect(page.getByTestId("radar-difference")).toHaveText("+50%");
  expect(await contrastAgainstBody(page.getByTestId("radar-median"))).toBeGreaterThan(4.5);
  const axisLabel = page.getByTestId("price-chart").locator("text.recharts-cartesian-axis-tick-value").first();
  await expect(axisLabel).toBeVisible();
  expect(await contrastAgainstBody(axisLabel, "fill")).toBeGreaterThan(4.5);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
