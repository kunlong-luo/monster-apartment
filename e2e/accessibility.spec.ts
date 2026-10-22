import { test, expect } from '@playwright/test';
import { placeStarter } from './helpers';

test('mobile spirit residence has accessible controls and no overflow', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await expect(page.getByRole('heading', { name: '灵核公寓' })).toBeVisible();
  await expect(page.getByRole('tab', { name: '灵核' })).toBeVisible();
  await page.getByRole('tab', { name: '房间' }).click();
  for (let room = 1; room <= 6; room++) {
    await expect(page.getByRole('button', { name: new RegExp('^' + room + ' 号房') })).toBeVisible();
  }
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
  expect(overflow).toBeLessThanOrEqual(1);
});
test('spirits can be deployed using keyboard only', async ({ page }) => {
  await page.goto('/');
  const room = page.getByRole('button', { name: /^3 号房/ });
  await room.focus();
  await page.keyboard.press('Enter');
  await expect(room).toHaveAttribute('aria-pressed', 'true');
  const place = page.getByRole('button', { name: '芽核 入住选中房间' });
  await place.focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('status')).toContainText('芽核 入住');
  await expect(page.getByText('1 / 6')).toBeVisible();
});
