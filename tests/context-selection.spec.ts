import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { navigateTo } from './ui-helpers';

for (const width of [375, 1256]) {
  test(`current check stays in the header while reading calculations at ${width}px`, async ({ page }) => {
    const first = JSON.parse(await readFile('tests/fixtures/author-analysis.json', 'utf8'));
    const second = JSON.parse(await readFile('tests/fixtures/real-analysis.json', 'utf8'));
    await page.setViewportSize({ width, height: 812 });
    await page.goto('/');
    await page.evaluate(values => localStorage.setItem('wisechoice.history.v1', JSON.stringify(values)), [first, second]);
    await page.reload();
    await expect(page.getByTestId('check-selector')).toHaveCount(0);
    await page.getByTestId('nav-analysis').click();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(first.title.ru);
    const header = page.getByTestId('workspace-header');
    const picker = header.getByTestId('check-selector');
    await expect(picker).toHaveCount(1);
    await expect(picker).toContainText(first.title.ru);
    await expect(picker.locator('time')).toHaveAttribute('datetime', first.createdAt);
    await expect(page.getByTestId('desktop-sidebar').getByTestId('check-selector')).toHaveCount(0);
    await expect(picker).not.toHaveClass(/truncate|line-clamp/);
    expect(await picker.evaluate(element => getComputedStyle(element).whiteSpace)).not.toBe('nowrap');
    expect((await picker.boundingBox())!.height).toBeGreaterThanOrEqual(44);

    if (await page.getByTestId('methodology-toggle').getAttribute('aria-expanded') === 'false') {
      await page.getByTestId('methodology-toggle').click();
    }
    await page.getByTestId('method-tab-bayes').click();
    await page.getByTestId('bayes-chart').scrollIntoViewIfNeeded();
    expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(200);
    expect((await header.boundingBox())!.y).toBeLessThan(0.5);
    const bounds = (await picker.boundingBox())!;
    expect(bounds.y).toBeGreaterThanOrEqual(0);
    expect(bounds.y + bounds.height).toBeLessThan(200);
    await expect(picker).toContainText(first.title.ru);

    await picker.click();
    const popupBounds = (await page.getByTestId('check-options').boundingBox())!;
    const triggerBounds = (await picker.boundingBox())!;
    expect(Math.abs(popupBounds.width - triggerBounds.width)).toBeLessThanOrEqual(1);
    expect(popupBounds.x).toBeGreaterThanOrEqual(16);
    expect(popupBounds.x + popupBounds.width).toBeLessThanOrEqual(width - 16);
    await page.getByTestId(`check-option-${second.id}`).click();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(second.title.ru);
    await expect(picker).toContainText(second.title.ru);
    await expect(picker.locator('time')).toHaveAttribute('datetime', second.createdAt);
    await picker.click();
    await expect(page.getByTestId(`check-option-${second.id}`)).toBeFocused();
    await page.keyboard.press('ArrowUp');
    await expect(page.getByTestId(`check-option-${first.id}`)).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(first.title.ru);
    await picker.click();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('listbox')).toHaveCount(0);
    await expect(picker).toBeFocused();

    if (width < 1024) {
      await page.getByTestId('menu-open').click();
      const menu = page.getByRole('dialog');
      await expect(menu).toHaveAttribute('data-side', 'bottom');
      await expect(menu.getByTestId('check-selector')).toHaveCount(0);
      await expect(menu.getByTestId('sidebar-analysis')).toBeVisible();
      await menu.getByTestId('sidebar-radar').click();
      await expect(menu).toHaveCount(0);
    } else await page.getByTestId('desktop-sidebar').getByTestId('sidebar-radar').click();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Сравнение цены');
    await expect(picker).toContainText(first.title.ru);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);

    await navigateTo(page, 'dashboard');
    await expect(page.getByTestId('offer-text')).toBeVisible();
    await expect(page.getByTestId('check-selector')).toHaveCount(0);
    await expect(header).not.toContainText(first.title.ru);
  });
}

test('choosing a phone example keeps its form below the sticky header', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/');
  await page.getByRole('button', { name: 'Выбрать пример', exact: true }).click();
  const headerBottom = (await page.getByTestId('workspace-header').boundingBox())!.height;
  const examplesTop = (await page.getByTestId('analysis-examples').getByRole('heading', { level: 2 }).boundingBox())!.y;
  expect(examplesTop).toBeGreaterThanOrEqual(headerBottom);
  await page.getByTestId('example-income').click();
  await expect(page.getByTestId('offer-text')).not.toHaveValue('');
  const modeTop = (await page.getByTestId('input-mode-text').boundingBox())!.y;
  expect(modeTop).toBeGreaterThanOrEqual(headerBottom);
});
