import { expect, test } from '@playwright/test';

test('automatically restores tenants and settled days after a reload', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: '芽核 入住选中房间' }).click();
  await expect(page.getByText('◈ 35')).toBeVisible();
  await page.reload();
  await expect(page.getByText('◈ 35')).toBeVisible();
  await expect(page.getByText('1 / 6')).toBeVisible();

  await page.getByRole('button', { name: '结束今天' }).click();
  await expect(page.getByText(/DAY 2\/5/)).toBeVisible();
  await page.reload();
  await expect(page.getByText(/DAY 2\/5/)).toBeVisible();
});

test('English UI and saved language survive refresh', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('combobox', { name: '语言' }).selectOption('en');
  await expect(page.getByRole('heading', { name: 'Spirit Core Residence' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'End day' })).toBeVisible();
  await expect(page.getByRole('img', { name: /Six-room spirit residence/ })).toBeVisible();
  await page.getByRole('button', { name: 'Place Seedcore in selected room' }).click();
  await expect(page.getByText('◈ 35')).toBeVisible();
  await page.getByRole('button', { name: 'End day' }).click();
  await expect(page.getByText(/Day 1: Star lantern patrol/)).toBeVisible();
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Spirit Core Residence' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'End day' })).toBeVisible();
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
});

test('new-player tutorial progresses and can be skipped or replayed', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('步骤 1/4')).toBeVisible();
  await page.getByRole('button', { name: /^3 号房/ }).click();
  await expect(page.getByText('步骤 2/4')).toBeVisible();
  await page.getByRole('button', { name: '芽核 入住选中房间' }).click();
  await expect(page.getByText('步骤 3/4')).toBeVisible();
  await page.getByRole('button', { name: '移动 / 交换灵核' }).click();
  await expect(page.getByText('步骤 4/4')).toBeVisible();
  await page.getByRole('button', { name: '跳过引导' }).click();
  await expect(page.getByText('步骤 4/4')).toHaveCount(0);
  await page.reload();
  await expect(page.getByText('新手引导')).toHaveCount(0);
  await page.getByRole('button', { name: '重新查看引导' }).click();
  await expect(page.getByText('步骤 1/4')).toBeVisible();
});
