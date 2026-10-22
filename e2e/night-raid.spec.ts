import { test, expect } from '@playwright/test';
import { placeStarter } from './helpers';

test('players can defend live lanes using timed combat actions', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  await placeStarter(page);
  const trigger = page.getByTestId('open-night-raid');
  await expect(trigger).toBeEnabled();
  await trigger.click();
  const raid = page.getByTestId('night-raid');
  await expect(raid).toBeVisible();
  await expect(raid.getByTestId('raid-lane-0')).toBeVisible();
  await expect(raid.getByTestId('raid-lane-1')).toBeVisible();
  await expect(raid.getByTestId('raid-lane-2')).toBeVisible();
  await page.getByTestId('raid-start').click();
  await expect(raid.getByTestId('raid-enemy').first()).toBeVisible();
  await page.keyboard.press('1');
  await expect(raid.getByTestId('raid-stats')).toContainText('1');
  await raid.getByRole('button', { name: '退出防线' }).click();
  await expect(raid).toHaveCount(0);
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
