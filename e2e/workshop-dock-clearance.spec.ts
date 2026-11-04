import {expect,test} from '@playwright/test';

// The smaller persistent scene launcher must not steal the real factory shift
// button hit target at either PC or mobile widths.
for (const viewport of [{width:1440,height:900},{width:390,height:844}]) {
  test(`workshop shift is uncovered by scene navigation at ${viewport.width}px`,async({page})=>{
    test.setTimeout(90_000);
    await page.setViewportSize(viewport);
    await page.goto('/workshop/');
    await expect(page.locator('#root')).toHaveAttribute('data-runtime-ready','true',{timeout:30_000});
    const shift=page.getByTestId('v2-shift');
    const nav=page.getByTestId('scene-navigation');
    await expect(shift).toBeVisible();
    await expect(nav).toBeVisible();
    await expect(page.getByTestId('v2-world-nav')).toHaveCount(0);
    const bounds=await page.evaluate(()=>{
      const nav=document.querySelector('[data-testid="scene-navigation"]')!.getBoundingClientRect();
      const button=document.querySelector('[data-testid="v2-shift"]')!.getBoundingClientRect();
      const hit=document.elementFromPoint(button.left+button.width/2,button.top+button.height/2);
      return {
        launcherWidth:nav.width,
        room:innerWidth-nav.width,
        clickable:hit?.closest('[data-testid="v2-shift"]')!==null
      };
    });
    expect(bounds.launcherWidth).toBeLessThan(190);
    expect(bounds.room).toBeGreaterThan(130);
    expect(bounds.clickable).toBe(true);

    // The obsolete 7-button dock must not leave a 108px/84px empty band.
    // Reserve only the compact map height, keeping the production buttons
    // physically clear of the launcher while restoring height to the canvas.
    const geometry=await page.evaluate(()=>{
      const get=(selector:string)=>document.querySelector<HTMLElement>(selector)!.getBoundingClientRect();
      const nav=get('[data-testid="scene-navigation"]');
      const consolePanel=get('[data-testid="workshop-console"]');
      const canvasStage=get('[data-testid="v2-stage"]');
      const middle=get('#root .middle');
      const root=document.querySelector<HTMLElement>('.gothic-workshop-shell')!;
      return {
        reserved:parseFloat(getComputedStyle(root).getPropertyValue('--workshop-scene-nav-clearance')),
        clearance:nav.top-consolePanel.bottom,
        stageHeight:canvasStage.height,
        middleHeight:middle.height,
        stageEndsAboveConsole:middle.bottom<=consolePanel.top+1,
        horizontalOverflow:document.documentElement.scrollWidth-innerWidth,
      };
    });
    expect(geometry.reserved).toBe(viewport.width<768?60:64);
    expect(geometry.clearance).toBeGreaterThanOrEqual(4);
    expect(geometry.clearance).toBeLessThan(28);
    expect(geometry.middleHeight).toBeGreaterThan(viewport.width<768?230:450);
    expect(geometry.stageHeight).toBeGreaterThan(viewport.width<768?140:350);
    expect(geometry.stageEndsAboveConsole).toBe(true);
    expect(geometry.horizontalOverflow).toBeLessThanOrEqual(2);
    await shift.click();
    await expect(page.getByTestId('v2-day')).toHaveText('2');
  });
}
