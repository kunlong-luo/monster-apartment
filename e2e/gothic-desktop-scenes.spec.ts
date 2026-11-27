import {test,expect} from '@playwright/test';
test('PC workshop roster is readable and has one real button per worker',async({page})=>{
  await page.setViewportSize({width:1440,height:900});
  await page.goto('/workshop/');
  await expect(page.getByTestId('workshop-console')).toBeVisible({timeout:30000});
  // A painted black placeholder is not a successful Pixi game stage.
  await expect(page.locator('#root.lab.gothic-workshop'))
    .toHaveAttribute('data-runtime-ready','true',{timeout:30000});
  await expect(page.locator('#stage canvas')).toBeVisible();
  // R01 keeps the scene visually unobstructed until scheduling is requested.
  await expect(page.getByTestId('console-roster')).toBeHidden();
  await page.getByTestId('workshop-stage-layout-toggle').click();
  await expect(page.getByTestId('next-workshop-shell')).toHaveAttribute('data-console-layout','expanded');
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
  await expect(page.locator('.ga-door')).toHaveCount(4);
  await expect(page.locator('.ga-door svg')).toHaveCount(4);
  await page.getByTestId('ga-room-0').click();
  await expect(page.getByTestId('yuesha-private-room')).toBeVisible();
  await page.addStyleTag({content:'nextjs-portal{display:none!important}'});
  await page.screenshot({path:'test-results/desktop-apartment-v368.png',animations:'disabled'});
  await page.goto('/town/');
  await expect(page.getByTestId('moonlit-town-scene')).toBeVisible();
  await expect(page.locator('.mw-town-portal svg')).toHaveCount(3);
  await expect(page.getByTestId('town-resident')).toBeVisible();
  // Town art is a real location, NOT an unrelated three-woman brand cover.
  // Next.js static image URLs include a content hash before .webp.
  const townPainting=page.getByTestId('town-painting');
  await expect.poll(()=>townPainting.evaluate((img:HTMLImageElement)=>img.currentSrc)).toContain('town-desktop-transition');
  await expect(townPainting).toHaveJSProperty('naturalWidth',1671);
  await expect(townPainting).toHaveJSProperty('naturalHeight',941);
  await expect(page.locator('.mw-town-scene-credit')).toContainText('过渡绘景');
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
  await page.addStyleTag({content:'nextjs-portal{display:none!important}'});
  await page.screenshot({path:'test-results/desktop-room-yuesha-v369.png',animations:'disabled'});
});

test('mobile town keeps the existing artwork and all real destination links',async({page})=>{
  await page.setViewportSize({width:390,height:844});
  await page.goto('/town/');
  const painting=page.getByTestId('town-painting');
  await expect.poll(()=>painting.evaluate((img:HTMLImageElement)=>img.currentSrc)).toContain('town-moonlit-gate');
  await expect.poll(()=>painting.evaluate((img:HTMLImageElement)=>img.naturalWidth)).toBeGreaterThan(0);
  for(const [label,path] of [['晶核工坊','/workshop/'],['月夜委托所','/orders/'],['物资仓库','/warehouse/']]){
    const link=page.getByRole('navigation',{name:'月光街建筑入口'}).getByRole('link',{name:label,exact:true});
    await expect(link).toBeVisible();
    const pathname=await link.evaluate((el:HTMLAnchorElement)=>new URL(el.href).pathname.replace(/\/$/,''));
    expect(pathname.endsWith(path.replace(/\/$/,''))).toBe(true);
    await link.click();
    await expect.poll(()=>new URL(page.url()).pathname.replace(/\/$/,''))
      .toBe(pathname);
    await page.goto('/town/');
  }
});

