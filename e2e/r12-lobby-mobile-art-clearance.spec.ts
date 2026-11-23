import {expect,test} from '@playwright/test';
import {mkdirSync} from 'node:fs';

test('mobile lobby prioritizes heroine painting without losing summon or seven routes',async({page})=>{
  test.setTimeout(90000);
  await page.setViewportSize({width:390,height:844});
  await page.goto('/',{waitUntil:'domcontentloaded'});
  const feature=page.getByTestId('gothic-eclipse-feature');
  const mainQuest=page.getByTestId('gothic-main-quest');
  const dock=page.getByRole('navigation',{name:'主要游戏功能'});
  await expect(feature).toBeVisible();
  await expect(mainQuest).toBeVisible();
  await expect(feature).toContainText('神话 · 月蚀');
  await expect(feature).toHaveAttribute('href',/characters/);
  // Only the corner atlas remains; no 4-button overlay over the heroine.
  await expect(dock.getByRole('link')).toHaveCount(0);
  const worldToggle=dock.getByRole('button',{name:'全部地点'});
  await expect(worldToggle).toBeVisible();
  await worldToggle.click();
  await expect(page.getByRole('navigation',{name:'全部地点导航'}).getByRole('link')).toHaveCount(7);
  await worldToggle.click();
  const featureBox=await feature.boundingBox();
  const questBox=await mainQuest.boundingBox();
  const dockBox=await dock.boundingBox();
  expect(featureBox).not.toBeNull();
  expect(questBox).not.toBeNull();
  expect(dockBox).not.toBeNull();
  // Before the change the separate promo card occupied ~120px (244-364),
  // masking the face. Keep this as one compact but usable contract shortcut.
  expect(featureBox!.height).toBeLessThanOrEqual(76);
  expect(featureBox!.height).toBeGreaterThanOrEqual(44);
  expect(featureBox!.y+featureBox!.height).toBeLessThanOrEqual(328);
  expect(questBox!.y+questBox!.height).toBeLessThanOrEqual(featureBox!.y+2);
  expect(dockBox!.width).toBeLessThanOrEqual(50);
  expect(dockBox!.x).toBeGreaterThanOrEqual(290);
  expect(dockBox!.x+dockBox!.width).toBeLessThanOrEqual(390);
  expect(dockBox!.y).toBeLessThan(110);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)).toBeLessThanOrEqual(1);

  mkdirSync('visual-evidence/lobby',{recursive:true});
  await page.screenshot({path:'visual-evidence/lobby/mobile-art-clearance-390.png',animations:'disabled',fullPage:false});
  await feature.click();
  await expect(page).toHaveURL(/\/characters\/?#summon-screen$/);
  await expect(page.getByTestId('gothic-summon-stage')).toBeVisible();

  // The approved PC design retains its large first-contract art feature.
  await page.setViewportSize({width:1440,height:900});
  await page.goto('/',{waitUntil:'domcontentloaded'});
  await expect(feature).toBeVisible();
  const desktopFeature=await feature.boundingBox();
  const desktopDock=await dock.boundingBox();
  expect(desktopFeature!.height).toBeGreaterThanOrEqual(200);
  expect(desktopDock!.width).toBeLessThanOrEqual(250);
  expect(desktopDock!.x).toBeGreaterThanOrEqual(950);
  expect(desktopDock!.y).toBeLessThan(105);
  await page.screenshot({path:'visual-evidence/lobby/desktop-art-clearance-1440.png',animations:'disabled',fullPage:false});
});
