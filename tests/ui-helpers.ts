import { expect, type Page } from '@playwright/test';

export async function navigateTo(page: Page, section: 'dashboard' | 'history' | 'learning') {
  const trigger = page.getByTestId('menu-open');
  if (await trigger.isVisible()) {
    if (await trigger.getAttribute('aria-expanded') !== 'true') {
      await expect(page.getByRole('dialog')).toHaveCount(0);
      await trigger.click();
    }
    await page.getByRole('dialog').getByTestId(`nav-${section}`).click();
    await expect(page.getByRole('dialog')).toHaveCount(0);
  } else {
    await page.getByTestId('desktop-sidebar').getByTestId(`nav-${section}`).click();
  }
}
