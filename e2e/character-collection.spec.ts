import {expect,test} from '@playwright/test';

test('the character gallery centers human residents and opens the real summon scene',async({page})=>{
  test.setTimeout(90_000);
  await page.setViewportSize({width:1440,height:900});
  await page.goto('/characters/');
  const gallery=page.getByTestId('painted-worker-gallery');
  await expect(gallery).toBeVisible({timeout:25_000});
  await expect(page.getByTestId('character-gallery-header')).toBeVisible();
  await expect(page.getByTestId('gallery-collected-count')).toContainText('0/5');
  await expect(page.locator('.gothic-summon-shell')).toHaveCount(0);
  await expect(page.getByTestId('open-cinematic-summon')).toHaveCount(1);
  for(const id of ['brook','fern','cinder']){
    const card=page.getByTestId('worker-card-'+id);
    await expect(card).toBeAttached();
    await expect(card.locator('.mw-worker-portrait')).toHaveAttribute('data-figure-kind','humanoid');
    await expect(card.locator('.worker-artwork')).toHaveAttribute('data-art-source','hi-dpi-transparent-human');
  }
  const columns=await gallery.evaluate(node=>getComputedStyle(node).gridTemplateColumns.split(' ').length);
  expect(columns).toBe(3);
  await page.getByTestId('open-cinematic-summon').click();
  await expect(page).toHaveURL(/\/characters\/?#summon-screen$/);
  await expect(page.getByTestId('gothic-summon-stage')).toBeVisible();
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
  await page.goto('/characters/');
  await expect(page.getByTestId('life-equipped-brook')).toContainText('月纹吊坠');
  await expect(page.getByTestId('gallery-collected-count')).toContainText('1/5');
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
  const result=await page.evaluate(()=>({
    spill:document.documentElement.scrollWidth-innerWidth,
    columns:getComputedStyle(document.querySelector('[data-testid="painted-worker-gallery"]')!).gridTemplateColumns.split(' ').length,
  }));
  expect(result.spill).toBeLessThanOrEqual(2);
  expect(result.columns).toBe(1);
  await page.getByTestId('open-cinematic-summon').click();
  await expect(page.getByTestId('gothic-summon-stage')).toBeVisible();
});
