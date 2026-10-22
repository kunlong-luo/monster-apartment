import { test, expect } from '@playwright/test';
import { placeStarter } from './helpers';
test('original spirit residence loads game and Phaser canvas', async ({ page }) => {
  await page.goto('/legacy');
  await expect(page.getByRole('heading',{name:'灵核公寓'})).toBeVisible();
  await expect(page.getByRole('button',{name:'芽核 入住选中房间'})).toBeVisible();
  await expect(page.getByRole('button',{name:'结束今天'})).toBeVisible();
  await expect(page.locator('canvas').first()).toBeVisible();
});
test('placing a spirit and settling a night has no runtime errors', async ({ page }) => {
  const errors:string[]=[];
  page.on('pageerror',err=>errors.push(err.message));
  await page.goto('/legacy');
  await placeStarter(page);
  await expect(page.getByText('◈ 35')).toBeVisible();
  await expect(page.getByText('1 / 6')).toBeVisible();
  await page.getByRole('button',{name:'结束今天'}).click();
  await expect(page.getByText(/DAY 2\/5/)).toBeVisible();
  await expect(page.getByText(/第 1 天结算/)).toBeVisible();
  expect(errors).toEqual([]);
});
