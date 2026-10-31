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
  expect(box!.width).toBeLessThan(1010);
  expect(Math.abs(box!.x-(1440-box!.width)/2)).toBeLessThan(3);
  await expect(page.getByRole('button',{name:'切换动态特效'}).locator('svg')).toBeVisible();
  await page.addStyleTag({content:'nextjs-portal{display:none!important}'});
  const rail=page.locator('.gothic-lobby__mission-rail');
  await expect(rail.locator('a')).toHaveCount(2);
  const roster=page.getByTestId('gothic-design-roster');
  await expect(roster).toBeVisible();
  await expect(roster.locator('a')).toHaveCount(4);
  const right=page.getByTestId('gothic-design-right');
  await expect(right).toBeVisible();
  await expect(right.locator('a')).toHaveCount(2);
  // Real, independently staged sources must replace the previously repeated
  // lobby painting on both location cards, not merely recolor the same art.
  const workshopPainting=page.getByTestId('gothic-postcard-workshop-art');
  const streetPainting=page.getByTestId('gothic-postcard-town-art');
  await expect.poll(()=>workshopPainting.evaluate(el=>(el as HTMLImageElement).naturalWidth))
    .toBeGreaterThanOrEqual(960);
  await expect.poll(()=>streetPainting.evaluate(el=>(el as HTMLImageElement).naturalWidth))
    .toBeGreaterThanOrEqual(960);
  const posterSources=await Promise.all([
    workshopPainting.getAttribute('src'),streetPainting.getAttribute('src')
  ]);
  expect(posterSources[0]).toContain('feature-postcards/gothic-workshop.webp');
  expect(posterSources[1]).toContain('feature-postcards/moonlit-street.webp');
  expect(posterSources[0]).not.toBe(posterSources[1]);
  await expect(page.getByTestId('gothic-reference-workshop')).toHaveAttribute('href',/workshop/);
  await expect(page.getByTestId('gothic-reference-town')).toHaveAttribute('href',/town/);
  // Reference 01: people left, true summon banner right, illustrated destinations below.
  await expect(page.getByTestId('gothic-lobby-message-board')).toHaveCount(0);
  await expect(page.getByTestId('gothic-right-summon')).toHaveCount(0);
  await expect(page.getByTestId('gothic-right-memories')).toBeVisible();
  const inbox=page.getByRole('button',{name:'委托消息'});
  await expect(inbox).toBeVisible();
  await expect(inbox).toContainText('待交付');
  const mainCard=await page.getByTestId('gothic-main-quest').boundingBox();
  const summonCard=await page.getByTestId('gothic-eclipse-feature').boundingBox();
  const dockBounds=await dock.boundingBox();
  expect(mainCard).not.toBeNull();expect(summonCard).not.toBeNull();
  expect(mainCard!.x).toBeLessThan(1440*.2);
  expect(summonCard!.x).toBeGreaterThan(1440*.7);
  expect(summonCard!.width).toBeGreaterThan(285);
  expect(summonCard!.y).toBeLessThan(mainCard!.y);
  const people=await roster.boundingBox();
  const postcards=await right.boundingBox();
  expect(people).not.toBeNull();expect(postcards).not.toBeNull();
  expect(people!.x+people!.width).toBeLessThan(1440*.25);
  expect(postcards!.x).toBeGreaterThan(1440*.7);
  expect(people!.y+people!.height).toBeLessThan(dockBounds!.y-120);
  expect(postcards!.y).toBeGreaterThan(summonCard!.y+summonCard!.height);
  expect(postcards!.y+postcards!.height).toBeLessThan(dockBounds!.y-45);
  // The center must be occupied by the scene rather than another overlay panel.
  const message=await page.getByTestId('gothic-character-talk').boundingBox();
  expect(message).not.toBeNull();
  expect(message!.x).toBeGreaterThan(people!.x+people!.width);
  expect(message!.x+message!.width).toBeLessThan(postcards!.x+15);
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
  await expect(page.getByTestId('gothic-design-roster')).toBeHidden();
  await expect(page.getByTestId('gothic-design-right')).toBeHidden();
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
  await expect(page.getByTestId('gothic-main-quest')).toContainText('晶核');
  await expect(page.getByTestId('gothic-eclipse-feature')).toBeVisible();
  await page.getByTestId('gothic-right-memories').click();
  const dialog=page.getByRole('dialog',{name:'剧情回顾'});
  await expect(dialog).toBeVisible();
  await expect(page.getByTestId('gothic-memories-content')).toContainText('累计完成');
  // The recap now has a true scene painting, not only a text dashboard.
  await expect.poll(()=>page.getByTestId('gothic-memories-content').locator('img').evaluate(img=>
    (img as HTMLImageElement).naturalWidth)).toBeGreaterThan(1000);
  await page.getByRole('button',{name:'关闭面板'}).click();
  await page.getByTestId('gothic-character-talk').click();
  await expect(page.getByTestId('gothic-story-dialogue')).toBeVisible();
  await expect.poll(()=>page.getByTestId('gothic-story-dialogue').locator('img').evaluate(img=>
    (img as HTMLImageElement).naturalWidth)).toBeGreaterThan(800);
  await page.getByRole('button',{name:'关闭面板'}).click();
  await page.getByTestId('gothic-eclipse-feature').click();
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

