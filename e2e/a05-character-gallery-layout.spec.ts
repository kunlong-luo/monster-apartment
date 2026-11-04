import {expect,test} from '@playwright/test';
import {mkdirSync} from 'node:fs';

// Playwright clears its own test-results directory at the start of EVERY
// invocation. Put durable A05 milestone captures outside that directory.
const EVIDENCE_DIR='visual-evidence/a05';
const captureA05=async(page:import('@playwright/test').Page,name:string)=>{
  mkdirSync(EVIDENCE_DIR,{recursive:true});
  await page.screenshot({path:EVIDENCE_DIR+'/'+name,animations:'disabled'});
};

/** Visual smoke for the approved 1672 x 941 A05 reference composition.
 * Deliberately checks live DOM geometry and data instead of a baked screenshot. */
test('A05 desktop places five selectable portraits beside a real detail panel',async({page})=>{
  test.setTimeout(90_000);
  await page.setViewportSize({width:1672,height:941});
  await page.goto('/characters/');
  await expect(page.getByTestId('moonwork-world')).toHaveAttribute('data-area','characters');
  await expect(page.getByRole('heading',{name:/A05 人物立绘全集/})).toBeVisible();
  // Decorative layers are genuine independent images, have no baked UI and
  // cannot intercept card / tab / dock interactions.
  for(const id of ['a05-tracery','a05-foreground-ornaments']){
    await expect(page.getByTestId(id)).toHaveCSS('pointer-events','none');
    const decoded=await page.getByTestId(id).evaluate(async element=>{
      const src=getComputedStyle(element).backgroundImage.match(/url\(["']?([^"')]+)["']?\)/)?.[1];
      if(!src)return {width:0,height:0};
      const image=new Image();
      image.src=src;
      await image.decode();
      return {width:image.naturalWidth,height:image.naturalHeight};
    });
    expect(decoded).toEqual({width:1672,height:941});
  }
  const petals=page.getByTestId('a05-petal-layer');
  await expect(petals).toHaveCSS('pointer-events','none');
  await expect(petals.locator('.cg-petal-layer__petal')).toHaveCount(6);
  await expect(petals).toHaveAttribute('aria-hidden','true');
  // A real isolated SVG sprite, not a decorative crop of the UI screenshot.
  await expect.poll(()=>petals.locator('.cg-petal-layer__petal').first().evaluate(async node=>{
    const match=getComputedStyle(node).backgroundImage.match(/url\(["']?([^"')]+)["']?\)/);
    if(!match)return false;
    const image=new Image();
    image.src=match[1];
    await image.decode();
    return image.naturalWidth===80&&image.naturalHeight===52;
  })).toBe(true);
  const gallery=page.getByTestId('painted-worker-gallery');
  await expect(gallery.locator('.cg-card')).toHaveCount(5);
  await expect(page.getByTestId('gallery-collected-count')).toHaveText('0/5');
  // The user's reference gives mythic YueSha a distinct horned eclipse form.
  // Do not silently replace that card's feature art with the ordinary avatar.
  await expect(page.locator('.cg-detail__hero-img'))
    .toHaveAttribute('src',/cg-eclipse-candidate\.webp$/);
  // Shallow detail headers must show the top of the figure (including its
  // head), never shift the full-body image above the clipped hero region.
  await expect(page.locator('.cg-detail__hero-img')).toHaveCSS('object-position','50% 0%');
  const mythicZoom=await page.locator('.cg-detail__hero-img').evaluate(el=>
    new DOMMatrixReadOnly(getComputedStyle(el).transform).a);
  expect(mythicZoom).toBeGreaterThan(1.9);
  const hero=await page.locator('.cg-detail__hero').boundingBox();
  const heroArt=await page.locator('.cg-detail__hero-art').boundingBox();
  expect(hero&&heroArt).toBeTruthy();
  expect(heroArt!.y).toBeGreaterThanOrEqual(hero!.y-1);
  expect(heroArt!.y+heroArt!.height).toBeLessThanOrEqual(hero!.y+hero!.height+1);
  const cards=await gallery.boundingBox();
  const details=await page.locator('.cg-detail').boundingBox();
  const sidebar=await page.locator('.cg-sidebar').boundingBox();
  const launcher=page.getByTestId('scene-navigation');
  await expect(launcher).toBeVisible();
  await expect(page.getByRole('navigation',{name:'月光工坊世界'})).toHaveCount(0);
  const navBox=await launcher.boundingBox();
  expect(cards&&details&&sidebar&&navBox).toBeTruthy();
  expect(sidebar!.x+sidebar!.width).toBeLessThan(cards!.x+3);
  expect(cards!.x+cards!.width).toBeLessThan(details!.x+3);
  // After the player-approved lobby-only navigation redesign, the center
  // painting gallery can reclaim the former full-width bottom dock space.
  const progress=await page.locator('.cg-progress').boundingBox();
  expect(progress).toBeTruthy();
  const near=(actual:number,target:number,tolerance:number)=>expect(Math.abs(actual-target)).toBeLessThanOrEqual(tolerance);
  near(details!.y,78,5);
  near(cards!.y,197,10);
  expect(details!.y+details!.height).toBeGreaterThan(850);
  expect(details!.y+details!.height).toBeLessThanOrEqual(941);
  expect(progress!.y).toBeGreaterThan(800);
  expect(progress!.y).toBeGreaterThan(cards!.y+cards!.height);
  expect(navBox!.x).toBeLessThan(26);
  expect(navBox!.y).toBeGreaterThan(850);
  const images=gallery.locator('.cg-card__image');
  await expect(images).toHaveCount(5);
  await expect.poll(()=>images.evaluateAll(nodes=>nodes.every(el=>
    (el as HTMLImageElement).complete&&(el as HTMLImageElement).naturalWidth>0
  )),{timeout:25000}).toBe(true);
  // Existing portraits are square; never crop 512px art to impersonate a full-body CG.
  const portraitCards=gallery.locator('.cg-card[data-art-layout="portrait"]');
  await expect(portraitCards).toHaveCount(4);
  await expect(gallery.locator('.cg-card[data-art-layout="figure"]')).toHaveCount(1);
  // Reused identity art creates atmosphere; no screenshot raster or unrelated
  // resident is allowed to replace the original face. Both layers must decode.
  const ambient=portraitCards.locator('.cg-card__ambient-image');
  await expect(ambient).toHaveCount(4);
  await expect.poll(()=>ambient.evaluateAll(images=>images.every(img=>
    (img as HTMLImageElement).complete&&(img as HTMLImageElement).naturalWidth>0
  )),{timeout:25000}).toBe(true);
  const portraitFrames=await portraitCards.locator('.cg-card__portrait-window').evaluateAll(nodes=>
    nodes.map(el=>{
      const img=el.querySelector('img')!;
      const frame=el.getBoundingClientRect();
      return {ratio:frame.width/frame.height,fit:getComputedStyle(img).objectFit};
    }));
  for(const frame of portraitFrames){
    expect(frame.ratio).toBeGreaterThan(.73);
    expect(frame.ratio).toBeLessThan(.77);
    expect(frame.fit).toBe('cover');
  }
  // Slim reference-style cards need a cover crop; the artwork viewer retains contain.
  await expect(gallery.locator('.cg-card[data-art-layout="figure"] .cg-card__image'))
    .toHaveCSS('object-fit','cover');
  await captureA05(page,'desktop-a05-reference-1672.png');
  await page.getByRole('button',{name:/选择青枝/}).click();
  await expect(page.locator('.cg-detail h2')).toContainText('青枝');
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('.cg-detail h2')).toContainText('炽角');
  await page.keyboard.press('Home');
  await expect(page.locator('.cg-detail h2')).toContainText('月纱');
  await page.getByRole('tab',{name:'属性'}).focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.getByRole('tab',{name:'详情'})).toHaveAttribute('aria-selected','true');
  await page.getByRole('tab',{name:'属性'}).click();
  await page.getByRole('button',{name:/选择青枝/}).click();
  await expect(page.locator('.cg-stats')).toBeVisible();
  // Six real attributes and four unique expertise seals must track
  // selected resident instead of repeated generic diamonds/hearts.
  const gauges=page.locator('.cg-stat');
  const seals=page.locator('.cg-skill');
  await expect(gauges).toHaveCount(6);
  await expect(seals).toHaveCount(4);
  await expect(page.getByRole('heading',{name:'人物专长'})).toBeVisible();
  await expect(seals.first()).toContainText('感知');
  const actualProgress=await gauges.evaluateAll(nodes=>nodes.map(el=>({
    shown:Number(el.querySelector('strong')?.textContent),
    bar:parseFloat((el.querySelector('.cg-stat__track > span') as HTMLElement)?.style.width??'0'),
  })));
  for(const gauge of actualProgress){
    expect(gauge.shown).toBeGreaterThanOrEqual(0);
    expect(gauge.shown).toBeLessThanOrEqual(100);
    expect(gauge.bar).toBe(gauge.shown);
  }
  const distinctIcons=await seals.locator('.cg-skill__icon > svg').evaluateAll(nodes=>
    nodes.map(el=>el.getAttribute('class')));
  expect(new Set(distinctIcons).size).toBe(4);
  // The detail portrait is always the canonical resident face, not a crop of
  // the selected card's optional full-scene preview.
  await expect(page.locator('.cg-detail__hero-img')).toHaveAttribute('src',/face\.|face-/);
  await expect(page.getByTestId('cg-equipped-equipment')).toBeVisible();
  await expect(page.getByTestId('cg-equipped-jewelry')).toBeVisible();
  await page.getByRole('button',{name:'展开世界导航'}).click();
  const worldMap=page.getByRole('navigation',{name:'游戏七个正式地点'});
  await expect(worldMap.getByRole('link')).toHaveCount(7);
  await expect(worldMap.locator('[aria-current="page"]')).toHaveAttribute('data-destination','/characters/');
  await page.getByRole('button',{name:'关闭世界导航'}).click();
  // Artwork viewer displays the real source at contain, with working filmstrip
  // and controls. It never substitutes an unrelated CG for a portrait.
  await page.getByRole('button',{name:'欣赏立绘'}).click();
  const artwork=page.getByTestId('a05-art-viewer');
  await expect(artwork).toBeVisible();
  await expect(artwork.locator('.cg-art-view__thumb')).toHaveCount(5);
  await expect(artwork.locator('.cg-art-view__photo')).toHaveCSS('object-fit','contain');
  await expect.poll(()=>artwork.locator('.cg-art-view__photo').evaluate(img=>
    img instanceof HTMLImageElement&&img.complete&&img.naturalWidth>0
  )).toBe(true);
  await page.getByRole('button',{name:/查看月纱 · 神话/}).click();
  await expect(artwork.locator('.cg-art-view__stage')).toHaveAttribute('data-art-kind','figure');
  await page.getByRole('button',{name:'下一张人物画作'}).click();
  await expect(artwork.locator('.cg-art-view__stage')).toHaveAttribute('data-art-kind','portrait');
  await expect(artwork.locator('.cg-art-view__heading h2')).toContainText('月下誓约');
  await page.getByRole('button',{name:'关闭面板'}).click();
  await expect(artwork).toHaveCount(0);
  await page.emulateMedia({reducedMotion:'reduce'});
  await expect(petals).toBeHidden();
  await page.emulateMedia({reducedMotion:'no-preference'});
  await page.setViewportSize({width:1440,height:900});
  await captureA05(page,'desktop-a05-reference-1440.png');
});

