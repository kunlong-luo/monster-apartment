import {expect,test} from '@playwright/test';
import {mkdirSync} from 'node:fs';

test('mobile apartment keeps room entrances available without covering the character',async({page})=>{
  test.setTimeout(75_000);
  await page.setViewportSize({width:390,height:844});
  await page.goto('/apartment/',{waitUntil:'domcontentloaded'});
  const toggle=page.getByTestId('ga-room-menu-toggle');
  const panel=page.getByTestId('ga-room-menu-panel');
  await expect(toggle).toBeVisible();
  await expect(toggle).toHaveAttribute('aria-expanded','false');
  await expect(toggle).toContainText('房间 · 1/6 入住');
  await expect(page.getByTestId('ga-room-0')).toBeHidden();
  await expect(page.getByTestId('ga-room-5')).toBeHidden();

  mkdirSync('visual-evidence/apartment',{recursive:true});
  await page.screenshot({path:'visual-evidence/apartment/mobile-room-chooser-closed-390.png',animations:'disabled'});

  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-expanded','true');
  await expect(panel).toBeVisible();
  for(let i=0;i<6;i++)await expect(page.getByTestId('ga-room-'+i)).toBeVisible();

  const bounds=await panel.boundingBox();
  expect(bounds).not.toBeNull();
  expect(bounds!.x).toBeGreaterThanOrEqual(0);
  expect(bounds!.x+bounds!.width).toBeLessThanOrEqual(390.5);
  expect(bounds!.y+bounds!.height).toBeLessThanOrEqual(844.5);
  await page.screenshot({path:'visual-evidence/apartment/mobile-room-chooser-open-390.png',animations:'disabled'});

  await page.getByTestId('ga-room-2').focus();
  await page.keyboard.press('Escape');
  await expect(toggle).toHaveAttribute('aria-expanded','false');
  await expect(toggle).toBeFocused();
  await toggle.click();
  await page.getByTestId('ga-room-2').click();
  await expect(page.getByTestId('ga-room-drawer')).toBeVisible();
  await expect(toggle).toHaveAttribute('aria-expanded','false');
  await expect(page.getByTestId('ga-coins')).toHaveText('105');

  // Desktop is still the same always-visible six-room rail with no extra toggle.
  await page.setViewportSize({width:1440,height:900});
  await expect(toggle).toBeHidden();
  for(let i=0;i<6;i++)await expect(page.getByTestId('ga-room-'+i)).toBeVisible();
  await page.screenshot({path:'visual-evidence/apartment/desktop-room-chooser-1440.png',animations:'disabled'});
});
