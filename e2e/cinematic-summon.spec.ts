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
  await expect(page.getByTestId('summon-owned-progress')).toHaveText('收集进度 0/5');
  const pools=page.locator('.summon-pool-item');
  await expect(pools).toHaveCount(5);
  await expect(pools.filter({hasText:'神话 · 月蚀'})).toHaveAttribute('aria-pressed','true');
  await pools.filter({hasText:'红月之邀'}).click();
  await expect(pools.filter({hasText:'红月之邀'})).toHaveAttribute('aria-pressed','true');
  await expect(pools.filter({hasText:'神话 · 月蚀'})).toHaveAttribute('aria-pressed','false');
  await expect(page.getByRole('heading',{name:'红月 · 晚宴之邀'})).toBeVisible();
  await page.reload();
  await expect(pools.filter({hasText:'红月之邀'})).toHaveAttribute('aria-pressed','true');
  const ids=await page.getByTestId('summon-available-card').evaluateAll(nodes=>nodes.map(node=>node.getAttribute('data-character-id')));
  expect(ids).toEqual(['yuesha-eclipse','yuesha-vow','cinder-ember','fern-spring','brook-tide']);
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
  await expect(page.getByTestId('summon-owned-progress')).toHaveText('收集进度 1/5');
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

test('desktop composition preserves the screenshot three-zone balance at 1648px',async({page})=>{
  await page.setViewportSize({width:1648,height:928});
  await page.goto('/characters/#summon-screen');
  await expect(page.getByTestId('gothic-summon-stage')).toBeVisible({timeout:25000});
  const proportions=await page.evaluate(()=>{
    const width=(selector:string)=>document.querySelector(selector)?.getBoundingClientRect().width??0;
    return {
      left:width('.summon-cinematic-pools'),
      center:width('.summon-cinematic-center'),
      right:width('.summon-cinematic-sidebar'),
      viewport:innerWidth,
      overflow:document.documentElement.scrollWidth-innerWidth,
      columns:getComputedStyle(document.querySelector('.summon-cinematic-sidebar')!).gridTemplateColumns
    };
  });
  expect(proportions.left/proportions.viewport).toBeGreaterThan(.16);
  expect(proportions.left/proportions.viewport).toBeLessThan(.21);
  expect(proportions.center/proportions.viewport).toBeGreaterThan(.39);
  expect(proportions.right/proportions.viewport).toBeGreaterThan(.26);
  expect(proportions.right/proportions.viewport).toBeLessThan(.32);
  expect(proportions.columns.split(' ').length).toBe(2);
  expect(proportions.overflow).toBeLessThanOrEqual(2);
});

test('switching pools preserves current currency and never overwrites a corrupt save',async({page})=>{
  await page.goto('/characters/#summon-screen');
  await expect(page.getByTestId('gothic-summon-stage')).toBeVisible();
  await page.evaluate(()=>{
    localStorage.setItem('monster-apartment:gacha-v2',JSON.stringify({
      version:2,tickets:11,crystals:0,moonstones:0,pityCountdown:90,
      totalSummons:0,history:[],ownedIds:[],claimedProgressRewards:[],
      activePoolId:'mythic-eclipse'
    }));
  });
  await page.locator('.summon-pool-item').filter({hasText:'红月之邀'}).click();
  expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('monster-apartment:gacha-v2')!).tickets)).toBe(11);
  await page.evaluate(()=>localStorage.setItem('monster-apartment:gacha-v2','{corrupt save'));
  await page.reload();
  await expect(page.getByTestId('summon-save-error')).toBeVisible();
  await expect(page.locator('.summon-pool-item').first()).toBeDisabled();
  expect(await page.evaluate(()=>localStorage.getItem('monster-apartment:gacha-v2'))).toBe('{corrupt save');
});