test('A05 provides unique contextual actions instead of duplicate character menus',async({page})=>{
  await page.setViewportSize({width:1672,height:941});
  await page.goto('/characters/');
  const rail=page.getByRole('navigation',{name:'图鉴快捷功能'});
  await expect(rail).toBeVisible();
  await expect(rail.locator('.cg-sidebar__item')).toHaveCount(3);
  await expect(rail.getByRole('link',{name:'契约召唤'})).toHaveCount(1);
  await expect(rail.getByRole('button',{name:'羁绊故事'})).toHaveCount(1);
  await expect(rail.getByRole('button',{name:'CG 收藏'})).toHaveCount(1);
  await expect(rail.getByText('语音档案')).toHaveCount(0);
  await expect(rail.getByText('个人房间')).toHaveCount(0);
  await expect(rail.getByText('立绘欣赏')).toHaveCount(0);
  // Room and artwork belong to the selected resident, not to global nav.
  const actions=page.locator('.cg-detail__actions');
  await expect(actions.locator('a,button')).toHaveCount(2);
  await expect(actions.getByRole('button',{name:'欣赏立绘'})).toBeVisible();
  await expect(page.getByRole('link',{name:'怪物公寓 · 返回大厅'})).toHaveCount(0);
  const center=await page.getByTestId('painted-worker-gallery').boundingBox();
  expect(center).not.toBeNull();
  expect(center!.width).toBeGreaterThan(960);
  await rail.getByRole('button',{name:'羁绊故事'}).click();
  await expect(page.getByRole('heading',{name:'羁绊故事 · 月光记忆'})).toBeVisible();
  await expect(page.getByTestId('scene-navigation')).toBeHidden();
  await page.getByRole('button',{name:'关闭面板'}).click();
  await expect(page.getByTestId('scene-navigation')).toBeVisible();
});

