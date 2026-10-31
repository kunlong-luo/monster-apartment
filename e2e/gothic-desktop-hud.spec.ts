import {expect,test} from '@playwright/test';

test('PC HUD keeps seven icon destinations and compact summon actions',async({page})=>{
  await page.setViewportSize({width:1440,height:900});
  await page.goto('/');
  const dock=page.getByRole('navigation',{name:'主要游戏功能'});
  await expect(dock.getByRole('link')).toHaveCount(7);
  await expect(dock.locator('svg')).toHaveCount(7);
  const box=await dock.boundingBox();
  expect(box).not.toBeNull();
  expect(box!.width).toBeGreaterThan(1300);
  expect(box!.width).toBeLessThan(1430);
  expect(Math.abs(box!.x-(1440-box!.width)/2)).toBeLessThan(3);
  await expect(page.getByRole('button',{name:'切换动态特效'}).locator('svg')).toBeVisible();
  await page.addStyleTag({content:'nextjs-portal{display:none!important}'});
  const rail=page.locator('.gothic-lobby__mission-rail');
  await expect(rail.locator('a')).toHaveCount(2);
  await expect(page.getByTestId('gothic-lobby-message-board')).toBeVisible();
  await expect(page.getByRole('button',{name:'查看全部公寓动态'})).toBeVisible();
  await expect(page.getByTestId('gothic-right-summon')).toBeVisible();
  await expect(page.getByTestId('gothic-right-memories')).toBeVisible();
  const inbox=page.getByRole('button',{name:'委托消息'});
  await expect(inbox).toBeVisible();
  await expect(inbox).toContainText('待交付');
  const mainCard=await page.getByTestId('gothic-main-quest').boundingBox();
  const summonCard=await page.getByTestId('gothic-eclipse-feature').boundingBox();
  const dockBounds=await dock.boundingBox();
  expect(mainCard).not.toBeNull();expect(summonCard).not.toBeNull();
  expect(summonCard!.y).toBeGreaterThan(mainCard!.y+mainCard!.height);
  expect(summonCard!.y+summonCard!.height).toBeLessThan(dockBounds!.y-180);
  const news=await page.getByTestId('gothic-lobby-message-board').boundingBox();
  const actions=await page.locator('.gothic-lobby__character-actions').boundingBox();
  expect(news).not.toBeNull();expect(actions).not.toBeNull();
  expect(news!.y).toBeGreaterThan(summonCard!.y+summonCard!.height);
  expect(news!.y+news!.height).toBeLessThan(dockBounds!.y);
  expect(actions!.y+actions!.height).toBeLessThan(dockBounds!.y-15);
  expect(actions!.x).toBeGreaterThan(1440*.82);
  const palette=await page.getByTestId('gothic-lobby').evaluate(el=>{
    const c=getComputedStyle(el);
    const card=getComputedStyle(el.querySelector<HTMLElement>('.gothic-lobby__mission-card--quest')!);
    return {brass:c.getPropertyValue('--craft-brass').trim(),
      ivory:c.getPropertyValue('--craft-ivory').trim(),
      panel:card.backgroundImage,shadow:card.boxShadow};
  });
  expect(palette.brass).toBe('#a68d70');
  expect(palette.ivory).toBe('#f1e5d6');
  expect(palette.panel).toContain('linear-gradient');
  expect(palette.shadow).not.toBe('none');
  const painting=page.getByTestId('gothic-lobby-painting-image');
  await expect.poll(()=>painting.evaluate(img=>(img as HTMLImageElement).naturalWidth)).toBeGreaterThan(1200);
  await page.addStyleTag({content:'nextjs-portal{display:none!important}'});
  await page.screenshot({path:'test-results/desktop-lobby-v377.png',animations:'disabled'});
  // The canonical Characters destination intentionally opens the gallery.
  // A hash selects the summon stage without creating an eighth route.
  await dock.getByRole('link',{name:/角色/}).click();
  await expect(page.getByTestId('moonwork-world')).toBeVisible();
  await page.goto('/characters/#summon-screen');
  await expect(page.getByTestId('gothic-summon-stage')).toBeVisible({timeout:20000});
  const summonPalette=await page.locator('.summon-cinematic').evaluate(el=>
    getComputedStyle(el).getPropertyValue('--craft-brass').trim());
  expect(summonPalette).toBe('#a68d70');
  const summonDock=page.getByRole('navigation',{name:'月影契约世界导航'});
  await expect(summonDock.locator('svg')).toHaveCount(7);
  await expect(page.getByTestId('collection-summon').locator('svg')).toHaveCount(2);
  await expect(page.getByTestId('collection-summon-ten').locator('svg')).toHaveCount(2);
  await page.addStyleTag({content:'nextjs-portal{display:none!important}'});
  await page.screenshot({path:'test-results/desktop-summon-v377.png',animations:'disabled'});
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
  await page.screenshot({path:'test-results/mobile-lobby-v377.png',animations:'disabled'});
});

