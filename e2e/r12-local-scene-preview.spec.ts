import {expect,test} from '@playwright/test';
import {mkdirSync} from 'node:fs';

const sample=Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAIAAAD91JpzAAAAFklEQVR4nGMUicpjYGBgYmBgYGBgAAAKIADgurgZrAAAAABJRU5ErkJggg==',
  'base64',
);

test('R12 local art reviewer previews file bytes without publishing or persisting them',async({page})=>{
  test.setTimeout(60_000);
  await page.setViewportSize({width:1440,height:900});
  await page.goto('/orders/?r12-art-review=1');
  const reviewer=page.getByTestId('r12-local-art-review');
  await expect(reviewer).toBeVisible();
  await expect(reviewer).toContainText('不会上传、保存或发布图片');
  const backdrop=page.getByTestId('moonwork-background');
  await expect(backdrop).toHaveAttribute('data-r12-scene-art','legacy');

  await page.getByTestId('r12-local-art-file').setInputFiles({
    name:'local-review.png',mimeType:'image/png',buffer:sample,
  });
  await expect(backdrop).toHaveAttribute('data-r12-scene-art','local-review');
  await expect(reviewer).toContainText('2×2');
  await expect(reviewer.getByTestId('r12-local-pixel-gate'))
    .toHaveAttribute('data-required-resolution','3840x2160');
  await expect(reviewer.getByTestId('r12-local-pixel-gate'))
    .toHaveAttribute('data-pixel-pass','false');
  await expect(reviewer).toContainText('禁止插值放大晋级');
  // Local review now exercises the same decoded image/retry path as approved
  // production art rather than a different CSS background-image code path.
  const backdropArt=backdrop.locator('img[data-r12-art-image="local-review"]');
  await expect(backdropArt).toHaveCount(1);
  await expect.poll(()=>backdropArt.evaluate(el=>(el as HTMLImageElement).naturalWidth))
    .toBeGreaterThan(0);
  const pcUrl=await backdropArt.getAttribute('src');
  expect(pcUrl).toContain('blob:');
  // Mobile without its own artwork is explicitly marked as a crop-only review.
  await page.setViewportSize({width:390,height:844});
  await expect(reviewer).toContainText('不得作为手机美术验收');
  await expect.poll(()=>backdropArt.getAttribute('src')).toBe(pcUrl);

  // The phone source is a different object URL and changes both background
  // and the matching live hero when crossing the 700px breakpoint.
  await page.getByTestId('r12-local-art-file-mobile').setInputFiles({
    name:'portrait-review.png',mimeType:'image/png',buffer:sample,
  });
  await expect(reviewer.getByTestId('r12-local-pixel-gate'))
    .toHaveAttribute('data-required-resolution','1080x1920');
  await expect(reviewer.getByTestId('r12-local-pixel-gate'))
    .toHaveAttribute('data-pixel-pass','false');
  await expect(reviewer.getByTestId('r12-local-mobile-meta')).toContainText('portrait-review.png');
  await expect(reviewer.getByTestId('r12-local-active')).toContainText('手机独立原图');
  await expect.poll(()=>backdropArt.getAttribute('src')).not.toBe(pcUrl);
  const portraitUrl=await backdropArt.getAttribute('src');
  const phoneHero=page.locator('img[data-r12-hero-art="local-review"]');
  await expect(phoneHero).toBeVisible();
  await expect.poll(()=>phoneHero.getAttribute('src')).toContain('blob:');
  await page.setViewportSize({width:1440,height:900});
  await expect(reviewer.getByTestId('r12-local-active')).toContainText('PC 横版原图');
  await expect.poll(()=>backdropArt.getAttribute('src')).toBe(pcUrl);
  expect(portraitUrl).not.toBe(pcUrl);
  // The old 360px workshop hero is replaced by the same temporary scene art
  // for an accurate in-game layout inspection (not a production asset).
  const hero=page.locator('[data-r12-hero-art="local-review"]');
  await expect(hero).toBeVisible();
  await expect.poll(()=>hero.evaluate(el=>(el as HTMLImageElement).naturalWidth))
    .toBeGreaterThan(0);

  // A failed reviewed hero is never replaced by the unrelated blurry 360px
  // workshop prototype, even after Next Image's built-in retry is exhausted.
  await hero.evaluate(el=>el.dispatchEvent(new Event('error',{bubbles:true})));
  await expect(hero).toHaveAttribute('data-image-load','retry');
  await hero.evaluate(el=>el.dispatchEvent(new Event('error',{bubbles:true})));
  await expect(page.locator('[data-r12-hero-art="local-review-failed"]')).toBeVisible();
  await expect(page.locator('img[src*="moon-workshop"]')).toHaveCount(0);

  // Full-page production art must also avoid the old 1587px lobby fallback.
  // The local review uses the same component, so a real error path is testable
  // without putting unapproved images in the production asset manifest.
  await backdropArt.evaluate(el=>el.dispatchEvent(new Event('error',{bubbles:true})));
  await expect(backdropArt).toHaveAttribute('data-image-load','retry');
  await backdropArt.evaluate(el=>el.dispatchEvent(new Event('error',{bubbles:true})));
  await expect(backdrop.locator('[data-r12-art-failed="local-review"]')).toBeVisible();
  await expect(backdrop.locator('img[src*="lobby-hero"]')).toHaveCount(0);

  await reviewer.getByRole('button',{name:'恢复原场景'}).click();
  await expect(page.locator('[data-r12-hero-art="local-review"]')).toHaveCount(0);
  await expect(backdrop).toHaveAttribute('data-r12-scene-art','legacy');
  await page.reload();
  await expect(reviewer).toBeVisible();
  await expect(backdrop).toHaveAttribute('data-r12-scene-art','legacy');
  await expect(reviewer).not.toContainText('local-review.png');
  await expect(reviewer).not.toContainText('portrait-review.png');

  await page.goto('/orders/');
  await expect(page.getByTestId('r12-local-art-review')).toHaveCount(0);
});

