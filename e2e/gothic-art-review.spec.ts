import {test,expect} from '@playwright/test';

/** Reviewable reference screenshots for the actual 2D build, not mockup art. */
test('desktop and phone Gothic HUD scenes stay fully visible',async({page})=>{
  test.setTimeout(90000);
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.setViewportSize({width:1440,height:900});
  await page.goto('/');
  await expect(page.getByTestId('gothic-lobby')).toBeVisible();
  await expect(page.getByTestId('gothic-light-layer')).toBeAttached();
  await page.screenshot({path:'test-results/gothic-lobby-desktop.png',animations:'disabled'});
  await page.goto('/apartment/');
  await expect(page.getByTestId('ga-room-0')).toBeVisible();
  await page.screenshot({path:'test-results/gothic-apartment-desktop.png',animations:'disabled'});
  await page.setViewportSize({width:390,height:844});
  await page.goto('/');
  await expect(page.getByRole('navigation',{name:'主要游戏功能'})).toBeVisible();
  await page.screenshot({path:'test-results/gothic-lobby-mobile.png',animations:'disabled'});
  await page.goto('/apartment/');
  await expect(page.getByTestId('ga-room-5')).toBeVisible();
  await page.screenshot({path:'test-results/gothic-apartment-mobile.png',animations:'disabled'});
});

test('Pixi 2D atmosphere is optional and respects reduced-motion preference',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto('/');
  await expect(page.getByTestId('gothic-pixi-atmosphere')).toBeAttached();
  await expect(page.getByTestId('gothic-pixi-atmosphere').locator('canvas')).toHaveCount(0);
  await page.getByRole('button',{name:'全部功能'}).click();
  await expect(page.getByRole('dialog',{name:'所有功能'})).toBeVisible();
  await page.getByRole('button',{name:'关闭面板'}).click();
  await page.goto('/apartment/');
  await expect(page.getByTestId('gothic-pixi-atmosphere')).toBeAttached();
  await expect(page.getByTestId('gothic-pixi-atmosphere').locator('canvas')).toHaveCount(0);
  await expect(page.getByTestId('ga-room-0')).toBeVisible();
});
