import { expect, test } from '@playwright/test';

test('V0.4 desktop primary gameplay fits one viewport without document scroll', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  await expect(page.locator('.apartment-canvas canvas')).toHaveCount(1);
  await expect(page.getByRole('button', { name: /史莱姆/ })).toBeVisible();
  await expect(page.getByRole('button', { name: /^2 号房/ })).toBeVisible();
  await expect(page.getByRole('button', { name: /结束今天/ })).toBeVisible();
  await expect(page.getByRole('tablist')).toBeHidden();

  const extent = await page.evaluate(() => ({
    vertical: document.documentElement.scrollHeight - window.innerHeight,
    horizontal: document.documentElement.scrollWidth - window.innerWidth,
  }));
  expect(extent.vertical).toBeLessThanOrEqual(1);
  expect(extent.horizontal).toBeLessThanOrEqual(1);
});

test('V0.4 mobile uses recruit, room, management and journal tabs without page scroll', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await expect(page.locator('.apartment-canvas canvas')).toHaveCount(1);
  const recruit = page.getByRole('tab', { name: '招募' });
  const rooms = page.getByRole('tab', { name: '房间' });
  const manage = page.getByRole('tab', { name: '经营' });
  const journal = page.getByRole('tab', { name: '手记' });
  await expect(recruit).toHaveAttribute('aria-selected', 'true');
  await page.getByRole('button', { name: /史莱姆/ }).click();

  await rooms.click();
  const second = page.getByRole('button', { name: /^2 号房/ });
  await expect(second).toBeVisible();
  await second.click();
  await expect(second).toHaveAttribute('aria-pressed', 'true');

  await manage.click();
  const end = page.getByRole('button', { name: /结束今天/ });
  await expect(end).toBeEnabled();
  const ledger = await page.locator('.game-ledger').boundingBox();
  const action = await end.boundingBox();
  expect(ledger).not.toBeNull();
  expect(action).not.toBeNull();
  expect(action!.y).toBeGreaterThanOrEqual(ledger!.y - 1);
  expect(action!.y + action!.height).toBeLessThanOrEqual(ledger!.y + ledger!.height + 1);
  await end.click();
  await journal.click();
  await expect(page.locator('.game-log')).toContainText('第 1 天：租金');

  const extent = await page.evaluate(() => ({
    vertical: document.documentElement.scrollHeight - window.innerHeight,
    horizontal: document.documentElement.scrollWidth - window.innerWidth,
  }));
  expect(extent.vertical).toBeLessThanOrEqual(1);
  expect(extent.horizontal).toBeLessThanOrEqual(1);
});


test('V0.4 tablet uses the compact dock rather than a long stacking page', async ({ page }) => {
  await page.setViewportSize({ width: 1024, height: 768 });
  await page.goto('/');
  await expect(page.locator('.apartment-canvas canvas')).toHaveCount(1);
  await expect(page.getByRole('tablist')).toBeVisible();
  await page.getByRole('tab', { name: '房间' }).click();
  await expect(page.getByRole('button', { name: /^1 号房/ })).toBeVisible();
  const vertical = await page.evaluate(() => document.documentElement.scrollHeight - window.innerHeight);
  expect(vertical).toBeLessThanOrEqual(1);
});