test('private rooms allow full-width scenic inspection and return to saved story controls',async({page})=>{
  await page.setViewportSize({width:1440,height:900});
  await page.goto('/apartment/?visit=yuesha');
  const room=page.getByTestId('yuesha-private-room');
  await expect(room).toBeVisible({timeout:20000});
  await expect(room).toHaveAttribute('data-room-view','story');
  const scene=page.getByTestId('yuesha-room-stage');
  const before=await scene.boundingBox();
  expect(before).not.toBeNull();
  // Source is 16:9; desktop viewport must preserve composition and coordinates.
  expect(Math.abs(before!.width/before!.height-16/9)).toBeLessThan(.045);
  const toggle=page.getByTestId('room-scenic-toggle');
  await expect(toggle).toBeVisible();
  await toggle.click();
  await expect(room).toHaveAttribute('data-room-view','scenic');
  await expect(page.getByTestId('room-story-rail')).toBeHidden();
  await expect(page.locator('[data-hotspot-layout="object-id"]')).toBeHidden();
  await expect(page.getByTestId('room-focus-layer')).toBeHidden();
  await expect(page.getByTestId('room-scene-backdrop')).toBeVisible();
  const after=await scene.boundingBox();
  expect(after).not.toBeNull();
  expect(after!.width).toBeGreaterThan(before!.width*1.2);
  expect(Math.abs(after!.width/after!.height-16/9)).toBeLessThan(.045);
  await toggle.click();
  await expect(room).toHaveAttribute('data-room-view','story');
  await expect(page.getByTestId('room-story-rail')).toBeVisible();
  await expect(page.locator('[data-hotspot-layout="object-id"]')).toBeVisible();
  await expect(page.getByTestId('yuesha-dialogue')).toBeVisible();
});

test('mobile room keeps investigation without an unnecessary scenic-mode button',async({page})=>{
  await page.setViewportSize({width:390,height:844});
  await page.goto('/apartment/?visit=yuesha');
  const room=page.getByTestId('yuesha-private-room');
  await expect(room).toBeVisible({timeout:20000});
  await expect(room).toHaveAttribute('data-room-view','story');
  await expect(page.getByTestId('room-scenic-toggle')).toBeHidden();
  await expect(page.locator('[data-hotspot-layout="object-id"]')).toBeVisible();
  await expect(page.getByTestId('room-story-rail')).toBeVisible();
});

