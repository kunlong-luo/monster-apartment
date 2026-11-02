import {expect,test} from '@playwright/test';

test('A05 character gallery displays five human contracts and opens the real summon scene',async({page})=>{
  test.setTimeout(90_000);
  await page.setViewportSize({width:1440,height:900});
  await page.goto('/characters/');
  const gallery=page.getByTestId('painted-worker-gallery');
  await expect(gallery).toBeVisible({timeout:25_000});
  await expect(page.getByTestId('character-gallery-header')).toBeVisible();
  await expect(page.getByTestId('gallery-collected-count')).toContainText('0/5');
  await expect(page.locator('.gothic-summon-shell')).toHaveCount(0);
  const summonLink=page.getByTestId('open-cinematic-summon');
  await expect(summonLink).toHaveCount(1);
  // Native hash navigation must remain same-document in BOTH dev and
  // /monster-apartment/ GitHub Pages deployments, never jumping to site root.
  const nativeTarget=await summonLink.evaluate(el=>{
    const target=new URL((el as HTMLAnchorElement).href);
    return {
      currentPath:window.location.pathname.split('/').filter(Boolean).join('/'),
      targetPath:target.pathname.split('/').filter(Boolean).join('/'),
      hash:target.hash,
      origin:target.origin,
      currentOrigin:window.location.origin,
    };
  });
  expect(nativeTarget.targetPath).toBe(nativeTarget.currentPath);
  expect(nativeTarget.origin).toBe(nativeTarget.currentOrigin);
  expect(nativeTarget.hash).toBe('#summon-screen');
  await expect(gallery.locator('.cg-card')).toHaveCount(5);
  for(const id of ['brook','fern','cinder']){
    const card=page.getByTestId('worker-card-'+id);
    await expect(card).toBeAttached();
    await expect(card).toHaveAttribute('data-owned','false');
    await expect(card).toHaveAttribute('data-art-layout','portrait');
    await expect(card.locator('img.cg-card__image')).toBeVisible();
  }
  const columns=await gallery.evaluate(node=>getComputedStyle(node).gridTemplateColumns.split(' ').length);
  expect(columns).toBe(5);
  await page.getByTestId('open-cinematic-summon').click();
  await expect(page).toHaveURL(/\/characters\/?#summon-screen$/);
  await expect(page.getByTestId('gothic-summon-stage')).toBeVisible();
  await page.reload();
  await expect(page.getByTestId('gothic-summon-stage')).toBeVisible();
});

test('incomplete gacha storage blocks summoning without breaking the character scene',async({page})=>{
  const partial='{"version":2,"tickets":999,"history":[],"ownedIds":[]}';
  await page.addInitScript(value=>{
    localStorage.setItem('monster-apartment:gacha-v2',value);
  },partial);
  await page.goto('/characters/#summon-screen');
  await expect(page.getByTestId('gothic-summon-stage')).toBeVisible();
  await expect(page.getByTestId('summon-save-error')).toBeVisible();
  // Rendering uses a validated fallback; the corrupt save remains untouched.
  await expect(page.getByTestId('collection-tickets')).toHaveText('3');
  await expect(page.getByTestId('collection-summon')).toBeDisabled();
  await expect(page.getByTestId('collection-summon-ten')).toBeDisabled();
  expect(await page.evaluate(()=>localStorage.getItem('monster-apartment:gacha-v2')))
    .toBe(partial);
});

test('canonical summon archive forges and equips a real item without a duplicate gacha',async({page})=>{
  await page.goto('/characters/#summon-screen');
  await expect(page.getByTestId('gothic-summon-stage')).toBeVisible();
  await page.evaluate(()=>localStorage.setItem('monster-apartment:character-collection:v1',JSON.stringify({
    version:1,draws:['brook-tide'],shards:3,inventory:[],equipped:{}
  })));
  await page.reload();
  await page.getByRole('button',{name:'查看已收录契约、首饰和装备'}).click();
  const archive=page.getByRole('dialog',{name:'角色契约图鉴与装备锻造'});
  await expect(archive).toBeVisible();
  await expect(archive.getByTestId('collection-card-brook-tide')).toContainText('已收录');
  await expect(archive.getByTestId('collection-equip-target')).toHaveValue('brook');
  await archive.getByTestId('collection-gear-moon-pendant').click();
  await expect(archive.getByTestId('collection-shards')).toHaveText('1');
  await archive.getByTestId('collection-equip-moon-pendant').click();
  await expect(archive.getByTestId('collection-forge-feedback')).toContainText('属性已更新');
  // The archive remains mounted while hidden, retaining the chosen resident
  // and truthful feedback instead of remounting empty state.
  await archive.getByRole('button',{name:'返回契约大厅'}).click();
  await expect(archive).toHaveCount(0);
  await page.getByRole('button',{name:'查看已收录契约、首饰和装备'}).click();
  await expect(archive.getByTestId('collection-equip-target')).toHaveValue('brook');
  await expect(archive.getByTestId('collection-forge-feedback')).toContainText('属性已更新');
  await page.goto('/characters/');
  await page.getByRole('button',{name:/选择泉泡/}).click();
  await page.getByRole('tab',{name:'详情'}).click();
  await expect(page.getByTestId('life-equipped-brook')).toContainText('月纹吊坠');
  await expect(page.getByTestId('gallery-collected-count')).toContainText('1/5');
});

test('collected YueSha opens the real full-body artwork at desktop and mobile sizes',async({page})=>{
  test.setTimeout(90_000);
  await page.goto('/characters/#summon-screen');
  await expect(page.getByTestId('gothic-summon-stage')).toBeVisible({timeout:25_000});
  await page.evaluate(()=>localStorage.setItem('monster-apartment:character-collection:v1',
    JSON.stringify({version:1,draws:['yuesha-eclipse'],shards:0,inventory:[],equipped:{}})));
  await page.reload();
  const openGallery=page.getByRole('button',{name:'查看已收录契约、首饰和装备'});
  await openGallery.click();
  const archive=page.getByRole('dialog',{name:'角色契约图鉴与装备锻造'});
  await expect(archive.getByTestId('collection-card-yuesha-eclipse')).toContainText('已收录');
  await expect(archive.getByTestId('collection-view-art-yuesha-eclipse')).toBeVisible();
  await expect(archive.getByTestId('collection-view-art-yuesha-vow')).toHaveCount(0);
  await archive.getByTestId('collection-view-art-yuesha-eclipse').click();
  const viewer=archive.getByTestId('collection-art-view');
  await expect(viewer).toBeVisible();
  const illustration=viewer.getByTestId('collection-art-image');
  await expect.poll(()=>illustration.evaluate(el=>{
    const img=el as HTMLImageElement;
    return img.complete?{width:img.naturalWidth,height:img.naturalHeight,
      path:new URL(img.currentSrc).pathname,fit:getComputedStyle(img).objectFit}:null;
  }),{timeout:15000}).toMatchObject({
    width:1086,height:1448,fit:'contain',
    path:expect.stringMatching(/\/art\/beauty-beasts\/characters\/yuesha\/cg-eclipse-candidate\.webp$/),
  });
  await page.screenshot({path:'test-results/desktop-yuesha-collection-art.png',animations:'disabled'});
  await page.setViewportSize({width:390,height:844});
  await expect(viewer).toBeVisible();
  const mobile=await viewer.evaluate(el=>({
    viewport:document.documentElement.clientWidth,
    contentWidth:el.getBoundingClientRect().width,
    overflow:document.documentElement.scrollWidth-innerWidth,
  }));
  expect(mobile.contentWidth).toBeLessThanOrEqual(mobile.viewport);
  expect(mobile.overflow).toBeLessThanOrEqual(2);
  await page.screenshot({path:'test-results/mobile-yuesha-collection-art.png',animations:'disabled'});
  await archive.getByTestId('collection-art-back').click();
  await expect(viewer).toHaveCount(0);
  await expect(archive.getByTestId('collection-equip-target')).toBeVisible();
  await archive.getByRole('button',{name:'返回契约大厅'}).click();
  await expect(archive).toHaveCount(0);
});

test('an acquired heroine can be visited directly from the real collection, then return',async({page})=>{
  test.setTimeout(90_000);
  await page.goto('/characters/#summon-screen');
  await expect(page.getByTestId('gothic-summon-stage')).toBeVisible();
  await page.evaluate(()=>localStorage.setItem('monster-apartment:character-collection:v1',JSON.stringify({
    version:1,draws:['brook-tide'],shards:1,inventory:[],equipped:{}
  })));
  await page.reload();
  await page.getByRole('button',{name:'查看已收录契约、首饰和装备'}).click();
  const archive=page.getByRole('dialog',{name:'角色契约图鉴与装备锻造'});
  await expect(archive.getByTestId('collection-visit-brook-tide')).toBeVisible();
  // Link must resolve through Next's basePath in both dev and GitHub Pages.
  const roomLink=await archive.getByTestId('collection-visit-brook-tide').evaluate(el=>{
    const link=new URL((el as HTMLAnchorElement).href);
    const base=window.location.pathname.split('/characters')[0];
    return {origin:link.origin,currentOrigin:window.location.origin,
      targetPath:link.pathname,base,search:link.search};
  });
  expect(roomLink.origin).toBe(roomLink.currentOrigin);
  // Dev may omit the trailing slash; Pages static export uses one.
  expect(roomLink.targetPath.replace(/\/$/,'')).toBe(roomLink.base+'/characters');
  expect(roomLink.search).toBe('?visit=brook');
  await expect(archive.getByTestId('collection-visit-cinder-ember')).toHaveCount(0);
  await archive.getByTestId('collection-visit-brook-tide').click();
  await expect(page).toHaveURL(/\/characters\/?\?visit=brook$/);
  await expect(page.getByTestId('worker-private-room-brook')).toBeVisible();
  await page.getByRole('button',{name:'离开泉泡的房间'}).click();
  await expect(page).toHaveURL(/\/characters\/?$/);
  await expect(page.getByTestId('painted-worker-gallery')).toBeVisible();
});

test('corrupt collections remain untouched and cannot award cards',async({page})=>{
  await page.goto('/characters/#summon-screen');
  await expect(page.getByTestId('gothic-summon-stage')).toBeVisible();
  await page.evaluate(()=>localStorage.setItem('monster-apartment:character-collection:v1','{bad-original'));
  await page.reload();
  await page.getByTestId('collection-summon').click();
  await expect(page.getByText(/角色收藏存档已损坏或不可用/)).toBeVisible();
  expect(await page.evaluate(()=>localStorage.getItem('monster-apartment:character-collection:v1')))
    .toBe('{bad-original');
});

test('390px human character gallery fits without horizontal overflow',async({page})=>{
  await page.setViewportSize({width:390,height:844});
  await page.goto('/characters/');
  const gallery=page.getByTestId('painted-worker-gallery');
  await expect(gallery).toBeVisible();
  const result=await gallery.evaluate(el=>({
    spill:document.documentElement.scrollWidth-innerWidth,
    scrollable:el.scrollWidth>el.clientWidth,
  }));
  expect(result.spill).toBeLessThanOrEqual(2);
  expect(result.scrollable).toBe(true);
  await page.getByTestId('open-cinematic-summon').click();
  await expect(page.getByTestId('gothic-summon-stage')).toBeVisible();
});
