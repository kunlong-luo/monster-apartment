import { test, expect } from '@playwright/test';
import { placeStarter } from './helpers';

test('moving original spirits keeps one animated canvas', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/legacy');
  await placeStarter(page);
  await expect(page.getByRole('status')).toContainText('芽核 入住');
  await page.getByRole('button', { name: '移动 / 交换灵核' }).click();
  await page.getByRole('button', { name: /^2 号房/ }).click();
  await expect(page.getByRole('status')).toContainText('已调整 1 / 2 号房');
  await expect(page.locator('.apartment-canvas canvas')).toHaveCount(1);
  expect(await page.evaluate(() => document.documentElement.scrollHeight - innerHeight)).toBeLessThanOrEqual(1);
});
test('reduced motion disables visual feedback animations', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/legacy');
  await placeStarter(page);
  const animation = await page.locator('.game-action-reveal').evaluate(el => getComputedStyle(el).animationName);
  expect(animation).toBe('none');
  await page.getByRole('tab', { name: '房间' }).click();
  await expect(page.locator('.apartment-canvas canvas')).toHaveCount(1);
});
