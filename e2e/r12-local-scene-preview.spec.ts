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
  await expect(reviewer).toContainText('仅供构图预览');
  await expect.poll(()=>backdrop.evaluate(el=>getComputedStyle(el).backgroundImage))
    .toContain('blob:');
  // A transient local backdrop must not promote an image or duplicate R12 assets.
  await expect(backdrop.locator('img[data-r12-art-image]')).toHaveCount(0);
  const pcUrl=await backdrop.evaluate(el=>getComputedStyle(el).backgroundImage);
  // Mobile without its own artwork is explicitly marked as a crop-only review.
  await page.setViewportSize({width:390,height:844});
  await expect(reviewer).toContainText('不得作为手机美术验收');
  await expect.poll(()=>backdrop.evaluate(el=>getComputedStyle(el).backgroundImage))
    .toBe(pcUrl);

  // The phone source is a different object URL and changes both background
  // and the matching live hero when crossing the 700px breakpoint.
  await page.getByTestId('r12-local-art-file-mobile').setInputFiles({
    name:'portrait-review.png',mimeType:'image/png',buffer:sample,
  });
  await expect(reviewer.getByTestId('r12-local-mobile-meta')).toContainText('portrait-review.png');
  await expect(reviewer.getByTestId('r12-local-active')).toContainText('手机独立原图');
  await expect.poll(()=>backdrop.evaluate(el=>getComputedStyle(el).backgroundImage))
    .not.toBe(pcUrl);
  const portraitUrl=await backdrop.evaluate(el=>getComputedStyle(el).backgroundImage);
  const phoneHero=page.locator('img[data-r12-hero-art="local-review"]');
  await expect(phoneHero).toBeVisible();
  await expect.poll(()=>phoneHero.getAttribute('src')).toContain('blob:');
  await page.setViewportSize({width:1440,height:900});
  await expect(reviewer.getByTestId('r12-local-active')).toContainText('PC 横版原图');
  await expect.poll(()=>backdrop.evaluate(el=>getComputedStyle(el).backgroundImage))
    .toBe(pcUrl);
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
