import { expect, test } from '@playwright/test';

test('room traits and policy decisions change the estimated income on desktop', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  await page.getByRole('button', { name: /史莱姆/ }).click();
  await expect(page.getByTestId('room-affinity')).toContainText('契合 +3 金币');
  await expect(page.getByRole('group', { name: '选择经营策略' })).toBeVisible();

  const party = page.getByRole('button', { name: /办派对/ });
  await party.click();
  await expect(party).toHaveAttribute('aria-pressed', 'true');
  await page.reload();
  await expect(page.getByRole('button', { name: /办派对/ })).toHaveAttribute('aria-pressed', 'true');

  await page.getByRole('button', { name: '结束今天' }).click();
  await expect(page.getByRole('button', { name: /稳健/ })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('.game-log')).toContainText('房间偏好');
  await expect(page.locator('.game-log')).toContainText('festival');
});

test('mobile policy tab retains one-screen navigation and supports English', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.getByRole('combobox', { name: '语言' }).selectOption('en');
  await page.getByRole('button', { name: /Slime.*Rent/ }).click();
  await page.getByRole('tab', { name: 'Manage' }).click();
  const savings = page.getByRole('button', { name: /Save.*6 coins/ });
  await savings.click();
  await expect(savings).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: 'End day' }).click();
  await page.getByRole('tab', { name: 'Journal' }).click();
  await expect(page.locator('.game-log')).toContainText('Room affinity');
  await expect(page.locator('.game-log')).toContainText('Savings');
  const overflow = await page.evaluate(() => ({
    horizontal: document.documentElement.scrollWidth - innerWidth,
    vertical: document.documentElement.scrollHeight - innerHeight,
  }));
  expect(overflow.horizontal).toBeLessThanOrEqual(1);
  expect(overflow.vertical).toBeLessThanOrEqual(1);
});
