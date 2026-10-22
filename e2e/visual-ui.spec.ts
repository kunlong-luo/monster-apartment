import { expect, test } from '@playwright/test';

test('illustrated apartment dominates the desktop composition', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  const stage = page.getByTestId('apartment-stage');
  const canvas = page.locator('.apartment-canvas canvas');
  await expect(stage).toBeVisible();
  await expect(canvas).toHaveCount(1);
  await expect(canvas.first()).toBeVisible();
  await expect(page.getByRole('heading', { name: '怪物租客公寓' })).toBeVisible();

  const rosterBox = await page.locator('.game-roster').boundingBox();
  const stageBox = await stage.boundingBox();
  const ledgerBox = await page.locator('.game-ledger').boundingBox();
  expect(rosterBox).not.toBeNull();
  expect(stageBox).not.toBeNull();
  expect(ledgerBox).not.toBeNull();
  expect(stageBox!.x).toBeGreaterThan(rosterBox!.x);
  expect(ledgerBox!.x).toBeGreaterThan(stageBox!.x);
  expect(stageBox!.width).toBeGreaterThan(rosterBox!.width);

  // The game still uses the same recruitment, room selector and clock controls.
  await page.getByRole('button', { name: /史莱姆/ }).click();
  await page.getByRole('button', { name: /^2 号房/ }).click();
  await page.getByRole('button', { name: /火精灵/ }).click();
  await expect(page.getByText('房间 1-2：蒸汽供能 +3 租金')).toBeVisible();
  await page.screenshot({ path: 'test-results/v030-desktop.png', fullPage: true, animations: 'disabled' });
});

test('mobile game has stage-first layout, readable controls, and no side scrolling', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const stage = page.getByTestId('apartment-stage');
  await expect(stage).toBeVisible();
  const canvas = page.locator('.apartment-canvas canvas');
  await expect(canvas).toHaveCount(1);
  await expect(canvas.first()).toBeVisible();

  const stageBox = await stage.boundingBox();
  const rosterBox = await page.locator('.game-roster').boundingBox();
  expect(stageBox!.y).toBeLessThan(rosterBox!.y);
  const ledgerBox = await page.locator('.game-ledger').boundingBox();
  expect(rosterBox!.y).toBeLessThan(ledgerBox!.y);
  const overflow = await page.evaluate(() =>
    document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(1);

  const room = page.getByRole('button', { name: /^3 号房/ });
  await room.click();
  await expect(room).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByRole('button', { name: /结束今天/ })).toBeVisible();

  await page.screenshot({ path: 'test-results/v030-mobile.png', fullPage: true, animations: 'disabled' });
});
