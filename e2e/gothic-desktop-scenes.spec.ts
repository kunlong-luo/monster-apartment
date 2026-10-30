import {test,expect} from '@playwright/test';
test('PC workshop roster is readable and has one real button per worker',async({page})=>{
  await page.setViewportSize({width:1440,height:900});
  await page.goto('/workshop/');
  await expect(page.getByTestId('workshop-console')).toBeVisible({timeout:30000});
  // A painted black placeholder is not a successful Pixi game stage.
  await expect(page.locator('#root.lab.gothic-workshop'))
    .toHaveAttribute('data-runtime-ready','true',{timeout:30000});
  await expect(page.locator('#stage canvas')).toBeVisible();
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
  const lastWorker=await page.getByTestId('v2-worker-cinder').boundingBox();
  const roster=await page.getByTestId('console-roster').boundingBox();
  expect(lastWorker).not.toBeNull();
  expect(roster).not.toBeNull();
  expect(lastWorker!.y+lastWorker!.height).toBeLessThanOrEqual(roster!.y+roster!.height-5);
  const crewPositions=await page.locator('#actions.options > button').evaluateAll(buttons=>
    buttons.map(button=>({x:button.getBoundingClientRect().x,y:button.getBoundingClientRect().y})));
  expect(crewPositions[0].x).toBeLessThan(crewPositions[1].x);
  expect(crewPositions[1].x).toBeLessThan(crewPositions[2].x);
  expect(Math.abs(crewPositions[0].y-crewPositions[2].y)).toBeLessThan(3);
  await page.addStyleTag({content:'nextjs-portal{display:none!important}'});
  await page.screenshot({path:'test-results/desktop-workshop-v368.png',animations:'disabled'});
});
test('PC apartment doors and town portals use structured icons without clipping',async({page})=>{
  await page.setViewportSize({width:1440,height:900});
  await page.goto('/apartment/');
  await expect(page.getByTestId('gothic-apartment')).toBeVisible();
  await expect(page.locator('.ga-door')).toHaveCount(6);
  await expect(page.locator('.ga-door svg')).toHaveCount(6);
  await page.getByTestId('ga-room-0').click();
  await expect(page.getByTestId('ga-room-drawer')).toBeVisible();
  await page.addStyleTag({content:'nextjs-portal{display:none!important}'});
  await page.screenshot({path:'test-results/desktop-apartment-v368.png',animations:'disabled'});
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
  await page.addStyleTag({content:'nextjs-portal{display:none!important}'});
  await page.screenshot({path:'test-results/desktop-town-v368.png',animations:'disabled'});
});

test('four PC private suites render independent portrait layers without changing scene hotspots',async({page})=>{
  await page.setViewportSize({width:1440,height:900});
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto('/characters/');
  for(const id of ['brook','fern','cinder'] as const){
    await page.getByTestId('visit-worker-room-'+id).click();
    const stage=page.getByTestId('worker-room-stage');
    await expect(stage).toBeVisible();
    await expect(page.getByTestId('room-scene-backdrop')).toHaveAttribute('data-art-quality','concept');
    const portrait=page.getByTestId('room-portrait-cameo-'+id).locator('img');
    await expect(portrait).toBeVisible();
    await expect.poll(()=>portrait.evaluate(img=>img instanceof HTMLImageElement&&img.complete&&img.naturalWidth>0)).toBe(true);
    await expect(stage.locator('[data-marker-layout="compact"]')).toHaveCount(3);
    await page.addStyleTag({content:'nextjs-portal{display:none!important}'});
    await page.screenshot({path:'test-results/desktop-room-'+id+'-v369.png',animations:'disabled'});
    await page.keyboard.press('Escape');
    await expect(page.getByTestId('worker-private-room-'+id)).toHaveCount(0);
  }
  await page.goto('/apartment/?visit=yuesha');
  await expect(page.getByTestId('yuesha-private-room')).toBeVisible();
  await expect(page.getByTestId('room-scene-backdrop')).toHaveAttribute('data-art-quality','concept');
  await expect(page.getByTestId('room-resident-present-yuesha').locator('img')).toBeVisible();
  await page.screenshot({path:'test-results/desktop-room-yuesha-v369.png',animations:'disabled'});
});
