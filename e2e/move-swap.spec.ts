import { test, expect } from '@playwright/test';
import { placeStarter, seedSpirits } from './helpers';

test('move an original spirit and cancel another move', async ({ page }) => {
  await page.goto('/');
  const move=page.getByRole('button', { name: '移动 / 交换灵核' });
  await expect(move).toBeDisabled();
  await placeStarter(page);
  await move.click();
  await page.getByRole('button', { name: /^6 号房/ }).click();
  await expect(page.getByRole('button', { name: '1 号房（空房）' })).toBeVisible();
  await expect(page.getByRole('button', { name: '6 号房（已入住）' })).toBeVisible();
  await move.click();
  await page.getByRole('button', { name: '取消调配' }).click();
  await expect(page.getByRole('button', { name: '6 号房（已入住）' })).toBeVisible();
});
test('swapping two collected spirits updates placement and affinity', async ({ page }) => {
  await seedSpirits(page,['dewdrop','lantern-beetle',null,null,null,null]);
  await page.goto('/');
  await expect(page.getByTestId('room-affinity')).toContainText('契合 +3');
  await page.getByRole('button', { name: /^1 号房/ }).click();
  await page.getByRole('button', { name: '移动 / 交换灵核' }).click();
  await page.getByRole('button', { name: /^2 号房/ }).click();
  await expect(page.getByTestId('room-affinity')).toContainText('不适 -1');
  await page.reload();
  await expect(page.getByTestId('room-affinity')).toContainText('不适 -1');
});
test('movement disabled when final night ends', async ({ page }) => {
  await page.goto('/');
  await placeStarter(page);
  for (let i=0;i<5;i++) await page.getByRole('button',{name:'结束今天'}).click();
  await expect(page.getByText('本局未达标')).toBeVisible();
  await expect(page.getByRole('button',{name:'移动 / 交换灵核'})).toBeDisabled();
});
