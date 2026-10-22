import { expect, test } from '@playwright/test';

test('nightly event choice survives reload and changes after settlement', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  await page.getByRole('button', { name: /史莱姆/ }).click();
  const options = page.getByRole('group', { name: '今晚的事件应对' });
  await expect(options).toBeVisible();
  const profit = options.getByRole('button', { name: /卖夜间通行券/ });
  await profit.click();
  await expect(profit).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByTestId('balance-forecast')).toContainText('今晚满意度预测');
  await expect(page.getByTestId('balance-forecast')).toContainText('五夜趋势');
  await page.reload();
  await expect(page.getByRole('group', { name: '今晚的事件应对' })
    .getByRole('button', { name: /卖夜间通行券/ })).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: '结束今天' }).click();
  await expect(page.locator('.game-log')).toContainText('夜间抉择 profit');
  await expect(page.getByRole('group', { name: '今晚的事件应对' })
    .getByRole('button', { name: /顺其自然/ })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByText('第 2 夜 · 水管危机')).toBeVisible();
  const vertical = await page.evaluate(() => document.documentElement.scrollHeight - innerHeight);
  expect(vertical).toBeLessThanOrEqual(1);
});

test('mobile English dilemma choice and reduced-motion settlement work without page scroll', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page.getByRole('combobox', { name: '语言' }).selectOption('en');
  await page.getByRole('button', { name: /Slime.*Rent/ }).click();
  await page.getByRole('tab', { name: 'Manage' }).click();
  const options = page.getByRole('group', { name: 'Tonight event decision' });
  await options.getByRole('button', { name: /Extra patrol/ }).click();
  await expect(options.getByRole('button', { name: /Extra patrol/ }))
    .toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: 'End day' }).click();
  const animation = await page.locator('.game-settlement-reveal').evaluate(
    (element) => getComputedStyle(element).animationName,
  );
  expect(animation).toBe('none');
  await page.getByRole('tab', { name: 'Journal' }).click();
  await expect(page.locator('.game-log')).toContainText('Night decision Care');
  const vertical = await page.evaluate(() => document.documentElement.scrollHeight - innerHeight);
  expect(vertical).toBeLessThanOrEqual(1);
});
