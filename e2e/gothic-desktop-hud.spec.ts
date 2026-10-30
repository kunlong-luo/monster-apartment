import {expect,test} from '@playwright/test';

test('PC HUD keeps seven icon destinations and compact summon actions',async({page})=>{
  await page.setViewportSize({width:1440,height:900});
  await page.goto('/');
  const dock=page.getByRole('navigation',{name:'主要游戏功能'});
  await expect(dock.getByRole('link')).toHaveCount(7);
  await expect(dock.locator('svg')).toHaveCount(7);
  const box=await dock.boundingBox();
  expect(box).not.toBeNull();
  expect(box!.width).toBeGreaterThan(850);
  expect(box!.width).toBeLessThan(1100);
  expect(Math.abs(box!.x-(1440-box!.width)/2)).toBeLessThan(3);
  await expect(page.getByRole('button',{name:'切换动态特效'}).locator('svg')).toBeVisible();
  await page.screenshot({path:'test-results/desktop-lobby-v366.png',animations:'disabled'});
  await dock.getByRole('link',{name:/角色/}).click();
  await expect(page.getByTestId('gothic-summon-stage')).toBeVisible();
  const summonDock=page.getByRole('navigation',{name:'月影契约世界导航'});
  await expect(summonDock.locator('svg')).toHaveCount(7);
  await expect(page.getByTestId('collection-summon').locator('svg')).toHaveCount(2);
  await expect(page.getByTestId('collection-summon-ten').locator('svg')).toHaveCount(2);
  await page.screenshot({path:'test-results/desktop-summon-v366.png',animations:'disabled'});
});