test('A05 mobile card strip remains operable without page overflow',async({page})=>{
  await page.setViewportSize({width:390,height:844});
  await page.goto('/characters/');
  await expect(page.getByTestId('painted-worker-gallery')).toBeVisible();
  await expect(page.getByTestId('a05-tracery')).toBeHidden();
  await expect(page.getByTestId('a05-foreground-ornaments')).toBeHidden();
  await expect(page.getByTestId('a05-petal-layer')).toBeHidden();
  await page.getByRole('button',{name:/选择炽角/}).scrollIntoViewIfNeeded();
  await page.getByRole('button',{name:/选择炽角/}).click();
  await expect(page.locator('.cg-detail h2')).toContainText('炽角');
  const mobileTitle=await page.locator('.cg-detail__hero-text h2').boundingBox();
  const mobileArt=await page.locator('.cg-detail__hero-art').boundingBox();
  expect(mobileTitle&&mobileArt).toBeTruthy();
  // The ambient portrait now starts below the character title, not across it.
  expect(mobileArt!.y).toBeGreaterThan(mobileTitle!.y);
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(2);
  await expect(page.getByTestId('scene-navigation')).toBeVisible();
  await expect(page.getByRole('navigation',{name:'月光工坊世界'})).toHaveCount(0);
  await captureA05(page,'mobile-a05-reference-390.png');
  // The three remaining contextual actions must all fit a narrow phone
  // without forcing the player to discover an off-screen button.
  await page.setViewportSize({width:320,height:700});
  const shortcuts=page.getByRole('navigation',{name:'图鉴快捷功能'});
  await expect(shortcuts.locator('.cg-sidebar__item')).toHaveCount(3);
  const railSizes=await shortcuts.evaluate(el=>({
    scrollWidth:el.scrollWidth,clientWidth:el.clientWidth
  }));
  expect(railSizes.scrollWidth).toBeLessThanOrEqual(railSizes.clientWidth+2);
  const mobileActions=page.locator('.cg-detail__actions').locator('a,button');
  await expect(mobileActions).toHaveCount(2);
  const actionHeights=await mobileActions.evaluateAll(nodes=>nodes.map(node=>
    node.getBoundingClientRect().height));
  expect(actionHeights).toHaveLength(2);
  for(const height of actionHeights)expect(height).toBeGreaterThanOrEqual(44);
  const narrowOverflow=await page.evaluate(()=>
    document.documentElement.scrollWidth-window.innerWidth);
  expect(narrowOverflow).toBeLessThanOrEqual(2);
});
