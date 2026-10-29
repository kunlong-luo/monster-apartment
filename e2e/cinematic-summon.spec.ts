import {expect,test} from '@playwright/test';

test('the image-guided full-screen summon is a real scene with one persisted pull',async({page})=>{
  test.setTimeout(90_000);
  await page.setViewportSize({width:1440,height:900});
  await page.goto('/characters/#summon-screen');
  await expect(page.getByTestId('gothic-summon-stage')).toBeVisible({timeout:25_000});
  await expect(page.getByTestId('summon-featured-portrait')).toBeVisible();
  const dock=page.getByRole('navigation',{name:'月影契约世界导航'});
  await expect(dock.getByRole('link')).toHaveCount(7);
  await expect(page.getByTestId('collection-tickets')).toHaveText('3');
  await expect(page.getByTestId('collection-odds')).toContainText('1.00%');
  await expect(page.getByTestId('collection-odds')).toContainText('46.00%');
  await expect(page.getByText('2024/10/24')).toHaveCount(0);
  await page.getByTestId('collection-summon').click();
  await expect(page.getByTestId('collection-reveal')).toBeVisible();
  const saved=await page.evaluate(()=>{
    const g=JSON.parse(localStorage.getItem('monster-apartment:gacha-v2')||'null');
    const c=JSON.parse(localStorage.getItem('monster-apartment:character-collection:v1')||'null');
    return {tickets:g?.tickets,draws:c?.draws,history:g?.history,shards:c?.shards};
  });
  expect(saved.tickets).toBe(2);
  expect(saved.draws).toHaveLength(1);
  expect(saved.history).toHaveLength(1);
  expect(saved.history[0].characterId).toBe(saved.draws[0]);
  expect(saved.shards).toBeGreaterThanOrEqual(1);
  await page.reload();
  await expect(page.getByTestId('collection-tickets')).toHaveText('2');
  await page.getByRole('button',{name:'召唤记录'}).click();
  await expect(page.getByRole('dialog').last()).toContainText('契约召唤历史记录');
});
test('zero resources cannot mint cards; phone can access the real banners and action',async({page})=>{
  test.setTimeout(90_000);
  await page.setViewportSize({width:390,height:844});
  await page.goto('/characters/#summon-screen');
  await expect(page.getByTestId('gothic-summon-stage')).toBeVisible({timeout:25_000});
  await expect(page.getByTestId('collection-summon')).toBeVisible();
  const before=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
  expect(before).toBeLessThanOrEqual(2);
  await page.evaluate(()=>{
    localStorage.setItem('monster-apartment:gacha-v2',JSON.stringify({
      version:2,tickets:0,crystals:0,moonstones:0,pityCountdown:90,
      totalSummons:0,history:[],ownedIds:[],claimedProgressRewards:[],
      activePoolId:'mythic-eclipse'
    }));
  });
  await page.reload();
  await page.getByTestId('collection-summon').click();
  await expect(page.getByText(/契约信物与血晶不足/)).toBeVisible();
  expect(await page.evaluate(()=>localStorage.getItem('monster-apartment:character-collection:v1')))
    .toBeNull();
  await expect(page.getByRole('navigation',{name:'月影契约世界导航'}).getByRole('link')).toHaveCount(7);
});