test('R13.1-F operations retain readable facts, bounded panels and reachable actions',async({page})=>{
  test.setTimeout(90_000);
  for(const viewport of [{width:1440,height:900},{width:390,height:844}]){
    await page.setViewportSize(viewport);
    for(const area of ['orders','warehouse'] as const){
      await page.goto('/'+area+'/');
      const world=page.getByTestId('moonwork-world');
      const grid=world.locator('.mw-operation-grid');
      await expect(grid).toBeVisible();
      const primary=grid.locator('.mw-panel').first();
      const action=area==='orders'?primary.getByRole('link',{name:'前往工坊调整产线'}):
        primary.getByRole('link',{name:'查看委托与交期 ↗'});
      const facts=page.getByTestId(area==='orders'?'order-primary-facts':'warehouse-stock-grid');
      await expect(facts).toBeVisible();
      const metrics=await grid.evaluate(el=>{
        const panel=el.querySelector<HTMLElement>('.mw-panel')!;
        const p=panel.querySelector('p')!;
        const shell=el.closest<HTMLElement>('.mw-main--red-gold')!;
        return {gap:parseFloat(getComputedStyle(el).rowGap),
          padding:parseFloat(getComputedStyle(panel).paddingLeft),
          text:parseFloat(getComputedStyle(p).fontSize),
          panelOverflow:shell.scrollWidth-shell.clientWidth,
          pageOverflow:document.documentElement.scrollWidth-innerWidth,
          width:shell.getBoundingClientRect().width};
      });
      expect(metrics.gap).toBeGreaterThanOrEqual(16);
      expect(metrics.padding).toBeGreaterThanOrEqual(viewport.width===1440?20:14);
      // The existing 40px primary stock counter is also valid.
      expect(metrics.text).toBeGreaterThanOrEqual(14);
      expect(metrics.panelOverflow).toBeLessThanOrEqual(2);
      expect(metrics.pageOverflow).toBeLessThanOrEqual(2);
      if(viewport.width===1440)expect(metrics.width).toBeLessThanOrEqual(600);
      await action.scrollIntoViewIfNeeded();
      expect((await action.boundingBox())!.height).toBeGreaterThanOrEqual(44);
      await expect(action).toBeInViewport();
      await page.screenshot({path:'test-results/desktop-operations-'+area+'-'+viewport.width+'.png',animations:'disabled'});
    }
  }
});

test('R13.1-G town keeps the street painting, larger guide and readable actual trades',async({page})=>{
  await page.setViewportSize({width:1440,height:900});
  await page.goto('/town/');
  const resident=page.getByTestId('town-resident');
  const market=page.getByTestId('moonlit-market');
  await expect(resident).toBeVisible();
  const art=page.getByTestId('town-painting');
  await expect.poll(()=>art.evaluate(el=>(el as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
  const guide=page.getByTestId('town-guide-painting');
  await expect.poll(()=>guide.evaluate(el=>(el as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
  const dimensions=await resident.evaluate(el=>{
    const portrait=el.querySelector<HTMLElement>('.mw-resident-character')!;
    const action=el.querySelector('button')!;
    const shell=el.closest<HTMLElement>('.mw-main--red-gold')!;
    return {portraitWidth:portrait.getBoundingClientRect().width,
      gap:parseFloat(getComputedStyle(el).columnGap),
      padding:parseFloat(getComputedStyle(el).paddingLeft),
      actionHeight:action.getBoundingClientRect().height,
      panelOverflow:shell.scrollWidth-shell.clientWidth,
      pageOverflow:document.documentElement.scrollWidth-innerWidth};
  });
  expect(dimensions.portraitWidth).toBeGreaterThanOrEqual(132);
  expect(dimensions.gap).toBeGreaterThanOrEqual(16);
  expect(dimensions.padding).toBeGreaterThanOrEqual(18);
  expect(dimensions.actionHeight).toBeGreaterThanOrEqual(44);
  expect(dimensions.panelOverflow).toBeLessThanOrEqual(2);
  expect(dimensions.pageOverflow).toBeLessThanOrEqual(2);
  await page.screenshot({path:'test-results/desktop-town-spacious-1440.png',animations:'disabled'});
  for(const kind of ['water','fiber','core']){
    const action=market.getByTestId('town-offer-'+kind).getByRole('button');
    await action.scrollIntoViewIfNeeded();
    await expect(action).toBeInViewport();
    expect((await action.boundingBox())!.height).toBeGreaterThanOrEqual(44);
  }
  await page.screenshot({path:'test-results/desktop-town-market-1440.png',animations:'disabled'});
  await page.setViewportSize({width:390,height:844});
  await page.goto('/town/');
  await expect(page.getByTestId('town-resident')).toBeVisible();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)).toBeLessThanOrEqual(2);
  await page.screenshot({path:'test-results/desktop-town-mobile-390.png',animations:'disabled'});
});