test('review-only room image compares a real 1920x1080 source without changing production art',async({page})=>{
  await page.setViewportSize({width:1440,height:900});
  await page.goto('/apartment/?visit=yuesha&roomArtReview=1');
  await expect(page.getByTestId('yuesha-private-room')).toBeVisible({timeout:20000});
  await expect(page.getByTestId('room-scene-backdrop')).toHaveAttribute('data-art-quality','concept');
  await page.getByTestId('room-art-review-toggle').click();
  await page.getByTestId('room-art-staged-candidate').click();
  await expect(page.getByTestId('room-scene-backdrop')).toHaveAttribute('data-local-preview','true');
  // Unapproved backgrounds must NEVER expose old gameplay hotspots or mutate
  // observation saves using physically incorrect object locations.
  await expect(page.locator('[data-hotspot-layout="object-id"]')).toHaveCount(0);
  await page.getByTestId('room-art-anchor-toggle').click();
  await expect(page.getByTestId('room-art-anchor-editor')).toBeVisible();
  await expect(page.getByTestId('room-art-anchor-export')).toBeDisabled();
  await page.getByTestId('room-art-anchor-canvas').click({position:{x:180,y:180}});
  await expect(page.getByTestId('room-art-anchor-marker-seal')).toBeVisible();
  await expect(page.getByTestId('room-art-anchor-progress')).toContainText('1/3');
  await page.getByTestId('room-art-anchor-toggle').click();
  await expect.poll(()=>page.getByTestId('room-background-frame').locator('img').evaluate(img=>
    (img as HTMLImageElement).naturalWidth)).toBeGreaterThanOrEqual(1920);
  await page.getByTestId('room-art-local-reset').click();
  await expect(page.getByTestId('room-scene-backdrop')).toHaveAttribute('data-local-preview','false');
  await expect(page.locator('[data-hotspot-layout="object-id"]')).toBeVisible();
});

test('PC salon review can compose three separately uploaded transparent props without touching saved investigation',async({page})=>{
  test.setTimeout(60000);
  await page.setViewportSize({width:1440,height:900});
  await page.goto('/apartment/?visit=yuesha&roomArtReview=1');
  await expect(page.getByTestId('yuesha-private-room')).toBeVisible({timeout:20000});
  await page.getByTestId('room-art-review-toggle').click();
  await page.getByTestId('room-art-staged-candidate').click();
  await expect(page.getByTestId('room-art-composite-export')).toBeDisabled();
  await expect(page.locator('[data-hotspot-layout="object-id"]')).toHaveCount(0);
  const data=await page.evaluate(()=>{
    const canvas=document.createElement('canvas');
    canvas.width=256;canvas.height=256;
    const ctx=canvas.getContext('2d')!;
    ctx.fillStyle='#b28c65';ctx.beginPath();ctx.ellipse(128,128,67,85,0,0,Math.PI*2);ctx.fill();
    return canvas.toDataURL('image/png').split(',')[1];
  });
  const buffer=Buffer.from(data,'base64');
  for(const id of ['seal','tea','ledger']){
    await page.getByTestId('room-art-prop-file-'+id).setInputFiles({
      name:id+'.png',mimeType:'image/png',buffer
    });
  }
  await page.getByTestId('room-art-anchor-toggle').click();
  const box=await page.getByTestId('room-art-anchor-canvas').boundingBox();
  expect(box).not.toBeNull();
  for(const [x,y] of [[.40,.45],[.60,.45],[.50,.73]]){
    await page.getByTestId('room-art-anchor-canvas').click({
      position:{x:Math.round(box!.width*x),y:Math.round(box!.height*y)}
    });
  }
  await expect(page.getByTestId('room-art-prop-preview')).toBeVisible();
  for(const id of ['seal','tea','ledger'])
    await expect(page.getByTestId('room-art-prop-'+id)).toBeVisible();
  await expect(page.getByTestId('room-art-composite-export')).toBeEnabled();
  await page.getByTestId('room-art-composite-export').click();
  await expect(page.getByTestId('room-art-composite-download')).toBeVisible({timeout:20000});
  await expect(page.getByTestId('room-art-composite-status')).toContainText('已生成');
  const [download]=await Promise.all([
    page.waitForEvent('download'),
    page.getByTestId('room-art-composite-download').click(),
  ]);
  expect(download.suggestedFilename()).toBe('yuesha-room-composite.UNAPPROVED.webp');
  await page.getByTestId('room-art-local-reset').click();
  await expect(page.getByTestId('room-art-prop-preview')).toHaveCount(0);
  await expect(page.locator('[data-hotspot-layout="object-id"]')).toBeVisible();
});

