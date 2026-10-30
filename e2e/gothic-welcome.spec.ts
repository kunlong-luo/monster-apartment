import {test,expect} from '@playwright/test';
// An empty first-visit browser is intentional; the other E2E flows use a
// continuing-player storageState, so existing route and gameplay tests stay realistic.
test.use({storageState:{cookies:[],origins:[]}});

test('fresh visitor sees a full-screen welcome and enters the real saved lobby',async({page})=>{
  await page.setViewportSize({width:1440,height:900});
  await page.goto('/');
  await expect(page.getByTestId('gothic-welcome')).toBeVisible();
  await expect(page.getByTestId('game-release')).toContainText('V3.60');
  await expect(page.getByTestId('welcome-heroine-lineup').locator('img')).toHaveCount(4);
  await page.screenshot({path:'test-results/welcome-desktop.png',animations:'disabled'});
  await expect(page.getByTestId('welcome-cover-image')).toHaveJSProperty('naturalWidth',1920);
  await expect(page.getByTestId('gothic-welcome')).toHaveAttribute('data-cover-status','integrated-beauty-beasts-cover');
  await expect(page.getByTestId('gothic-lobby')).toHaveCount(0);
  const start=page.getByTestId('welcome-enter');
  await expect(start).toHaveText(/开始游戏/);
  await start.focus();
  await page.keyboard.press('Enter');
  await expect(page.getByTestId('gothic-lobby')).toBeVisible();
  expect(await page.evaluate(()=>localStorage.getItem('monster-apartment:welcome-entered:v1'))).toBe('1');
  await page.reload();
  await expect(page.getByTestId('gothic-lobby')).toBeVisible();
  await expect(page.getByTestId('gothic-welcome')).toHaveCount(0);
  await page.getByTestId('gothic-eclipse-feature').click();
  await expect(page.getByTestId('gothic-summon-stage')).toBeVisible();
});
test('phone welcome preserves touch target and does not scroll',async({page})=>{
  await page.setViewportSize({width:390,height:844});
  await page.goto('/');
  const start=page.getByTestId('welcome-enter');
  await expect(start).toBeVisible();
  await expect(page.getByTestId('game-release')).toContainText('V3.60');
  await expect(page.getByTestId('welcome-heroine-lineup')).toBeVisible();
  await page.screenshot({path:'test-results/welcome-mobile.png',animations:'disabled'});
  const source=page.locator('.gothic-welcome__painting source');
  await expect(source).toHaveAttribute('media','(max-width:700px)');
  await expect(page.getByTestId('welcome-cover-image')).toHaveJSProperty('naturalWidth',900);
  const measurement=await page.evaluate(()=>{
    const el=document.querySelector('[data-testid="welcome-enter"]')!;
    const box=el.getBoundingClientRect();
    return {width:box.width,height:box.height,overflowX:document.documentElement.scrollWidth-innerWidth,
      overflowY:document.documentElement.scrollHeight-innerHeight};
  });
  expect(measurement.width).toBeGreaterThan(210);
  expect(measurement.height).toBeGreaterThanOrEqual(44);
  expect(measurement.overflowX).toBeLessThanOrEqual(1);
  expect(measurement.overflowY).toBeLessThanOrEqual(1);
  await start.click();
  await expect(page.getByRole('navigation',{name:'主要游戏功能'})).toBeVisible();
});
test('an existing save changes the main CTA to continue, without resetting progress',async({page})=>{
  await page.addInitScript(()=>{
    localStorage.setItem('monster-apartment:character-collection:v1',
      JSON.stringify({version:1,draws:['brook-tide'],shards:9,inventory:[],equipped:{}}));
  });
  await page.goto('/');
  await expect(page.getByTestId('welcome-enter')).toHaveText(/继续游戏/);
  await page.getByTestId('welcome-enter').click();
  expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('monster-apartment:character-collection:v1')!).shards)).toBe(9);
});
