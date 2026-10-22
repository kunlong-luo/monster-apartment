import { test, expect } from '@playwright/test';

test('summon, codex, assignments and progression persist without adding document scroll', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  await page.getByTestId('open-spirit-portal').click();
  const portal = page.getByTestId('spirit-portal');
  await expect(portal).toBeVisible();
  await expect(page.getByTestId('summon-resources')).toContainText('召唤券 10');
  await portal.getByRole('button', { name: '召唤 1 次 · 1 券' }).click();
  await expect(page.getByTestId('summon-results')).toBeVisible();
  await expect(page.getByTestId('summon-resources')).toContainText('召唤券 9');
  await portal.getByRole('tab', { name: '图鉴养成' }).click();
  await expect(page.getByTestId('spirit-codex')).toContainText('芽核');
  await portal.getByRole('button', { name: '关闭召唤所' }).click();

  await page.getByRole('button', { name: /史莱姆/ }).click();
  await page.getByTestId('open-spirit-portal').click();
  await portal.getByRole('tab', { name: '房间驻守' }).click();
  await expect(portal).toContainText('当前选中房间：1');
  await portal.getByRole('button', { name: '驻守选中房间' }).first().click();
  await portal.getByRole('button', { name: '关闭召唤所' }).click();

  await expect(page.getByTestId('room-affinity')).toContainText('✦');
  await page.getByRole('button', { name: '结束今天' }).click();
  await page.getByTestId('open-spirit-portal').click();
  await expect(page.getByTestId('summon-resources')).toContainText('召唤券 11');
  await portal.getByRole('tab', { name: '图鉴养成' }).click();
  await expect(page.getByTestId('spirit-codex')).toContainText('XP 6');
  await page.reload();
  await page.getByTestId('open-spirit-portal').click();
  await expect(page.getByTestId('summon-resources')).toContainText('召唤券 11');
  await portal.getByRole('tab', { name: '房间驻守' }).click();
  await expect(portal).toContainText('芽核');

  const extent = await page.evaluate(() => ({
    vertical: document.documentElement.scrollHeight - innerHeight,
    horizontal: document.documentElement.scrollWidth - innerWidth,
  }));
  expect(extent.vertical).toBeLessThanOrEqual(1);
  expect(extent.horizontal).toBeLessThanOrEqual(1);
});

test('mobile summons use an overlay and do not disturb panel navigation', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.getByText('更多', { exact: true }).click();
  await page.getByRole('button', { name: '✦ 召唤 · 图鉴' }).click();
  await expect(page.getByTestId('spirit-portal')).toBeVisible();
  await page.getByRole('button', { name: '关闭召唤所' }).click();
  await page.getByRole('tab', { name: '经营' }).click();
  await expect(page.getByRole('button', { name: '结束今天' })).toBeVisible();
  const overflow = await page.evaluate(() => document.documentElement.scrollHeight - innerHeight);
  expect(overflow).toBeLessThanOrEqual(1);
});
