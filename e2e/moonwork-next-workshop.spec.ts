import {test,expect} from '@playwright/test';

test('Next-owned PixiJS workshop survives SPA navigation and keeps one save',async({page})=>{
  test.setTimeout(90_000);
  const errors:string[]=[];
  page.on('pageerror',error=>errors.push(error.message));
  await page.goto('/workshop/');
  const stage=page.getByTestId('v2-stage');
  await expect(stage.locator('canvas')).toBeVisible({timeout:25_000});
  await expect(stage).toHaveAttribute('data-renderer','pixi-webgl-bitmap');
  await expect(page.getByTestId('v2-day')).toHaveText('1');
  await page.getByTestId('v2-shift').click();
  await expect(page.getByTestId('v2-day')).toHaveText('2');
  await page.getByTestId('v2-world-gate').click();
  await expect(page).toHaveURL(/\/town\/?$/);
  await expect(page.getByTestId('world-day')).toHaveText('2');
  await page.getByRole('link',{name:'工坊实景'}).click();
  await expect(page).toHaveURL(/\/workshop\/?$/);
  await expect(page.getByTestId('v2-day')).toHaveText('2');
  await expect(page.getByTestId('v2-stage').locator('canvas')).toHaveCount(1);
  await expect(page.getByTestId('v2-stage')).toHaveAttribute('data-machine-art','all-painted-machine-reviews');
  await page.getByTestId('v2-world-gate').click();
  await expect(page.getByTestId('world-day')).toHaveText('2');
  expect(errors).toEqual([]);
});

test('Next workshop remains playable on a 390px phone viewport',async({page})=>{
  test.setTimeout(90_000);
  await page.setViewportSize({width:390,height:844});
  await page.goto('/workshop/');
  await expect(page.getByTestId('v2-stage').locator('canvas')).toBeVisible({timeout:25_000});
  await expect(page.getByTestId('v2-build-well')).toBeVisible();
  await expect(page.getByTestId('v2-worker-fern')).toBeVisible();
  await expect(page.getByTestId('v2-shift')).toBeVisible();
  await page.getByTestId('v2-shift').click();
  await expect(page.getByTestId('v2-day')).toHaveText('2');
  await page.getByTestId('v2-world-gate').click();
  await expect(page.getByTestId('world-day')).toHaveText('2');
});
