import { test, expect } from '@playwright/test';
import { placeStarter } from './helpers';

test('players can defend live lanes using timed combat actions', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  const runtimeErrors: string[] = [];
  page.on('pageerror', error => runtimeErrors.push(error.message));
  await page.goto('/');
  await placeStarter(page);
  const trigger = page.getByTestId('open-night-raid');
  await expect(trigger).toBeEnabled();
  await trigger.click();
  const raid = page.getByTestId('night-raid');
  await expect(raid).toBeVisible();
  await expect(raid.getByTestId('raid-phaser-canvas').locator('canvas')).toBeVisible();
  await expect(raid.getByTestId('raid-phaser-canvas').locator('canvas')).toHaveCount(1);
  await expect(raid.getByTestId('raid-lane-0')).toBeVisible();
  await expect(raid.getByTestId('raid-lane-1')).toBeVisible();
  await expect(raid.getByTestId('raid-lane-2')).toBeVisible();
  await page.getByTestId('raid-start').click();
  await expect(raid.getByTestId('raid-enemy').first()).toBeVisible();
  await page.keyboard.press('1');
  await expect(raid.getByTestId('raid-stats')).toContainText('1');
  await raid.getByRole('button', { name: '退出防线' }).click();
  await expect(raid).toHaveCount(0);
  expect(runtimeErrors).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollHeight - innerHeight))
    .toBeLessThanOrEqual(1);
});

test('mobile tactical overlay is accessible without expanding document height', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await placeStarter(page);
  await page.getByTestId('open-night-raid').click();
  const raid = page.getByTestId('night-raid');
  await expect(raid).toBeVisible();
  await expect(raid.getByTestId('raid-phaser-canvas').locator('canvas')).toBeVisible();
  await expect(page.getByTestId('raid-start')).toBeVisible();
  await page.getByTestId('raid-start').click();
  await expect(raid.getByTestId('raid-enemy').first()).toBeVisible();
  expect(await raid.getByTestId('raid-enemy').first().evaluate(
    e => getComputedStyle(e).transitionDuration)).toBe('0s');
  await page.keyboard.press('Escape');
  await expect(raid).toHaveCount(0);
  const overflow = await page.evaluate(() => ({
    vertical: document.documentElement.scrollHeight - innerHeight,
    horizontal: document.documentElement.scrollWidth - innerWidth,
  }));
  expect(overflow.vertical).toBeLessThanOrEqual(1);
  expect(overflow.horizontal).toBeLessThanOrEqual(1);
});

test('tactical pause freezes enemies and wave forecast predicts the next threat', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  await placeStarter(page);
  await page.getByTestId('open-night-raid').click();
  const raid = page.getByTestId('night-raid');
  await expect(raid.getByTestId('raid-next-waves')).toContainText('第1刻');
  await expect(raid.getByTestId('raid-next-waves')).toContainText('中路');
  await page.getByTestId('raid-start').click();
  await expect(raid.getByTestId('raid-enemy').first()).toBeVisible();
  await page.getByTestId('raid-pause').click();
  await expect(raid.getByTestId('raid-paused')).toBeVisible();
  const progress = await raid.locator('footer > span').textContent();
  await page.waitForTimeout(1150);
  expect(await raid.locator('footer > span').textContent()).toBe(progress);
  await page.getByTestId('raid-speed').click();
  await expect(page.getByTestId('raid-speed')).toContainText('2×');
  await page.keyboard.press('p');
  await expect(raid.getByTestId('raid-paused')).toHaveCount(0);
  await expect.poll(async () => raid.locator('footer > span').textContent()).not.toBe(progress);
  await raid.getByRole('button', { name: '退出防线' }).click();
});
