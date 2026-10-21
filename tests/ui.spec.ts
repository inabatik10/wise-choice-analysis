import { navigateTo } from "./ui-helpers";
import { test, expect } from "@playwright/test";

test("language changes every screen and survives reload", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "English", exact: true }).click();
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "course ad",
  );
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await page.getByRole("button", { name: "Қазақша", exact: true }).click();
  await expect(page.locator("html")).toHaveAttribute("lang", "kk");
  await page.getByRole("button", { name: "Русский", exact: true }).click();
  await expect(page.locator("html")).toHaveAttribute("lang", "ru");
});

test("mobile layout, empty history and no demo scores", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/");
  await expect(page.getByTestId("analyze")).toBeDisabled();
  await navigateTo(page, "history");
  await expect(page.getByTestId("empty-history")).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await expect(page.getByTestId("nav-radar")).toHaveCount(0);
  await navigateTo(page, "dashboard");
  await expect(page.getByTestId("offer-text")).toBeVisible();
});

test("API failure is visible and never creates a synthetic analysis", async ({
  page,
}) => {
  // Deterministic failure of the external AI service, no fabricated success.
  await page.route("**/api/analyze", (route) =>
    route.fulfill({
      status: 503,
      contentType: "application/json",
      body: JSON.stringify({
        error: { code: "UPSTREAM_ERROR", message: "Unavailable" },
      }),
    }),
  );
  await page.goto("/");
  await page
    .getByTestId("offer-text")
    .fill("Test course with assignments and a clear programme, 15000 KZT.");
  await page.getByTestId("analyze").click();
  await expect(
    page.getByRole("alert").filter({ hasText: "Gemini" }),
  ).toBeVisible();
  await expect(page.getByTestId("idp-score")).toHaveCount(0);
  await navigateTo(page, "history");
  await expect(page.getByTestId("empty-history")).toBeVisible();
});

test("real saved result survives reload, switches language, and feeds price comparison", async ({
  page,
}) => {
  const fs = await import("node:fs/promises");
  const result = JSON.parse(
    await fs.readFile("tests/fixtures/real-analysis.json", "utf8"),
  );
  await page.goto("/");
  await page.evaluate(
    (value) =>
      localStorage.setItem("wisechoice.history.v1", JSON.stringify([value])),
    result,
  );
  await page.reload();
  await navigateTo(page, "history");
  await page
    .getByRole("button", {
      name: `Открыть результат: ${result.title.ru}`,
      exact: true,
    })
    .click();
  await expect(page.getByTestId("idp-score")).toHaveText(
    String(result.idp),
  );
  await page.getByRole("button", { name: "English", exact: true }).click();
  await expect(
    page.getByText(result.verdict.en, { exact: true }),
  ).toBeVisible();
  await page.getByTestId("nav-radar").filter({ visible: true }).click();
  await page
    .getByLabel("Course name", { exact: true })
    .fill("Comparable course");
  await page.getByLabel("Price", { exact: true }).fill("30000");
  await page.getByRole("button", { name: "Add course", exact: true }).click();
  await expect(page.getByText(/\+50%/)).toBeVisible();
  await page.reload();
  await page.getByTestId("nav-analysis").click();
  await page.getByTestId("nav-radar").filter({ visible: true }).click();
  await expect(page.getByText(/\+50%/)).toBeVisible();
});

test("all languages and screens fit phone, tablet and desktop", async ({
  page,
}) => {
  test.setTimeout(90000);
  const fs = await import("node:fs/promises");
  const result = JSON.parse(
    await fs.readFile("tests/fixtures/real-analysis.json", "utf8"),
  );
  const errors: string[] = [];
  page.on("pageerror", (err) => errors.push(err.message));
  await page.goto("/");
  await page.evaluate(
    (value) =>
      localStorage.setItem("wisechoice.history.v1", JSON.stringify([value])),
    result,
  );
  await page.reload();
  for (const width of [375, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const language of ["Русский", "Қазақша", "English"]) {
      await page.getByRole("button", { name: language, exact: true }).click();
      for (const section of [
        "dashboard",
        "analysis",
        "radar",
        "history",
        "learning",
      ]) {
        if (section === "dashboard" || section === "history" || section === "learning") {
          await navigateTo(page, section);
        } else {
          await page.getByTestId(`nav-${section}`).filter({ visible: true }).click();
        }
        await expect(page.locator("h1")).toBeVisible();
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= window.innerWidth,
          ),
          `${width} ${language} ${section}`,
        ).toBe(true);
      }
    }
  }
  expect(errors).toEqual([]);
});