test('R12 direct opt-in reviewer hydrates without server document errors on all three scenes',async({page})=>{
  const errors:string[]=[];
  const record=(message:string)=>{
    if(/document is not defined|server rendering errored|hydration failed/i.test(message))errors.push(message);
  };
  page.on('pageerror',error=>record(error.message));
  page.on('console',message=>{if(message.type()==='error')record(message.text());});
  for(const [route,id] of [
    ['/apartment/','.ga-backdrop'],
    ['/orders/','.mw-gothic-scene'],
    ['/warehouse/','.mw-gothic-scene'],
  ] as const){
    await page.goto(route+'?r12-art-review=1');
    await expect(page.getByTestId('r12-local-art-review')).toBeVisible();
    await expect(page.locator(id)).toHaveAttribute('data-r12-scene-art','legacy');
    expect(errors,route+' direct review hydration').toEqual([]);
  }
});


test('R12 repository scene studies preview distinct PC/mobile images only on explicit request',async({page})=>{
  test.setTimeout(120_000);
  const requests:string[]=[];
  page.on('request',request=>{
    if(request.url().includes('/art/world-scenes/review/'))requests.push(request.url());
  });
  const areas=[
    {area:'apartment',route:'/apartment/',backdrop:'.ga-backdrop',
      desktop:'apartment-six-door-desktop-v1.webp',mobile:'apartment-six-door-mobile-v1.webp'},
    {area:'orders',route:'/orders/',backdrop:'.mw-gothic-scene',
      desktop:'orders-desktop-v1.webp',mobile:'orders-mobile-v1.webp'},
    {area:'warehouse',route:'/warehouse/',backdrop:'.mw-gothic-scene',
      desktop:'warehouse-desktop-v1.webp',mobile:'warehouse-mobile-v1.webp'},
  ] as const;
  mkdirSync('visual-evidence/scene-studies',{recursive:true});
  for(const entry of areas){
    requests.length=0; // previous area intentionally fetched two research images
    await page.setViewportSize({width:1440,height:900});
    await page.goto(entry.route);
    await expect(page.getByTestId('r12-local-art-review')).toHaveCount(0);
    await expect(page.locator(entry.backdrop))
      .toHaveAttribute('data-r12-scene-art','legacy');
    expect(requests).toHaveLength(0); // Never request review art for normal players.

    await page.goto(entry.route+'?r12-art-review=1');
    const reviewer=page.getByTestId('r12-local-art-review');
    const backdrop=page.locator(entry.backdrop);
    await expect(reviewer).toBeVisible();
    await expect(backdrop).toHaveAttribute('data-r12-scene-art','legacy');
    expect(requests).toHaveLength(0); // Opt-in flag alone still does not load it.
    await page.getByTestId('r12-preview-repository-scene').click();
    await expect(backdrop).toHaveAttribute('data-r12-scene-art','local-review');
    await expect(backdrop).toHaveAttribute('data-r12-review-origin','repo');
    await expect(backdrop.getByTestId('r12-repository-study-watermark')).toBeVisible();
    const art=backdrop.locator('img[data-r12-art-image="local-review"]');
    await expect.poll(()=>art.evaluate(el=>(el as HTMLImageElement).naturalWidth))
      .toBe(1672);
    await expect(art).toHaveAttribute('src',new RegExp(entry.desktop.replace('.','\\.')));
    await expect(reviewer.getByTestId('r12-local-pixel-gate'))
      .toHaveAttribute('data-required-resolution','3840x2160');
    await expect(reviewer.getByTestId('r12-local-pixel-gate'))
      .toHaveAttribute('data-pixel-pass','false');
    await page.screenshot({path:'visual-evidence/scene-studies/'+entry.area+'-pc-review.png',
      animations:'disabled'});

    await page.setViewportSize({width:390,height:844});
    await expect.poll(()=>art.evaluate(el=>(el as HTMLImageElement).naturalWidth))
      .toBe(941);
    await expect(art).toHaveAttribute('src',new RegExp(entry.mobile.replace('.','\\.')));
    await expect(reviewer.getByTestId('r12-local-pixel-gate'))
      .toHaveAttribute('data-required-resolution','1080x1920');
    await expect(reviewer.getByTestId('r12-local-pixel-gate'))
      .toHaveAttribute('data-pixel-pass','false');
    await expect(backdrop).toHaveAttribute('data-r12-scene-art','local-review');
    await page.screenshot({path:'visual-evidence/scene-studies/'+entry.area+'-mobile-review.png',
      animations:'disabled'});
    // Independent compositions are preview-only; refreshing never loads one.
    await page.reload();
    await expect(backdrop).toHaveAttribute('data-r12-scene-art','legacy');
    await expect(backdrop.getByTestId('r12-repository-study-watermark')).toHaveCount(0);
  }
});


