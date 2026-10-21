import { test, expect } from '@playwright/test';

for (const size of [{width:1440,height:768},{width:1280,height:720}]) {
  test(`analysis workspace fits its controls inside ${size.width}x${size.height}`, async ({ page }) => {
    await page.setViewportSize(size);
    await page.goto('/');
    await page.getByTestId('input-mode-image').click();
    await page.getByTestId('example-incomplete').click();
    await page.evaluate(() => window.scrollTo(0,0));
    const action=page.getByTestId('analyze');
    const box=(await action.boundingBox())!;
    expect(box.y).toBeGreaterThanOrEqual(72);
    expect(box.y+box.height).toBeLessThan(size.height-16);
    const preview=(await page.getByTestId('selected-image').boundingBox())!;
    expect(preview.y+preview.height).toBeLessThan(size.height-20);
    const examples=page.getByTestId('analysis-examples');
    expect((await examples.boundingBox())!.y).toBeLessThan(250);
    for (const id of ['documented','income','incomplete']) {
      const example=(await page.getByTestId(`example-${id}`).boundingBox())!;
      expect(example.y+example.height).toBeLessThan(size.height-20);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  });
}
