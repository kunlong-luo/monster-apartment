import {expect,test} from '@playwright/test';

test('the image-guided full-screen summon is a real scene with one persisted pull',async({page})=>{
  test.setTimeout(90_000);
  await page.setViewportSize({width:1440,height:900});
  await page.goto('/characters/#summon-screen');
  await expect(page.getByTestId('gothic-summon-stage')).toBeVisible({timeout:25_000});
  await expect(page.getByTestId('summon-featured-portrait')).toBeVisible();
  await expect(page.getByTestId('game-release')).toContainText('V3.75');
  const paintedBackground=page.getByTestId('summon-background-painting');
  await expect(paintedBackground).toBeVisible();
  await expect.poll(()=>paintedBackground.evaluate((image:HTMLImageElement)=>image.naturalWidth)).toBeGreaterThan(0);
  const backgroundSrc=await paintedBackground.getAttribute('src');
  expect(backgroundSrc).toContain('lobby-hero');
  await page.screenshot({path:'test-results/summon-desktop.png',animations:'disabled'});
  const featuredCardImage=page.getByTestId('summon-featured-card').locator('img').first();
  await expect.poll(()=>featuredCardImage.evaluate((img:HTMLImageElement)=>
    img.complete&&img.naturalWidth>0)).toBe(true);
  await expect(page.getByTestId('summon-featured-card')).toHaveAttribute('data-card-character','yuesha');
  await expect(page.getByTestId('summon-featured-card-tier')).toHaveText('SSR 神话');
  await expect(page.getByTestId('summon-featured-odds')).toContainText('1.00%');
  await expect(page.getByTestId('summon-yuesha-trial')).toBeVisible();
  await expect(page.getByTestId('summon-featured-room-link')).toHaveCount(0);
  await expect(page.getByRole('button',{name:'卡池详情'})).toHaveCount(0);
  await expect(page.getByRole('button',{name:'查看详情'})).toHaveCount(1);
  await expect(page.getByRole('button',{name:'查看档案'})).toHaveCount(0);
  await expect(page.getByRole('button',{name:'查看已收录契约、首饰和装备'})).toHaveCount(1);
  const dock=page.getByRole('navigation',{name:'月影契约世界导航'});
  await expect(dock.getByRole('link')).toHaveCount(7);
  await expect(page.getByTestId('collection-tickets')).toHaveText('3');
  await expect(page.getByTestId('collection-odds')).toContainText('1.00%');
  await expect(page.getByTestId('collection-odds')).toContainText('46.00%');
  for(const [id,rarity,rate] of [
    ['yuesha-eclipse','SSR 神话','1.00%'],
    ['yuesha-vow','SSR 传说','5.00%'],
    ['cinder-ember','SR 精英','17.00%'],
    ['fern-spring','R 稀有','31.00%'],
    ['brook-tide','N 常规','46.00%'],
  ] as const){
    await expect(page.getByTestId('summon-odds-'+id)).toContainText(rarity);
    await expect(page.getByTestId('summon-odds-'+id)).toContainText(rate);
  }
  await expect(page.getByTestId('summon-owned-progress')).toHaveText('收集进度 0/5');
  await page.getByTestId('summon-available-card').first().click();
  const archive=page.getByRole('dialog',{name:'角色契约图鉴与装备锻造'});
  await expect(archive).toBeVisible();
  await expect(archive.getByTestId('beast-contract-roster')).toBeVisible();
  await expect(archive.locator('[data-beast-art-status="awaiting-independent-cg"]')).toHaveCount(4);
  for(const [id,name] of [['eclipse-dragon','红月深渊龙'],['moon-wolf','皎月霜狼'],
    ['thorn-chimera','荆棘花木奇美拉'],['forge-golem','赤焰熔炉铠兽']] as const)
    await expect(archive.getByTestId('beast-lore-'+id)).toContainText(name);
  await archive.getByRole('button',{name:'返回契约大厅'}).click();
  const pools=page.locator('.summon-pool-item');
  await expect(pools).toHaveCount(5);
  await expect(pools.filter({hasText:'神话 · 月蚀'})).toHaveAttribute('aria-pressed','true');
  await pools.filter({hasText:'红月之邀'}).click();
  await expect(pools.filter({hasText:'红月之邀'})).toHaveAttribute('aria-pressed','true');
  await expect(pools.filter({hasText:'神话 · 月蚀'})).toHaveAttribute('aria-pressed','false');
  await expect(page.getByRole('heading',{name:'红月 · 晚宴之邀'})).toBeVisible();
  for(const [label,hero,tier,beast,rarity,rate] of [
    ['赤焰工坊','cinder','3','赤焰熔炉铠兽','SR 精英','17.00%'],
    ['荆棘回响','fern','2','荆棘花木奇美拉','R 稀有','31.00%'],
    ['潮汐来信','brook','1','皎月霜狼','N 常规','46.00%'],
  ] as const){
    await pools.filter({hasText:label}).click();
    const featured=page.getByTestId('summon-featured-portrait');
    await expect(featured).toHaveAttribute('data-featured-character',hero);
    await expect(featured).toHaveAttribute('data-tier',tier);
    await expect(page.getByTestId('summon-featured-card')).toHaveAttribute('data-card-character',hero);
    await expect(page.getByTestId('summon-featured-room-link')).toHaveAttribute('href',new RegExp('visit='+hero));
    await expect(page.getByTestId('summon-yuesha-trial')).toHaveCount(0);
    await expect(page.getByTestId('summon-featured-card')).toContainText(beast);
    await expect(page.getByTestId('summon-featured-card-tier')).toHaveText(rarity);
    await expect(page.getByTestId('summon-featured-odds')).toContainText(rate);
    await expect(page.locator('.summon-cinematic-title')).toContainText(beast);
    const image=featured.locator('img[data-portrait-source="dedicated-heroine"]');
    await expect(image).toBeVisible();
    await expect.poll(()=>image.evaluate(img=>(img as HTMLImageElement).naturalWidth))
      .toBeGreaterThan(0);
    await expect(page.getByTestId('collection-odds')).toContainText('46.00%');
  }
  await pools.filter({hasText:'红月之邀'}).click();
  await page.reload();
  await expect(pools.filter({hasText:'红月之邀'})).toHaveAttribute('aria-pressed','true');
  const ids=await page.getByTestId('summon-available-card').evaluateAll(nodes=>nodes.map(node=>node.getAttribute('data-character-id')));
  expect(ids).toEqual(['yuesha-eclipse','yuesha-vow','cinder-ember','fern-spring','brook-tide']);
  const portraits=page.getByTestId('summon-available-card');
  for(const card of await portraits.all()){
    const face=card.locator('img[data-portrait-source="dedicated-heroin-face"]');
    await expect(face).toBeVisible();
    await expect.poll(()=>face.evaluate(img=>(img as HTMLImageElement).naturalWidth))
      .toBeGreaterThan(0);
  }
  const faces=await portraits.locator('img').evaluateAll(nodes=>
    nodes.map(n=>(n as HTMLImageElement).currentSrc));
  expect(new Set(faces).size).toBe(4); // two rarity forms are the same Yuesha.
  await expect(page.getByText('2024/10/24')).toHaveCount(0);
  await page.getByTestId('collection-summon').click();
  await expect(page.getByTestId('collection-reveal')).toBeVisible();
  // Wait for the optional ritual animation; it may have completed already.
  await expect(page.getByTestId('collection-reveal-view-collection')).toBeVisible();
  await expect(page.getByTestId('collection-reveal-award')).toContainText('首次收录');
  await expect(page.getByTestId('collection-reveal-award')).toContainText('+1 锻造碎片');
  await expect(page.getByRole('button',{name:/再抽十次/})).toHaveCount(0);
  await page.getByTestId('collection-reveal-view-collection').click();
  const collected=page.getByRole('dialog',{name:'角色契约图鉴与装备锻造'});
  await expect(collected).toBeVisible();
  await expect(collected.locator('[data-testid^="collection-card-"]')).toHaveCount(5);
  await collected.getByRole('button',{name:'返回契约大厅'}).click();
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
test('ten-pull card backs can be revealed from keyboard, and collection is accessible afterwards',async({page})=>{
  test.setTimeout(90_000);
  await page.goto('/characters/#summon-screen');
  await expect(page.getByTestId('gothic-summon-stage')).toBeVisible();
  await page.evaluate(()=>{
    const key='monster-apartment:gacha-v2';
    localStorage.setItem(key,JSON.stringify({
      version:2,tickets:10,crystals:0,moonstones:0,pityCountdown:90,
      totalSummons:0,history:[],ownedIds:[],claimedProgressRewards:[],
      activePoolId:'mythic-eclipse'
    }));
  });
  await page.reload();
  await page.getByTestId('collection-summon-ten').click();
  await expect(page.getByTestId('collection-reveal')).toBeVisible();
  await page.getByRole('button',{name:/跳过仪式/}).click();
  const first=page.getByRole('button',{name:'翻开第 1 张契约卡'});
  await expect(first).toBeVisible();
  await first.focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('button',{name:/已揭晓：/})).toHaveCount(1);
  await page.getByRole('button',{name:'全部翻开'}).click();
  await expect(page.getByTestId('collection-reveal-view-collection')).toBeVisible();
  await expect(page.getByTestId('collection-reveal-award')).toHaveCount(10);
  expect(await page.getByTestId('collection-reveal-award')
    .filter({hasText:'首次收录'}).count()).toBeGreaterThanOrEqual(1);
  expect(await page.getByTestId('collection-reveal-award')
    .filter({hasText:'重复契约'}).count()).toBeGreaterThanOrEqual(5);
  await expect(page.getByRole('button',{name:/再抽十次/})).toHaveCount(0);
  await page.getByTestId('collection-reveal-view-collection').click();
  await expect(page.getByRole('dialog',{name:'角色契约图鉴与装备锻造'})).toBeVisible();
  const state=await page.evaluate(()=>JSON.parse(localStorage.getItem('monster-apartment:gacha-v2')!));
  expect(state.tickets).toBe(0);
  expect(state.totalSummons).toBe(10);
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

test('summon featured-room shortcut opens the real heroine suite without adding a route',async({page})=>{
  test.setTimeout(90_000);
  await page.setViewportSize({width:390,height:844});
  await page.goto('/characters/#summon-screen');
  await expect(page.getByTestId('gothic-summon-stage')).toBeVisible({timeout:25_000});
  await page.locator('.summon-pool-item').filter({hasText:'荆棘回响'}).click();
  await expect(page.getByTestId('summon-featured-card')).toHaveAttribute('data-card-character','fern');
  await page.getByTestId('summon-featured-room-link').click();
  await expect(page).toHaveURL(/\/characters\/?\?visit=fern$/);
  await expect(page.getByTestId('gothic-summon-stage')).toHaveCount(0);
  await expect(page.getByTestId('moonwork-world')).toHaveAttribute('data-area','characters');
  const privateRoom=page.getByTestId('worker-private-room-fern');
  await expect(privateRoom).toBeVisible();
  await expect(privateRoom.getByTestId('room-scene-backdrop')).toHaveAttribute('data-scene-id','fern');
  await page.getByRole('button',{name:'离开青枝的房间'}).click();
  await expect(privateRoom).toHaveCount(0);
  await expect(page).toHaveURL(/\/characters\/?$/);
  await expect(page.getByRole('navigation',{name:'月光工坊世界'}).getByRole('link')).toHaveCount(7);
});
 

test('320px and 390px summon HUD keeps resource row and core actions in first screen',async({page})=>{
  test.setTimeout(90_000);
  for(const [width,height] of [[320,700],[390,844]] as const){
    await page.setViewportSize({width,height});
    await page.goto('/characters/#summon-screen');
    await expect(page.getByTestId('gothic-summon-stage')).toBeVisible({timeout:25_000});
    const header=page.locator('.summon-cinematic-header');
    const wallet=page.locator('.summon-cinematic-wallet');
    await expect(wallet.locator('svg')).toHaveCount(3);
    const controls=page.locator('.summon-cinematic-tools');
    await expect(controls.locator('svg')).toHaveCount(4);
    const pool=page.locator('.summon-cinematic-pools');
    const summon=page.getByTestId('collection-summon');
    const ten=page.getByTestId('collection-summon-ten');
    const dock=page.getByRole('navigation',{name:'月影契约世界导航'});
    for(const element of [header,wallet,controls,pool,summon,ten,dock])
      await expect(element).toBeVisible();
    await expect(dock.getByRole('link')).toHaveCount(7);
    if(width===390)await page.screenshot({path:'test-results/summon-mobile.png',animations:'disabled'});
    const geometry=await page.evaluate(()=>{
      const box=(selector:string)=>{
        const r=document.querySelector(selector)?.getBoundingClientRect();
        if(!r)throw Error('Missing UI region '+selector);
        return {x:r.x,y:r.y,width:r.width,height:r.height,bottom:r.bottom,right:r.right};
      };
      return {
        header:box('.summon-cinematic-header'),
        wallet:box('.summon-cinematic-wallet'),
        tools:box('.summon-cinematic-tools'),
        pools:box('.summon-cinematic-pools'),
        summon:box('[data-testid="collection-summon"]'),
        ten:box('[data-testid="collection-summon-ten"]'),
        dock:box('[aria-label="月影契约世界导航"]'),
        spill:document.documentElement.scrollWidth-innerWidth,
      };
    });
    expect(geometry.spill).toBeLessThanOrEqual(2);
    expect(geometry.tools.right).toBeLessThanOrEqual(width+1);
    expect(geometry.wallet.y).toBeGreaterThan(geometry.tools.y);
    expect(geometry.pools.y).toBeGreaterThanOrEqual(geometry.header.bottom-2);
    expect(geometry.summon.bottom).toBeLessThanOrEqual(geometry.dock.y+1);
    expect(geometry.ten.bottom).toBeLessThanOrEqual(geometry.dock.y+1);
    await expect(summon).toBeEnabled();
    await expect(ten).toBeEnabled();
  }
});