test('R12 scene review opt-out follows URL history without leaking research artwork',async({page})=>{
  test.setTimeout(60_000);
  await page.setViewportSize({width:1440,height:900});
  await page.goto('/orders/?r12-art-review=1');
  const reviewer=page.getByTestId('r12-local-art-review');
  const backdrop=page.getByTestId('moonwork-background');
  await expect(reviewer).toBeVisible();
  await page.getByTestId('r12-preview-repository-scene').click();
  await expect(backdrop).toHaveAttribute('data-r12-review-origin','repo');
  await expect(backdrop.locator('img[data-r12-art-image="local-review"]')).toBeVisible();
  await expect(page.locator('[data-r12-hero-art="local-review"]')).toBeVisible();

  // Same-page Next App Router history changes must immediately revoke opt-in.
  // A hard reload would not catch the old one-time query snapshot bug.
  await page.evaluate(()=>window.history.pushState(null,'','/orders/'));
  await expect(page).toHaveURL(/\/orders\/?$/);
  await expect(reviewer).toHaveCount(0);
  await expect(backdrop).toHaveAttribute('data-r12-scene-art','legacy');
  await expect(backdrop).toHaveAttribute('data-r12-review-origin','none');
  await expect(backdrop.locator('img[data-r12-art-image="local-review"]')).toHaveCount(0);
  await expect(backdrop.getByTestId('r12-repository-study-watermark')).toHaveCount(0);
  await expect(page.locator('[data-r12-hero-art="local-review"]')).toHaveCount(0);

  // Re-entering opt-in by Back restores the controls, NOT the previewed art.
  await page.goBack();
  await expect(page).toHaveURL(/\/orders\/?\?r12-art-review=1$/);
  await expect(reviewer).toBeVisible();
  await expect(backdrop).toHaveAttribute('data-r12-scene-art','legacy');
  await expect(backdrop.locator('img[data-r12-art-image="local-review"]')).toHaveCount(0);
  await expect(page.locator('[data-r12-hero-art="local-review"]')).toHaveCount(0);
});

