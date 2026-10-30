import {test,expect} from '@playwright/test';
test('PC workshop roster is readable and has one real button per worker',async({page})=>{
  await page.setViewportSize({width:1440,height:900});
  await page.goto('/workshop/');
  await expect(page.getByTestId('workshop-console')).toBeVisible({timeout:30000});
  await expect(page.getByTestId('console-roster')).toBeVisible();
  await expect(page.getByTestId('v2-worker-brook')).toBeVisible();
  await expect(page.locator('#actions.options > button')).toHaveCount(3);
  await expect(page.locator('#actions.options button button')).toHaveCount(0);
  await expect(page.getByTestId('workshop-auto-assign')).toBeVisible();
  await expect(page.locator('.worker-miniature img')).toHaveCount(3);
  await expect.poll(()=>page.locator('.worker-miniature img').evaluateAll(images=>
    images.every(image=>(image as HTMLImageElement).complete &&
      (image as HTMLImageElement).naturalWidth>0)
  )).toBe(true);
  await expect(page.getByTestId('v2-shift')).toBeVisible();
  await page.screenshot({path:'test-results/desktop-workshop-v366.png',animations:'disabled'});
});
test('PC apartment doors and town portals use structured icons without clipping',async({page})=>{
  await page.setViewportSize({width:1440,height:900});
  await page.goto('/apartment/');
  await expect(page.getByTestId('gothic-apartment')).toBeVisible();
  await expect(page.locator('.ga-door')).toHaveCount(6);
  await expect(page.locator('.ga-door svg')).toHaveCount(6);
  await page.getByTestId('ga-room-0').click();
  await expect(page.getByTestId('ga-room-drawer')).toBeVisible();
  await page.screenshot({path:'test-results/desktop-apartment-v366.png',animations:'disabled'});
  await page.goto('/town/');
  await expect(page.getByTestId('moonlit-town-scene')).toBeVisible();
  await expect(page.locator('.mw-town-portal svg')).toHaveCount(3);
  await expect(page.getByTestId('town-resident')).toBeVisible();
  // Next.js production/dev asset URLs include a content hash before .webp.
  await expect(page.getByTestId('town-painting')).toHaveAttribute('src',/world-cover\.[^/]+\.webp/);
  await expect(page.getByTestId('town-guide-painting')).toHaveAttribute('src',/yuesha-portrait-v3\.[^/]+\.webp/);
  await expect.poll(()=>page.locator('[data-testid="town-painting"],[data-testid="town-guide-painting"]')
    .evaluateAll(images=>images.length===2&&images.every(image=>
      (image as HTMLImageElement).complete&&(image as HTMLImageElement).naturalWidth>0
    ))).toBe(true);
  await page.screenshot({path:'test-results/desktop-town-v366.png',animations:'disabled'});
});
