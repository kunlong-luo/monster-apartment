import { expect, test } from '@playwright/test';

test('game UI loads and displays apartment management', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('灵核公寓', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: /结束今天/ })).toBeVisible();
  await expect(page.locator('canvas').first()).toBeVisible();
});

test('recruits a tenant and settles a day without runtime errors', async ({ page }) => {
  const pageErrors: string[] = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));

  await page.goto('/');
  await page.getByRole('button', { name: /史莱姆/ }).click();
  await expect(page.getByText('◈ 29')).toBeVisible();
  await expect(page.getByText('1 / 6')).toBeVisible();

  await page.getByRole('button', { name: /结束今天/ }).click();
  await expect(page.getByText(/DAY 2\/5/)).toBeVisible();
  await expect(page.getByText(/第 1 天结算/)).toBeVisible();

  expect(pageErrors).toEqual([]);
});