test('R12 pending local image probes cannot override later review choices or survive opt-out',async({page})=>{
  test.setTimeout(60_000);
  await page.setViewportSize({width:1440,height:900});
  await page.goto('/orders/?r12-art-review=1');
  const reviewer=page.getByTestId('r12-local-art-review');
  const backdrop=page.getByTestId('moonwork-background');
  await expect(reviewer).toBeVisible();
  // Defer only Image-constructor blob probes, not actual rendered <img>
  // elements. This reproduces out-of-order completion without sleeps.
  await page.evaluate(()=>{
    const create=URL.createObjectURL.bind(URL);
    const revoke=URL.revokeObjectURL.bind(URL);
    const created:string[]=[];
    const revoked:string[]=[];
    const deferred:Array<()=>void>=[];
    const root=document.documentElement;
    root.dataset.r12ProbeCreated='0';
    root.dataset.r12ProbeRevoked='0';
    URL.createObjectURL=(object)=>{
      const url=create(object);
      created.push(url);
      root.dataset.r12ProbeCreated=String(created.length);
      return url;
    };
    URL.revokeObjectURL=(url)=>{
      revoke(url);
      if(created.includes(url)&&!revoked.includes(url)){
        revoked.push(url);
        root.dataset.r12ProbeRevoked=String(revoked.length);
      }
    };
    const descriptor=Object.getOwnPropertyDescriptor(HTMLImageElement.prototype,'src')!;
    window.Image=new Proxy(window.Image,{
      construct(target,args){
        const img=Reflect.construct(target,args) as HTMLImageElement;
        Object.defineProperty(img,'src',{
          get:()=>descriptor.get!.call(img),
          set:(value:string)=>{
            if(value.startsWith('blob:'))deferred.push(()=>descriptor.set!.call(img,value));
            else descriptor.set!.call(img,value);
          },
        });
        return img;
      },
    });
    document.addEventListener('r12-test-release-probe',()=>deferred.pop()?.());
  });
  const root=page.locator('html');
  const desktop=page.getByTestId('r12-local-art-file');
  const mobile=page.getByTestId('r12-local-art-file-mobile');
  const file=(name:string)=>({name,mimeType:'image/png',buffer:sample});
  const release=()=>page.evaluate(()=>document.dispatchEvent(new Event('r12-test-release-probe')));

  await desktop.setInputFiles(file('old.png'));
  await expect(root).toHaveAttribute('data-r12-probe-created','1');
  await desktop.setInputFiles(file('new.png'));
  await expect(root).toHaveAttribute('data-r12-probe-created','2');
  await expect(root).toHaveAttribute('data-r12-probe-revoked','1');
  await release(); // newest finishes first
  await expect(reviewer.getByTestId('r12-local-desktop-meta')).toContainText('new.png');
  await release(); // canceled old probe cannot publish
  await expect(reviewer.getByTestId('r12-local-desktop-meta')).toContainText('new.png');

  await mobile.setInputFiles(file('pending-mobile.png'));
  await expect(root).toHaveAttribute('data-r12-probe-created','3');
  await page.getByTestId('r12-preview-repository-scene').click();
  await expect(backdrop).toHaveAttribute('data-r12-review-origin','repo');
  await expect(root).toHaveAttribute('data-r12-probe-revoked','3');
  await release();
  await expect(reviewer.getByTestId('r12-local-mobile-meta')).toContainText('仓库研究稿');

  await desktop.setInputFiles(file('pending-reset.png'));
  await expect(root).toHaveAttribute('data-r12-probe-created','4');
  await reviewer.getByRole('button',{name:'恢复原场景'}).click();
  await expect(root).toHaveAttribute('data-r12-probe-revoked','4');
  await release();
  await expect(backdrop).toHaveAttribute('data-r12-scene-art','legacy');

  await desktop.setInputFiles(file('pending-exit.png'));
  await expect(root).toHaveAttribute('data-r12-probe-created','5');
  await page.evaluate(()=>window.history.pushState(null,'','/orders/'));
  await expect(reviewer).toHaveCount(0);
  await expect(root).toHaveAttribute('data-r12-probe-revoked','5');
  await release();
  await page.goBack();
  await expect(reviewer).toBeVisible();
  await expect(backdrop).toHaveAttribute('data-r12-scene-art','legacy');
  await expect(reviewer.getByTestId('r12-local-desktop-meta')).toHaveCount(0);
});

