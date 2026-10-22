import { test, expect } from '@playwright/test';
import { placeStarter } from './helpers';

const extent = (page: import('@playwright/test').Page) => page.evaluate(() => ({
  vertical: document.documentElement.scrollHeight - innerHeight,
  horizontal: document.documentElement.scrollWidth - innerWidth,
}));
test('desktop original spirit game fits within one screen', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  await expect(page.locator('.apartment-canvas canvas')).toHaveCount(1);
  await expect(page.getByRole('button', { name: '芽核 入住选中房间' })).toBeVisible();
  await expect(page.getByRole('button', { name: '结束今天' })).toBeVisible();
  await expect(page.getByRole('tablist')).toBeHidden();
  expect((await extent(page)).vertical).toBeLessThanOrEqual(1);
});
test('mobile spirit, rooms, management and journal stay within viewport', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await expect(page.getByRole('tab', { name: '灵核' })).toHaveAttribute('aria-selected','true');
  await placeStarter(page);
  await page.getByRole('tab', { name: '房间' }).click();
  await page.getByRole('button', { name: /^2 号房/ }).click();
  await page.getByRole('tab', { name: '经营' }).click();
  const end = page.getByRole('button', { name: '结束今天' });
  await expect(end).toBeEnabled();
  await end.click();
  await page.getByRole('tab', { name: '手记' }).click();
  await expect(page.locator('.game-log')).toContainText('第 1 天：收益');
  const size = await extent(page);
  expect(size.vertical).toBeLessThanOrEqual(1);
  expect(size.horizontal).toBeLessThanOrEqual(1);
});
test('tablet uses compact bottom tabs', async ({ page }) => {
  await page.setViewportSize({ width: 1024, height: 768 });
  await page.goto('/');
  await expect(page.getByRole('tablist')).toBeVisible();
  await page.getByRole('tab', { name: '房间' }).click();
  await expect(page.getByRole('button', { name: /^1 号房/ })).toBeVisible();
  expect((await extent(page)).vertical).toBeLessThanOrEqual(1);
});
