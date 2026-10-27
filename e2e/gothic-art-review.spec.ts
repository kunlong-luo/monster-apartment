import {test,expect} from '@playwright/test';

/** Reviewable reference screenshots for the actual 2D build, not mockup art. */
test('desktop and phone Gothic HUD scenes stay fully visible',async({page})=>{
  test.setTimeout(90000);
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.setViewportSize({width:1440,height:900});
  await page.goto('/');
  await expect(page.getByTestId('gothic-lobby')).toBeVisible();
  await expect(page.getByTestId('gothic-lobby-painting-image')).toBeVisible();
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

test('actual PixiJS 8 Gothic motes mount and unmount when animation is toggled',async({page})=>{
  test.setTimeout(90000);
  await page.setViewportSize({width:1280,height:800});
  await page.emulateMedia({reducedMotion:'no-preference'});
  await page.goto('/');
  const atmosphere=page.getByTestId('gothic-pixi-atmosphere');
  await expect(atmosphere).toHaveAttribute('data-renderer',/^(pixi|unsupported)$/,{timeout:30000});
  const mode=await atmosphere.getAttribute('data-renderer');
  if(mode==='unsupported'){
    // CI browsers can disable GPU contexts; gracefully degrading is required.
    const hasWebGL=await page.evaluate(()=>{
      try{
        const canvas=document.createElement('canvas');
        return Boolean(canvas.getContext('webgl2')||canvas.getContext('webgl'));
      }catch{return false;}
    });
    const message=await atmosphere.getAttribute('data-renderer-error');
    expect(hasWebGL,'Pixi initialization failed despite WebGL support: '+message).toBe(false);
  }else{
    await expect(atmosphere.locator('canvas')).toHaveCount(1);
    await expect(atmosphere.locator('canvas')).toHaveAttribute('aria-hidden','true');
  }
  await page.getByRole('button',{name:'切换动态特效'}).click();
  await expect(atmosphere.locator('canvas')).toHaveCount(0);
  await expect(atmosphere).toHaveAttribute('data-renderer','disabled');
  await page.getByRole('button',{name:'切换动态特效'}).click();
  await expect(atmosphere).toHaveAttribute('data-renderer',/^(pixi|unsupported)$/,{timeout:30000});
  if(mode==='pixi')await expect(atmosphere.locator('canvas')).toHaveCount(1);
});
