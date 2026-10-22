import { expect, test } from '@playwright/test';

test('moving tenants keeps one canvas and emits readable, short status feedback', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  await page.getByRole('button', { name: /史莱姆/ }).click();
  await expect(page.getByRole('status')).toContainText('成功入住');
  await page.getByRole('button', { name: /移动 \/ 交换租客/ }).click();
  await page.getByRole('button', { name: /^2 号房/ }).click();
  await expect(page.getByRole('status')).toContainText('租客已调整');
  await expect(page.locator('.apartment-canvas canvas')).toHaveCount(1);
  const overflow = await page.evaluate(() => ({
    horizontal: document.documentElement.scrollWidth - innerWidth,
    vertical: document.documentElement.scrollHeight - innerHeight,
  }));
  expect(overflow.vertical).toBeLessThanOrEqual(1);
  expect(overflow.horizontal).toBeLessThanOrEqual(1);
});

test('reduced-motion setting removes new recruitment/status animations', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page.getByRole('button', { name: /史莱姆/ }).click();
  const name = await page.locator('.game-action-reveal').evaluate(
    el => getComputedStyle(el).animationName,
  );
  expect(name).toBe('none');
  await page.getByRole('tab', { name: '房间' }).click();
  await expect(page.getByRole('button', { name: /^1 号房/ })).toBeVisible();
  await expect(page.locator('.apartment-canvas canvas')).toHaveCount(1);
});
