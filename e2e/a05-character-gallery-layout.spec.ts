import {expect,test} from '@playwright/test';

/** Visual smoke for the approved 1672 x 941 A05 reference composition.
 * Deliberately checks live DOM geometry and data instead of a baked screenshot. */
test('A05 desktop places five selectable portraits beside a real detail panel',async({page})=>{
  test.setTimeout(90_000);
  await page.setViewportSize({width:1672,height:941});
  await page.goto('/characters/');
  await expect(page.getByTestId('moonwork-world')).toHaveAttribute('data-area','characters');
  await expect(page.getByRole('heading',{name:/A05 人物立绘全集/})).toBeVisible();
  const gallery=page.getByTestId('painted-worker-gallery');
  await expect(gallery.locator('.cg-card')).toHaveCount(5);
  await expect(page.getByTestId('gallery-collected-count')).toHaveText('0/5');
  const cards=await gallery.boundingBox();
  const details=await page.locator('.cg-detail').boundingBox();
  const sidebar=await page.locator('.cg-sidebar').boundingBox();
  const dock=await page.getByRole('navigation',{name:'月光工坊世界'}).boundingBox();
  expect(cards&&details&&sidebar&&dock).toBeTruthy();
  expect(sidebar!.x+sidebar!.width).toBeLessThan(cards!.x+3);
  expect(cards!.x+cards!.width).toBeLessThan(details!.x+3);
  expect(cards!.y+cards!.height).toBeLessThan(dock!.y);
  const images=gallery.locator('.cg-card__image');
  await expect(images).toHaveCount(5);
  await expect.poll(()=>images.evaluateAll(nodes=>nodes.every(el=>
    (el as HTMLImageElement).complete&&(el as HTMLImageElement).naturalWidth>0
  )),{timeout:25000}).toBe(true);
  // Existing portraits are square; never crop 512px art to impersonate a full-body CG.
  const portraitCards=gallery.locator('.cg-card[data-art-layout="portrait"]');
  await expect(portraitCards).toHaveCount(4);
  await expect(gallery.locator('.cg-card[data-art-layout="figure"]')).toHaveCount(1);
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
  await expect(gallery.locator('.cg-card[data-art-layout="figure"] .cg-card__image'))
    .toHaveCSS('object-fit','contain');
  await page.getByRole('button',{name:/选择青枝/}).click();
  await expect(page.locator('.cg-detail h2')).toContainText('青枝');
  await expect(page.locator('.cg-stats')).toBeVisible();
  await expect(page.getByRole('navigation',{name:'月光工坊世界'}).getByRole('link')).toHaveCount(7);
});

test('A05 mobile card strip remains operable without page overflow',async({page})=>{
  await page.setViewportSize({width:390,height:844});
  await page.goto('/characters/');
  await expect(page.getByTestId('painted-worker-gallery')).toBeVisible();
  await page.getByRole('button',{name:/选择炽角/}).scrollIntoViewIfNeeded();
  await page.getByRole('button',{name:/选择炽角/}).click();
  await expect(page.locator('.cg-detail h2')).toContainText('炽角');
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(2);
  await expect(page.getByRole('navigation',{name:'月光工坊世界'}).getByRole('link')).toHaveCount(7);
});
