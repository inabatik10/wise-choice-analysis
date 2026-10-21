import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';

test('desktop retains its sidebar; phone uses a dismissible burger menu', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  await expect(page.getByTestId('desktop-sidebar')).toBeVisible();
  await expect(page.getByTestId('desktop-sidebar').getByTestId('nav-history')).toBeVisible();
  await expect(page.getByTestId('menu-open')).not.toBeVisible();
  await page.setViewportSize({ width: 375, height: 812 });
  await expect(page.getByTestId('desktop-sidebar')).not.toBeVisible();
  await expect(page.getByTestId('menu-open')).toBeVisible();
  for (const control of [page.getByTestId('theme-toggle'), ...['Русский', 'Қазақша', 'English'].map(name => page.getByRole('button', { name, exact: true }))]) {
    const box = (await control.boundingBox())!;
    expect(Math.round(box.width)).toBeGreaterThanOrEqual(44);
    expect(Math.round(box.height)).toBeGreaterThanOrEqual(44);
  }
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await page.getByTestId('menu-open').click();
  const menu = page.getByRole('dialog');
  await expect(menu).toBeVisible();
  await expect(menu.getByTestId('nav-history')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(menu).toHaveCount(0);
  await expect(page.getByTestId('menu-open')).toBeFocused();
  await page.getByTestId('menu-open').click();
  await page.getByRole('dialog').getByTestId('nav-history').click();
  await expect(page.getByTestId('empty-history')).toBeVisible();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('phone keeps price comparison inside its saved result', async ({ page }) => {
  const result = JSON.parse(await readFile('tests/fixtures/author-analysis.json', 'utf8'));
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.evaluate(value => localStorage.setItem('wisechoice.history.v1', JSON.stringify([value])), result);
  await page.reload();
  await page.getByTestId('nav-analysis').filter({ visible: true }).click();
  await expect(page.getByTestId('analysis-evidence')).toBeVisible();
  await page.getByTestId('nav-radar').filter({ visible: true }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Сравнение цены');
  await expect(page.getByTestId('comparison-course').getByText(result.title.ru, { exact: true })).toBeVisible();
  await page.getByTestId('back-to-result').click();
  await expect(page.getByTestId('idp-score')).toHaveText(String(result.idp));
  await page.getByTestId('menu-open').click();
  await page.getByRole('dialog').getByTestId('nav-history').click();
  await expect(page.getByTestId('history-mobile')).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
