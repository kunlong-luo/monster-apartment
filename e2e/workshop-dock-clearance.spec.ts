import {expect,test} from '@playwright/test';

// Regression: the floating world dock must never intercept the real factory
// action row. We test the actual hit target instead of force-clicking past it.
for (const viewport of [{width:1440,height:900},{width:390,height:844}]) {
  test(`workshop shift is uncovered by the dock at ${viewport.width}px`,async({page})=>{
    test.setTimeout(90_000);
    await page.setViewportSize(viewport);
    await page.goto('/workshop/');
    await expect(page.locator('#root')).toHaveAttribute('data-runtime-ready','true',{timeout:30_000});
    const shift=page.getByTestId('v2-shift');
    const dock=page.getByTestId('v2-world-nav');
    await expect(shift).toBeVisible();
    await expect(dock).toBeVisible();
    const bounds=await page.evaluate(()=>{
      const nav=document.querySelector('[data-testid="v2-world-nav"]')!.getBoundingClientRect();
      const console=document.querySelector('[data-testid="workshop-console"]')!.getBoundingClientRect();
      const actions=document.querySelector('[data-testid="workshop-quick-actions"]')!.getBoundingClientRect();
      const button=document.querySelector('[data-testid="v2-shift"]')!.getBoundingClientRect();
      const hit=document.elementFromPoint(button.left+button.width/2,button.top+button.height/2);
      return {gap:nav.top-console.bottom,actionGap:nav.top-actions.bottom,
        clickable:hit?.closest('[data-testid="v2-shift"]')!==null};
    });
    expect(bounds.gap).toBeGreaterThanOrEqual(8);
    expect(bounds.actionGap).toBeGreaterThanOrEqual(8);
    expect(bounds.clickable).toBe(true);
    await shift.click();
    await expect(page.getByTestId('v2-day')).toHaveText('2');
  });
}