test('S02 research door centers are non-mutating image hit tests on four viewports',async({page,browser})=>{
  test.setTimeout(120_000);
  await page.goto('/apartment/?r12-art-review=1');
  const reviewUrl=page.url();
  mkdirSync('visual-evidence/scene-studies',{recursive:true});
  for(const profile of [
    {width:1440,height:900,dpr:1},{width:1648,height:928,dpr:2},
    {width:390,height:844,dpr:2},{width:390,height:550,dpr:2},
  ]){
    // Use the real resolved fixture URL, including any deployment base path.
    const context=await browser.newContext({
      viewport:{width:profile.width,height:profile.height},deviceScaleFactor:profile.dpr,
    });
    const screen=await context.newPage();
    try{
      await screen.goto(reviewUrl);
      await expect(screen.getByTestId('gothic-apartment')).toBeVisible();
      await screen.getByTestId('r12-preview-repository-scene').click();
      const start=screen.getByTestId('r12-start-door-review');
      await expect(start).toBeVisible();
      await start.click();
      const overlay=screen.getByTestId('r12-apartment-door-review');
      await expect(overlay).toHaveAttribute('data-review-device',profile.width<=700?'mobile':'desktop');
      await expect(overlay.getByRole('button')).toHaveCount(6);
      await expect(screen.locator('.ga-lower')).toBeHidden();
      await expect.poll(()=>screen.evaluate(()=>localStorage.getItem('monster-apartment:workshop-v2-lab'))).not.toBeNull();
      await screen.screenshot({path:'visual-evidence/scene-studies/s02-doors-'+profile.width+'x'+profile.height+'.png',animations:'disabled'});
      const before=await screen.evaluate(()=>localStorage.getItem('monster-apartment:workshop-v2-lab'));
      for(let index=0;index<6;index++){
        const door=screen.getByTestId('r12-review-door-'+index);
        const box=await door.boundingBox();
        expect(box).not.toBeNull();
        expect(box!.width).toBeGreaterThanOrEqual(44);
        expect(box!.height).toBeGreaterThanOrEqual(44);
        await door.click({trial:true,timeout:5000}); // prove the actual pointer target is unobstructed
        await door.click({timeout:5000});
        await expect(screen.getByTestId('ga-door-review-detail')).toContainText('研究门位 '+String(index+1).padStart(2,'0'));
        await screen.getByRole('button',{name:'关闭门位检查'}).click({timeout:5000});
        await expect(screen.locator('.ga-lower')).toBeHidden();
      }
      expect(await screen.evaluate(()=>localStorage.getItem('monster-apartment:workshop-v2-lab'))).toBe(before);
      await screen.getByTestId('r12-exit-door-review').click();
      await expect(overlay).toHaveCount(0);
      await expect(screen.locator('.ga-lower')).toBeVisible();
      await expect(screen.getByTestId('r12-local-art-review')).toBeVisible();
      await screen.getByRole('button',{name:'恢复原场景'}).click();
      await expect(screen.locator('.ga-backdrop')).toHaveAttribute('data-r12-scene-art','legacy');
    }finally{await context.close();}
  }
  await page.goto('/apartment/');
  await expect(page.getByTestId('r12-apartment-door-review')).toHaveCount(0);
});

test('R12.72-C orders and warehouse expose explicit scene preview without changing normal production art',async({page})=>{
  test.setTimeout(90_000);
  await page.setViewportSize({width:1440,height:900});
  for(const [area,desktop,mobile] of [['orders','orders-desktop-v1.webp','orders-mobile-v1.webp'],['warehouse','warehouse-desktop-v1.webp','warehouse-mobile-v1.webp']]){
    const requests:string[]=[];
    const record=(request:{url:()=>string})=>{if(request.url().includes('/art/world-scenes/review/'))requests.push(request.url());};
    page.on('request',record);
    try{
      await page.setViewportSize({width:1440,height:900});
      await page.goto('/'+area+'/');
      await expect(page.getByTestId('moonwork-background')).toHaveAttribute('data-r12-scene-art','legacy');
      await expect(page.locator('[data-r12-hero-art="pending"]')).toBeVisible();
      expect(requests).toHaveLength(0);
      await page.getByTestId('world-scene-preview-link').click();
      const reviewer=page.getByTestId('r12-local-art-review');
      await expect(reviewer).toBeVisible();
      expect(requests).toHaveLength(0);
      await page.getByTestId('r12-preview-repository-scene').click();
      const art=page.getByTestId('moonwork-background').locator('img[data-r12-art-image="local-review"]');
      await expect.poll(()=>art.evaluate((img:HTMLImageElement)=>img.naturalWidth)).toBe(1672);
      await expect(art).toHaveAttribute('src',new RegExp(desktop.replace('.','\\.')));
      const reviewBox=await reviewer.boundingBox();
      const hudBox=await page.locator('.mw-main').boundingBox();
      expect(reviewBox!.x+reviewBox!.width).toBeLessThan(hudBox!.x);
      await page.screenshot({path:'visual-evidence/scene-studies/'+area+'-pc-preview-entry.png',animations:'disabled'});
      await page.setViewportSize({width:390,height:844});
      await expect.poll(()=>art.evaluate((img:HTMLImageElement)=>img.naturalWidth)).toBe(941);
      await expect(art).toHaveAttribute('src',new RegExp(mobile.replace('.','\\.')));
      await page.getByTestId('r12-exit-scene-preview').click();
      await expect(reviewer).toHaveCount(0);
      await expect(page.getByTestId('moonwork-background')).toHaveAttribute('data-r12-scene-art','legacy');
      await expect(page.locator('[data-r12-hero-art="pending"]')).toBeVisible();
    }finally{page.off('request',record);}
  }
});

