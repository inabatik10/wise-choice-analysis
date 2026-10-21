import { navigateTo } from "./ui-helpers";
import { test, expect } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
import { resolve, join } from "node:path";
const out = resolve(process.env.TEST_ARTIFACTS_DIR ?? "test-results/live-smoke");
test("real screenshot to Gemini, result, translation, and reload", async ({
  page,
}) => {
  test.skip(
    process.env.LIVE_GEMINI !== "1",
    "Explicit live Gemini smoke run only",
  );
  test.setTimeout(180000);
  await mkdir(out, { recursive: true });
  await page.goto("/");
  await page.getByTestId("input-mode-image").click();
  await page.getByTestId("example-documented").click();
  await expect(page.getByTestId("selected-image")).toHaveAttribute("src", /^data:image\/png;base64,/);
  const responsePromise = page.waitForResponse("**/api/analyze");
  await page.getByTestId("analyze").click();
  const response = await responsePromise;
  if (response.ok()) await writeFile(join(out, "live-analysis.json"), JSON.stringify(await response.json(), null, 2));
  expect(response.ok(), JSON.stringify(await response.json())).toBe(true);
  await expect(page.getByTestId("idp-score")).toBeVisible({ timeout: 120000 });
  await expect.poll(async () => Number(await page.getByTestId("idp-score").textContent())).toBeGreaterThanOrEqual(58);
  await expect(page.getByTestId("course-price")).toContainText("45");
  await page.getByRole("button", { name: "Қазақша", exact: true }).click();
  await expect(page.locator("html")).toHaveAttribute("lang", "kk");
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.screenshot({
    path: out + "/wise-choice-final-live-desktop.png",
    fullPage: true,
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({
    path: out + "/wise-choice-final-live-mobile.png",
    fullPage: true,
  });
  await page.reload();
  await navigateTo(page, "history");
  await expect(page.getByTestId("empty-history")).toHaveCount(0);
  await navigateTo(page, "dashboard");
  await page.screenshot({
    path: out + "/wise-choice-final-home-mobile.png",
    fullPage: true,
  });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.screenshot({
    path: out + "/wise-choice-final-home-desktop.png",
    fullPage: true,
  });
});
