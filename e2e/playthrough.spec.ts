import { test, expect } from '@playwright/test';
import { placeStarter, seedSpirits } from './helpers';
test('complementary original spirits can win five-night management', async ({ page }) => {
  await seedSpirits(page, ['pebble-crab','lantern-beetle',null,'prism-mole','fern-hare','seedling']);
  await page.goto('/');
  for(let i=0;i<5;i++) await page.getByRole('button',{name:'结束今天'}).click();
  await expect(page.getByText('🎉 经营成功')).toBeVisible();
  await expect(page.getByTestId('final-grade')).toContainText('经营评级');
  await expect(page.getByRole('button',{name:'结束今天'})).toBeDisabled();
});
test('single starting spirit requires further collecting to win', async ({ page }) => {
  await page.goto('/');
  await placeStarter(page);
  for(let i=0;i<5;i++) await page.getByRole('button',{name:'结束今天'}).click();
  await expect(page.getByText('本局未达标')).toBeVisible();
  await expect(page.getByTestId('final-grade')).toContainText('经营评级');
});