test('approved lobby layout retains the same image-first silhouette at 1648×928',async({page})=>{
  await page.setViewportSize({width:1648,height:928});
  await page.goto('/');
  const art=page.getByTestId('gothic-lobby-painting-image');
  await expect.poll(()=>art.evaluate(el=>(el as HTMLImageElement).naturalWidth)).toBeGreaterThan(1200);
  await expect.poll(()=>page.getByTestId('gothic-design-roster').locator('img').evaluateAll(
    images=>images.length===4&&images.every(img=>(img as HTMLImageElement).naturalWidth>0)
  )).toBe(true);
  const rail=await page.getByTestId('gothic-design-roster').boundingBox();
  const banner=await page.getByTestId('gothic-eclipse-feature').boundingBox();
  const right=await page.getByTestId('gothic-design-right').boundingBox();
  await expect.poll(()=>page.getByTestId('gothic-postcard-workshop-art')
    .evaluate(img=>(img as HTMLImageElement).naturalWidth)).toBeGreaterThanOrEqual(960);
  await expect.poll(()=>page.getByTestId('gothic-postcard-town-art')
    .evaluate(img=>(img as HTMLImageElement).naturalWidth)).toBeGreaterThanOrEqual(960);
  const dock=await page.getByRole('navigation',{name:'主要游戏功能'}).boundingBox();
  expect(rail&&banner&&right&&dock).toBeTruthy();
  expect(rail!.x+rail!.width).toBeLessThan(1648*.23);
  expect(banner!.x).toBeGreaterThan(1648*.73);
  expect(right!.y).toBeGreaterThan(banner!.y+banner!.height);
  expect(right!.y+right!.height).toBeLessThan(dock!.y-30);
  expect(Math.abs(dock!.x-(1648-dock!.width)/2)).toBeLessThan(4);
  await page.addStyleTag({content:'nextjs-portal{display:none!important}'});
  await page.screenshot({path:'test-results/desktop-lobby-reference-1648.png',animations:'disabled'});
});

test('workshop and town use independent native 2K location artwork, not lobby painting',async({page})=>{
  test.setTimeout(75000);
  await page.setViewportSize({width:1440,height:900});
  await page.goto('/town/');
  await expect(page.getByTestId('moonwork-world')).toBeVisible({timeout:20000});
  const town=page.getByTestId('moonwork-background');
  await expect(town).toHaveCSS('background-image',/town-moonlit-gate\.[^)]*\.webp/);
  const townUrl=await town.evaluate(el=>{
    const image=getComputedStyle(el).backgroundImage;
    return image.match(/url\(["']?([^"')]+)["']?\)/)?.[1]??'';
  });
  // Next.js content-hashes imported image URLs in /_next/static/media/.
  expect(townUrl).toContain('town-moonlit-gate.');
  expect(townUrl).not.toContain('lobby-hero');
  const townWidth=await page.evaluate(async src=>{
    const image=new Image();image.src=src;await image.decode();return image.naturalWidth;
  },townUrl);
  expect(townWidth).toBe(1920);
  await expect(page.getByTestId('moonlit-market')).toBeVisible();
  await expect(page.getByRole('navigation',{name:'月光工坊世界'}).getByRole('link')).toHaveCount(7);
  await page.goto('/workshop/');
  await expect(page.getByTestId('next-workshop-shell')).toBeVisible({timeout:20000});
  const root=page.locator('#root');
  await expect(root).toHaveCSS('background-image',/workshop-gothic-hall\.[^)]*\.webp/);
  await expect(root).toHaveAttribute('data-runtime-ready','true',{timeout:30000});
  await expect(page.locator('[data-backdrop-source="world-hall-2k"]')).toBeAttached({timeout:15000});
  await expect(page.getByTestId('v2-world-nav').getByRole('link')).toHaveCount(7);
  await page.addStyleTag({content:'nextjs-portal{display:none!important}'});
  await page.screenshot({path:'test-results/desktop-workshop-2k-v389.png',animations:'disabled'});
  await page.goto('/town/');
  await expect(page.getByTestId('moonlit-town-scene')).toBeVisible({timeout:20000});
  // Never approve a cold-loading blank cover as the final town visual.
  for(const imageId of ['town-painting','town-guide-painting']){
    await expect.poll(()=>page.getByTestId(imageId).evaluate(
      el=>(el as HTMLImageElement).naturalWidth),{timeout:20000})
      .toBeGreaterThan(0);
  }
  await page.screenshot({path:'test-results/desktop-town-2k-v389.png',animations:'disabled'});
});
