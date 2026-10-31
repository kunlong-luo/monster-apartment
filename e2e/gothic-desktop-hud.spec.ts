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
  await page.addStyleTag({content:'nextjs-portal{display:none!important}'});
  const rail=page.locator('.gothic-lobby__mission-rail');
  await expect(rail.locator('a')).toHaveCount(2);
  await expect(rail.locator('button')).toHaveCount(0);
  const inbox=page.getByRole('button',{name:'委托消息'});
  await expect(inbox).toBeVisible();
  await expect(inbox).toContainText('待交付');
  const mainCard=await page.getByTestId('gothic-main-quest').boundingBox();
  const summonCard=await page.getByTestId('gothic-eclipse-feature').boundingBox();
  const dockBounds=await dock.boundingBox();
  expect(mainCard).not.toBeNull();expect(summonCard).not.toBeNull();
  expect(summonCard!.y).toBeGreaterThan(mainCard!.y+mainCard!.height);
  expect(summonCard!.y+summonCard!.height).toBeLessThan(dockBounds!.y-80);
  const painting=page.getByTestId('gothic-lobby-painting-image');
  await expect.poll(()=>painting.evaluate(img=>(img as HTMLImageElement).naturalWidth)).toBeGreaterThan(1200);
  await page.addStyleTag({content:'nextjs-portal{display:none!important}'});
  await page.screenshot({path:'test-results/desktop-lobby-v374.png',animations:'disabled'});
  // The canonical Characters destination intentionally opens the gallery.
  // A hash selects the summon stage without creating an eighth route.
  await dock.getByRole('link',{name:/角色/}).click();
  await expect(page.getByTestId('moonwork-world')).toBeVisible();
  await page.goto('/characters/#summon-screen');
  await expect(page.getByTestId('gothic-summon-stage')).toBeVisible({timeout:20000});
  const summonDock=page.getByRole('navigation',{name:'月影契约世界导航'});
  await expect(summonDock.locator('svg')).toHaveCount(7);
  await expect(page.getByTestId('collection-summon').locator('svg')).toHaveCount(2);
  await expect(page.getByTestId('collection-summon-ten').locator('svg')).toHaveCount(2);
  await page.addStyleTag({content:'nextjs-portal{display:none!important}'});
  await page.screenshot({path:'test-results/desktop-summon-v368.png',animations:'disabled'});
});

test('mobile lobby shows exactly two storyline entries with a working small inbox',async({page})=>{
  await page.setViewportSize({width:390,height:844});
  await page.goto('/');
  await expect(page.getByTestId('gothic-lobby')).toBeVisible();
  await expect(page.locator('.gothic-lobby__mission-rail>a')).toHaveCount(2);
  const inbox=page.getByRole('button',{name:'委托消息'});
  await expect(inbox).toBeVisible();
  await inbox.click();
  const dialog=page.getByRole('dialog',{name:'委托消息'});
  await expect(dialog).toBeVisible();
  await page.getByRole('button',{name:'关闭面板'}).click();
  await expect(dialog).toHaveCount(0);
  const dock=page.getByRole('navigation',{name:'主要游戏功能'});
  await expect(dock.getByRole('link')).toHaveCount(7);
  const issues=await page.evaluate(()=>({
    x:document.documentElement.scrollWidth-window.innerWidth,
    y:document.documentElement.scrollHeight-window.innerHeight,
  }));
  expect(issues.x).toBeLessThanOrEqual(2);expect(issues.y).toBeLessThanOrEqual(2);
  const rail=await page.locator('.gothic-lobby__mission-rail').boundingBox();
  const footer=await dock.boundingBox();
  expect(rail!.y+rail!.height).toBeLessThan(footer!.y);
  const actions=await page.locator('.gothic-lobby__character-actions').boundingBox();
  expect(actions).not.toBeNull();
  // Mobile heroine's face sits around the 30–52% band: keep action HUD below it.
  expect(actions!.y).toBeGreaterThan(844*.55);
  expect(actions!.y+actions!.height).toBeLessThan(footer!.y-20);
  expect(actions!.width).toBeLessThan(85);
  await page.addStyleTag({content:'nextjs-portal{display:none!important}'});
  await page.screenshot({path:'test-results/mobile-lobby-v374.png',animations:'disabled'});
});