test('desktop reference has functional story recap and contract tile',async({page})=>{
  await page.setViewportSize({width:1440,height:900});
  await page.goto('/');
  await expect(page.getByTestId('gothic-lobby-message-board')).toContainText('晶核库存');
  await page.getByTestId('gothic-right-memories').click();
  const dialog=page.getByRole('dialog',{name:'剧情回顾'});
  await expect(dialog).toBeVisible();
  await expect(page.getByTestId('gothic-memories-content')).toContainText('累计完成');
  await page.getByRole('button',{name:'关闭面板'}).click();
  await page.getByTestId('gothic-right-summon').click();
  await expect(page).toHaveURL(/\/characters\/?#summon-screen$/);
  await expect(page.getByTestId('gothic-summon-stage')).toBeVisible();
});


test('all seven canonical game pages inherit the same design palette and selected nav material',async({page})=>{
  test.setTimeout(140000);
  await page.setViewportSize({width:1440,height:900});
  const pages=[
    {path:'/',name:'lobby'},
    {path:'/apartment/',name:'apartment'},
    {path:'/workshop/',name:'workshop'},
    {path:'/town/',name:'town'},
    {path:'/orders/',name:'orders'},
    {path:'/characters/',name:'characters'},
    {path:'/warehouse/',name:'warehouse'},
  ] as const;
  for(const entry of pages){
    await page.goto(entry.path);
    await expect.poll(()=>page.evaluate(()=>{
      const c=getComputedStyle(document.documentElement);
      return c.getPropertyValue('--craft-brass').trim();
    }),{timeout:15000}).toBe('#a68d70');
    const palette=await page.evaluate(()=>{
      const c=getComputedStyle(document.documentElement);
      const probe=document.createElement('span');
      probe.style.color='var(--moon-ui-text)';
      document.body.append(probe);
      const legacyColor=getComputedStyle(probe).color;
      probe.remove();
      return {
        metal:c.getPropertyValue('--craft-champagne').trim(),
        panel:c.getPropertyValue('--craft-panel').trim(),
        legacy:c.getPropertyValue('--moon-ui-text').trim(),
        legacyColor
      };
    });
    expect(palette.metal).toBe('#d9c2a1');
    expect(palette.panel).toBe('#1b161d');
    expect(['var(--craft-ivory)','#f1e5d6']).toContain(palette.legacy);
    expect(palette.legacyColor).toBe('rgb(241, 229, 214)');
    // Images and canvas must be genuinely ready; gradients alone are not art.
    if(entry.name==='characters'){
      await expect(page.locator('.mw-worker-portrait-photo')).toHaveCount(3);
      await expect.poll(()=>page.locator('.mw-worker-portrait-photo').evaluateAll(imgs=>
        imgs.every(img=>(img as HTMLImageElement).complete&&(img as HTMLImageElement).naturalWidth>0)
      )).toBe(true);
    }
    if(entry.name==='town'){
      await expect.poll(()=>page.getByTestId('town-guide-painting').evaluate(img=>
        (img as HTMLImageElement).complete&&(img as HTMLImageElement).naturalWidth>0
      )).toBe(true);
    }
    if(entry.name==='workshop'){
      await expect(page.locator('#root.lab.gothic-workshop'))
        .toHaveAttribute('data-runtime-ready','true',{timeout:30000});
      await expect(page.locator('#stage canvas')).toBeVisible();
    }
    // Only design tokens and initial media readiness are checked, not 7 exhaustive E2Es.
    await page.addStyleTag({content:'nextjs-portal{display:none!important}'});
    await page.screenshot({path:'test-results/desktop-design-'+entry.name+'-v377.png',animations:'disabled'});
  }
});
