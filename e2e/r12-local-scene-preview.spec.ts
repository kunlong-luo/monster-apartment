import {expect,test} from '@playwright/test';

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

test('R12 opt-in reviewer is also available for apartment and warehouse',async({page})=>{
  for(const [route,id] of [
    ['/apartment/','.ga-backdrop'],
    ['/warehouse/','.mw-gothic-scene'],
  ] as const){
    await page.goto(route+'?r12-art-review=1');
    await expect(page.getByTestId('r12-local-art-review')).toBeVisible();
    await expect(page.locator(id)).toHaveAttribute('data-r12-scene-art','legacy');
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
  for(const entry of areas){
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

    await page.setViewportSize({width:390,height:844});
    await expect.poll(()=>art.evaluate(el=>(el as HTMLImageElement).naturalWidth))
      .toBe(941);
    await expect(art).toHaveAttribute('src',new RegExp(entry.mobile.replace('.','\\.')));
    await expect(reviewer.getByTestId('r12-local-pixel-gate'))
      .toHaveAttribute('data-required-resolution','1080x1920');
    await expect(reviewer.getByTestId('r12-local-pixel-gate'))
      .toHaveAttribute('data-pixel-pass','false');
    await expect(backdrop).toHaveAttribute('data-r12-scene-art','local-review');
    // Independent compositions are preview-only; refreshing never loads one.
    await page.reload();
    await expect(backdrop).toHaveAttribute('data-r12-scene-art','legacy');
    await expect(backdrop.getByTestId('r12-repository-study-watermark')).toHaveCount(0);
  }
});
