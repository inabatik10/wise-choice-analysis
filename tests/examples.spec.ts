import { test, expect } from "@playwright/test";

test("all three examples work as text and actual PNG images in each language", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  let analysisRequests = 0;
  page.on("request", request => {
    if (request.url().endsWith("/api/analyze")) analysisRequests += 1;
  });
  await page.goto("/");
  const cases = [
    { language: "Русский", term: "Excel", disclaimer: "Вымышленные учебные примеры" },
    { language: "Қазақша", term: "Excel", disclaimer: "Ойдан шығарылған оқу мысалдары" },
    { language: "English", term: "Excel", disclaimer: "Fictional examples for learning" },
  ];
  for (const { language, term, disclaimer } of cases) {
    await page.getByRole("button", { name: language, exact: true }).click();
    await page.getByTestId("input-mode-text").click();
    await expect(page.getByTestId("analysis-examples")).toContainText(disclaimer);
    for (const id of ["documented", "income", "incomplete"]) {
      const option = page.getByTestId(`example-${id}`);
      await option.click();
      await expect(option).toHaveAttribute("aria-pressed", "true");
      await expect(page.getByTestId("selected-source")).toContainText(await option.getAttribute("aria-label") ?? "");
      await expect(page.getByTestId("offer-text")).not.toHaveValue("");
      if (id === "documented") {
        await expect(page.getByTestId("offer-text")).toHaveValue(new RegExp(term));
        await expect(page.getByTestId("offer-text")).toHaveValue(/45 000/);
      }
      await expect(page.getByTestId("analyze")).toBeEnabled();
    }
    await page.getByTestId("input-mode-image").click();
    for (const id of ["documented", "income", "incomplete"]) {
      await page.getByTestId(`example-${id}`).click();
      const preview = page.getByTestId("selected-image");
      await expect(preview).toHaveAttribute("src", /^data:image\/png;base64,/);
      await expect.poll(() => preview.evaluate(image => (image as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
      await expect(page.getByTestId("analyze")).toBeEnabled();
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
  expect(analysisRequests).toBe(0);
  await expect(page.getByTestId("idp-score")).toHaveCount(0);
});
