import {expect,test} from '@playwright/test';

for(const viewport of [{width:320,height:700},{width:390,height:844}]){
  test(`compact scene navigation stays in frame and reaches workshop at ${viewport.width}px`,async({page})=>{
    test.setTimeout(110_000);
    await page.setViewportSize(viewport);
    await page.goto('/town/');
    const launcher=page.getByTestId('scene-navigation');
    const toggle=page.getByTestId('scene-navigation-toggle');
    await expect(launcher).toBeVisible();
    await expect(page.locator('.gothic-dock-bar')).toHaveCount(0);
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded','true');
    const panel=page.getByTestId('scene-navigation-panel');
    const map=page.getByRole('navigation',{name:'游戏七个正式地点'});
    await expect(map.getByRole('link')).toHaveCount(7);
    await expect(map.locator('[aria-current="page"]')).toHaveAttribute('data-destination','/town/');
    const frame=await panel.boundingBox();
    expect(frame).not.toBeNull();
    expect(frame!.x).toBeGreaterThanOrEqual(0);
    expect(frame!.y).toBeGreaterThanOrEqual(0);
    expect(frame!.x+frame!.width).toBeLessThanOrEqual(viewport.width+1);
    expect(frame!.y+frame!.height).toBeLessThanOrEqual(viewport.height+1);
    await page.keyboard.press('Escape');
    await expect(panel).toHaveCount(0);
    await expect(toggle).toHaveAttribute('aria-expanded','false');
    await expect(toggle).toBeFocused();
    await toggle.click();
    await map.locator('[data-destination="/workshop/"]').click();
    await expect(page).toHaveURL(/\/workshop\/?$/);
    await expect(launcher).toHaveAttribute('data-current-route','/workshop/');
    await expect(panel).toHaveCount(0);
    const shift=page.getByTestId('v2-shift');
    await expect(shift).toBeVisible({timeout:30000});
    await expect.poll(()=>shift.evaluate(el=>{
      const b=el.getBoundingClientRect();
      return document.elementFromPoint(b.x+b.width/2,b.y+b.height/2)?.closest('[data-testid="v2-shift"]')===el;
    })).toBe(true);
    await shift.click();
    await expect(page.getByTestId('v2-day')).toHaveText('2');
  });
}

test('gallery art viewer hides the map and summon can return to the gallery',async({page})=>{
  test.setTimeout(90_000);
  await page.setViewportSize({width:390,height:844});
  await page.goto('/characters/');
  const launcher=page.getByTestId('scene-navigation');
  await expect(launcher).toBeVisible();
  await page.getByRole('button',{name:'欣赏立绘'}).click();
  await expect(page.getByTestId('a05-art-viewer')).toBeVisible();
  await expect(launcher).toBeHidden();
  await page.getByRole('button',{name:'关闭面板'}).click();
  await expect(launcher).toBeVisible();
  await page.goto('/characters/#summon-screen');
  await expect(page.getByTestId('gothic-summon-stage')).toBeVisible();
  await page.getByTestId('scene-navigation-toggle').click();
  await page.getByRole('navigation',{name:'游戏七个正式地点'})
    .locator('[data-destination="/characters/"]').click();
  await expect(page.getByTestId('painted-worker-gallery')).toBeVisible();
  await expect(page.getByTestId('scene-navigation-panel')).toHaveCount(0);
});