test('S02 PC research doors coexist with real HUD, room chooser and YueSha dialogue',async({page,browser})=>{
  test.setTimeout(120_000);
  await page.goto('/apartment/?r12-art-review=1');
  const url=page.url();
  mkdirSync('visual-evidence/scene-studies',{recursive:true});
  for(const profile of [{width:1440,height:900,dpr:1},{width:1648,height:928,dpr:2}]){
    const context=await browser.newContext({viewport:{width:profile.width,height:profile.height},deviceScaleFactor:profile.dpr});
    const screen=await context.newPage();
    try{
      await screen.goto(url);
      await screen.getByTestId('r12-preview-repository-scene').click();
      await screen.getByTestId('r12-start-hud-review').click();
      const overlay=screen.getByTestId('r12-apartment-door-review');
      await expect(overlay).toHaveAttribute('data-review-mode','hud');
      await expect(overlay.getByRole('button')).toHaveCount(6);
      await expect(screen.getByTestId('ga-coins')).toBeVisible();
      await expect(screen.locator('.ga-story')).toBeVisible();
      const chooser=screen.getByTestId('ga-room-menu-toggle');
      await expect(chooser).toBeVisible();
      await expect(chooser).toHaveAttribute('aria-expanded','false');
      await expect.poll(()=>screen.evaluate(()=>localStorage.getItem('monster-apartment:workshop-v2-lab'))).not.toBeNull();
      const before=await screen.evaluate(()=>localStorage.getItem('monster-apartment:workshop-v2-lab'));
      await screen.screenshot({path:'visual-evidence/scene-studies/s02-hud-'+profile.width+'x'+profile.height+'.png',animations:'disabled'});
      for(let i=0;i<6;i++){
        const door=screen.getByTestId('r12-review-door-'+i);
        await door.click({trial:true,timeout:5000});
        await door.click({timeout:5000});
        await expect(screen.getByTestId('ga-door-review-detail')).toContainText('研究门位 '+String(i+1).padStart(2,'0'));
        await screen.getByRole('button',{name:'关闭门位检查'}).click({timeout:5000});
        await expect(screen.locator('.ga-story')).toBeVisible();
      }
      await chooser.click();
      await expect(screen.getByTestId('ga-room-0')).toBeVisible();
      await expect(screen.getByTestId('ga-room-0')).toHaveAttribute('href',/visit=yuesha/);
      await chooser.click();
      await expect(chooser).toHaveAttribute('aria-expanded','false');
      await screen.getByRole('button',{name:'公寓日志'}).click();
      await expect(screen.getByRole('dialog',{name:'公寓日志'})).toBeVisible();
      await screen.getByRole('button',{name:'关闭公寓日志'}).click();
      await screen.getByRole('button',{name:'与女主人月纱交流'}).click();
      await expect(screen.getByRole('dialog',{name:'与月纱交谈'})).toBeVisible();
      await screen.getByRole('button',{name:'关闭月纱对话'}).click();
      await expect(screen.getByRole('dialog',{name:'与月纱交谈'})).toHaveCount(0);
      expect(await screen.evaluate(()=>localStorage.getItem('monster-apartment:workshop-v2-lab'))).toBe(before);
      await screen.setViewportSize({width:390,height:844});
      await expect(overlay).toHaveAttribute('data-review-mode','isolated');
      await expect(screen.getByTestId('ga-coins')).toBeHidden();
      await screen.getByTestId('r12-exit-door-review').click();
      await expect(overlay).toHaveCount(0);
      await expect(screen.getByTestId('ga-coins')).toBeVisible();
      await screen.getByRole('button',{name:'恢复原场景'}).click();
      await expect(screen.locator('.ga-backdrop')).toHaveAttribute('data-r12-scene-art','legacy');
    }finally{await context.close();}
  }
});
