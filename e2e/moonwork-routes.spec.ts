import {test,expect} from '@playwright/test';
import {navigateScene} from './helpers/scene-navigation';

test('a new player entering via town gets one real initialized save across all scenes',async({page})=>{
  await page.goto('/town/');
  await expect(page.getByTestId('moonwork-world')).toHaveAttribute('data-area','town');
  await expect(page.getByTestId('moonlit-town-scene')).toBeVisible();
  await expect(page.getByTestId('world-day')).toHaveText('1');
  await expect(page.getByTestId('world-coins')).toHaveText('100');
  await expect.poll(()=>page.evaluate(()=>
    JSON.parse(localStorage.getItem('monster-apartment:workshop-v2-lab')??'null')?.version))
    .toBe(2);
  await navigateScene(page,'/orders/');
  await expect(page).toHaveURL(/\/orders\/?$/);
  await expect(page.getByTestId('moonwork-world')).toHaveAttribute('data-area','orders');
  await navigateScene(page,'/characters/');
  await expect(page.getByTestId('moonwork-world')).toHaveAttribute('data-area','characters');
  await navigateScene(page,'/warehouse/');
  await expect(page.getByTestId('moonwork-world')).toHaveAttribute('data-area','warehouse');
  await expect(page.getByTestId('warehouse-purchase-blocked')).toContainText('首次完成普通订单');
  await expect(page.getByRole('button',{name:'付费采购 +1 晶核'})).toHaveCount(0);
});
test('orders and warehouse transact the same real localStorage save',async({page})=>{
  const sample={
    version:2,day:6,coins:132,
    tiles:Array.from({length:15},(_,i)=>
      i===5?{craft:'well',worker:'brook',stored:5}:
      i===6?{craft:'garden',worker:'fern',stored:0}:
      i===7?{craft:'kiln',worker:'cinder',stored:0}:null),
    warehouse:{core:8},order:{due:9,cores:3,reward:95},last:null,
    completed:1,failed:0,
    patron:{status:'offered',due:8,cores:15,reward:135}
  };
  await page.addInitScript(world=>{
    const key='monster-apartment:workshop-v2-lab';
    if(!localStorage.getItem(key))localStorage.setItem(key,JSON.stringify(world));
  },sample);
  await page.goto('/orders/');
  await expect(page.getByTestId('world-coins')).toHaveText('132');
  await page.getByRole('button',{name:'接受月纱委托'}).click();
  await expect(page.getByText('当前状态：进行中')).toBeVisible();
  await navigateScene(page,'/warehouse/');
  await expect(page.getByTestId('world-cores')).toHaveText('8');
  await expect(page.getByTestId('warehouse-core-demand')).toContainText('普通订单需求：3 枚');
  await expect(page.getByTestId('warehouse-core-demand')).toContainText('已接受的月纱委托需求：15 枚');
  await expect(page.getByTestId('warehouse-core-shortfall')).toHaveText('即时合计缺口：10 枚');
  await expect(page.getByTestId('warehouse-purchase-preview')).toContainText('剩余 90 星币');
  await page.getByRole('button',{name:'付费采购 +1 晶核'}).click();
  await expect(page.getByTestId('world-cores')).toHaveText('9');
  await expect(page.getByTestId('world-coins')).toHaveText('90');
  await expect(page.getByTestId('warehouse-core-shortfall')).toHaveText('即时合计缺口：9 枚');
  await page.reload();
  await expect(page.getByTestId('world-cores')).toHaveText('9');
  await expect(page.getByTestId('warehouse-core-shortfall')).toHaveText('即时合计缺口：9 枚');
  await page.getByRole('button',{name:'付费采购 +1 晶核'}).click();
  await expect(page.getByTestId('world-coins')).toHaveText('48');
  await page.getByRole('button',{name:'付费采购 +1 晶核'}).click();
  await expect(page.getByTestId('world-coins')).toHaveText('6');
  await expect(page.getByTestId('world-cores')).toHaveText('11');
  await expect(page.getByTestId('warehouse-core-shortfall')).toHaveText('即时合计缺口：7 枚');
  await expect(page.getByTestId('warehouse-purchase-blocked')).toHaveText('星币不足，还差 36 ✦。');
  await expect(page.getByRole('button',{name:'付费采购 +1 晶核'})).toHaveCount(0);
  await navigateScene(page,'/characters/');
  await page.getByRole('button',{name:/选择泉泡/}).click();
  await page.getByRole('tab',{name:'养成'}).click();
  await expect(page.getByTestId('character-workshop-assignment')).toContainText('正在 06 号工位');
});


test('premium contract really changes the Pixi workshop requirement and survives a round trip',async({page})=>{
  test.setTimeout(90_000);
  const sample={
    version:2,day:6,coins:132,
    tiles:Array.from({length:15},(_,i)=>
      i===5?{craft:'well',worker:'brook',stored:5}:
      i===6?{craft:'garden',worker:'fern',stored:0}:
      i===7?{craft:'kiln',worker:'cinder',stored:0}:null),
    warehouse:{core:8},order:{due:9,cores:3,reward:95},last:null,
    completed:1,failed:0,
    patron:{status:'offered',due:8,cores:15,reward:135}
  };
  await page.addInitScript(state=>{
    const key='monster-apartment:workshop-v2-lab';
    if(!localStorage.getItem(key))localStorage.setItem(key,JSON.stringify(state));
  },sample);
  await page.goto('/orders/');
  await expect(page.getByTestId('world-premium-offer')).toBeVisible();
  await expect(page.getByTestId('world-premium-forecast')).toContainText('大宗可交付');
  await page.getByRole('button',{name:'接受高额大宗订单'}).click();
  await expect(page.getByTestId('world-premium-offer')).toBeHidden();
  await expect(page.getByText('高额订单已接受')).toBeVisible();
  await navigateScene(page,'/workshop/');
  await expect(page.getByTestId('v2-stage').locator('canvas')).toBeVisible({timeout:25000});
  await expect(page.locator('#target')).toHaveText('8');
  await expect(page.locator('#contract-title')).toHaveText('高额大宗订单');
  await navigateScene(page,'/orders/');
  await expect(page.getByText('高额订单已接受')).toBeVisible();
  await page.reload();
  await expect(page.getByText('高额订单已接受')).toBeVisible();
});


test('moonlit town works as a real one-purchase-per-day supplier for the same workshop',async({page})=>{
  test.setTimeout(90_000);
  const seeded={
    version:2,day:6,coins:132,
    tiles:Array.from({length:15},(_,i)=>
      i===5?{craft:'well',worker:'brook',stored:5}:
      i===6?{craft:'garden',worker:'fern',stored:0}:
      i===7?{craft:'kiln',worker:'cinder',stored:0}:null),
    warehouse:{core:8},order:{due:9,cores:3,reward:95},last:null,
    completed:1,failed:0,
    patron:{status:'offered',due:8,cores:15,reward:135}
  };
  await page.addInitScript(state=>{
    const key='monster-apartment:workshop-v2-lab';
    if(!localStorage.getItem(key))localStorage.setItem(key,JSON.stringify(state));
  },seeded);
  await page.goto('/town/');
  await expect(page.getByTestId('moonlit-town-scene')).toBeVisible();
  await expect.poll(()=>page.getByTestId('town-painting').evaluate(el=>
    (el as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
  await expect.poll(()=>page.getByTestId('town-guide-painting').evaluate(el=>
    (el as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
  await expect(page.getByRole('navigation',{name:'月光街建筑入口'}).getByRole('link')).toHaveCount(3);
  await expect(page.getByTestId('moonlit-town-scene').getByRole('link',{name:'晶核工坊'})).toBeVisible();
  await expect(page.getByTestId('moonlit-market')).toBeVisible();
  await expect(page.getByTestId('market-status')).toContainText('可采购一批');
  await page.getByTestId('town-offer-fiber').getByRole('button',{name:'购买本日货箱'}).click();
  await expect(page.getByTestId('market-status')).toContainText('今日交易已完成');
  await expect(page.getByTestId('world-coins')).toHaveText('108');
  await expect(page.getByTestId('town-offer-core').getByRole('button')).toBeDisabled();
  const saved=await page.evaluate(()=>{
    const raw=localStorage.getItem('monster-apartment:workshop-v2-lab');
    return raw?JSON.parse(raw):null;
  });
  expect(saved.tiles[6].stored).toBe(3);
  expect(saved.market).toEqual({day:6,kind:'fiber'});
  await navigateScene(page,'/workshop/');
  await expect(page.getByTestId('v2-stage').locator('canvas')).toBeVisible({timeout:25000});
  await expect(page.getByTestId('v2-coins')).toHaveText('108');
  await page.getByTestId('v2-shift').click();
  await expect(page.getByTestId('v2-day')).toHaveText('7');
  await navigateScene(page,'/town/');
  await expect(page.getByTestId('market-status')).toContainText('第 7 天');
  await expect(page.getByTestId('town-offer-water').getByRole('button',{name:'购买本日货箱'})).toBeEnabled();
  await page.getByTestId('town-offer-water').getByRole('button').click();
  await expect(page.getByTestId('market-status')).toContainText('今日交易已完成');
  await page.reload();
  await expect(page.getByTestId('market-status')).toContainText('今日交易已完成');
});


test('street visitor consumes a real core and blocks buying until the next production day',async({page})=>{
  test.setTimeout(90_000);
  const seed={
    version:2,day:3,coins:132,
    tiles:Array.from({length:15},(_,i)=>
      i===5?{craft:'well',worker:'brook',stored:5}:
      i===6?{craft:'garden',worker:'fern',stored:3}:
      i===7?{craft:'kiln',worker:'cinder',stored:0}:null),
    warehouse:{core:3},order:{due:9,cores:3,reward:95},last:null,
    completed:1,failed:0,patron:null
  };
  await page.addInitScript(world=>{
    const key='monster-apartment:workshop-v2-lab';
    if(!localStorage.getItem(key))localStorage.setItem(key,JSON.stringify(world));
  },seed);
  await page.goto('/town/');
  const visitor=page.getByTestId('town-resident');
  await expect(visitor).toContainText('伊索');
  await expect(visitor).toContainText('现有可用 3');
  await page.getByTestId('resident-deliver').click();
  await expect(page.getByTestId('world-coins')).toHaveText('183');
  await expect(visitor).toContainText('累计帮助街区居民 1 次');
  await expect(page.getByTestId('resident-deliver')).toBeDisabled();
  await expect(page.getByTestId('market-status')).toContainText('今日交易已完成');
  await navigateScene(page,'/warehouse/');
  await expect(page.getByTestId('world-cores')).toHaveText('2');
  await navigateScene(page,'/workshop/');
  await expect(page.getByTestId('v2-stage').locator('canvas')).toBeVisible({timeout:25000});
  await expect(page.getByTestId('v2-stock')).toHaveText('2');
  await page.getByTestId('v2-shift').click();
  await expect(page.getByTestId('v2-day')).toHaveText('4');
  await navigateScene(page,'/town/');
  await expect(page.getByTestId('town-resident')).toContainText('阿洛');
  await expect(page.getByTestId('market-status')).toContainText('第 4 天');
  await page.reload();
  await expect(page.getByTestId('town-resident')).toContainText('阿洛');
  await expect(page.getByTestId('town-resident')).toContainText('累计帮助街区居民 1 次');
});


test('painted worker roster and scene art load as real gameplay destinations',async({page})=>{
  await page.goto('/workshop/');
  await expect(page.getByTestId('v2-stage').locator('canvas')).toBeVisible({timeout:25000});
  await navigateScene(page,'/characters/');
  await expect(page.getByTestId('painted-worker-gallery')).toBeVisible({timeout:15_000});
  for(const id of ['brook','fern','cinder']){
    const card=page.getByTestId('worker-card-'+id);
    await expect(card).toHaveAttribute('data-art-layout','figure');
    await expect(card).toHaveAttribute('data-art-status','candidate');
    await expect(card.locator('img.cg-card__image')).toBeVisible();
  }
  await navigateScene(page,'/orders/');
  await expect(page.getByTestId('painted-order-hero')).toBeVisible();
  await navigateScene(page,'/warehouse/');
  await expect(page.getByTestId('painted-warehouse-hero')).toBeVisible();
});


test('choosing an illustrated guild worker preselects their real Pixi factory assignment',async({page})=>{
  test.setTimeout(90_000);
  await page.goto('/workshop/');
  await expect(page.getByTestId('v2-stage').locator('canvas')).toBeVisible({timeout:25_000});
  await navigateScene(page,'/characters/');
  await expect(page.getByTestId('painted-worker-gallery')).toBeVisible();
  await page.getByRole('button',{name:/选择青枝/}).click();
  await page.getByRole('tab',{name:'养成'}).click();
  await page.getByRole('link',{name:'安排青枝到工坊'}).click();
  await expect(page).toHaveURL(/\/workshop\/?\?worker=fern/);
  await expect(page.getByTestId('v2-stage').locator('canvas')).toBeVisible({timeout:25_000});
  await expect(page.getByTestId('v2-worker-fern')).toHaveClass(/active/);
  await expect(page.locator('#selected')).toContainText('待派工');
  // V3.90 uses a real portrait within the worker miniature. The Pixi stage
  // also independently reports its transparent humanoid worker presentation.
  await expect(page.getByTestId('v2-worker-fern').locator('.worker-miniature img'))
    .toHaveCount(1);
  await expect(page.getByTestId('v2-stage'))
    .toHaveAttribute('data-worker-art','hi-dpi-transparent-humanoid');
  // Complete the real interaction: choosing a machine assigns the selected
  // worker and persists it for all other routes, not merely changing a label.
  const canvas=page.getByTestId('v2-stage').locator('canvas');
  const box=await canvas.boundingBox();
  expect(box).toBeTruthy();
  await canvas.click({position:{
    x:(131+2*160+73)/1050*box!.width,
    y:(104+1*160+73)/645*box!.height,
  }});
  await expect(page.getByTestId('v2-status')).toContainText('青枝已派往');
  await expect.poll(()=>page.evaluate(()=>{
    const raw=localStorage.getItem('monster-apartment:workshop-v2-lab');
    const world=raw?JSON.parse(raw):null;
    return world?.tiles?.[7]?.worker??null;
  })).toBe('fern');
});


for(const viewport of [{width:1440,height:900},{width:390,height:844}]){
  test(`shared coins survive actual purchases, failed writes and commission rewards at ${viewport.width}px`,async({page})=>{
    test.setTimeout(120_000);
    await page.setViewportSize(viewport);
    const key='monster-apartment:workshop-v2-lab';
    const initial={
      version:2,day:6,coins:132,
      tiles:Array.from({length:15},(_,i)=>
        i===5?{craft:'well',worker:'brook',stored:5}:
        i===6?{craft:'garden',worker:'fern',stored:0}:
        i===7?{craft:'kiln',worker:'cinder',stored:0}:null),
      warehouse:{core:8},order:{due:6,cores:3,reward:95},last:null,
      completed:1,failed:0,patron:{status:'offered',due:8,cores:15,reward:135}
    };
    await page.addInitScript(({key,initial})=>{
      if(localStorage.getItem(key)===null)localStorage.setItem(key,JSON.stringify(initial));
    },{key,initial});
    const raw=()=>page.evaluate(key=>localStorage.getItem(key),key);
    const read=async()=>JSON.parse((await raw())!);
    await page.goto('/');
    await expect(page.getByTestId('lobby-coins')).toHaveText('132');
    await page.goto('/apartment/');
    await expect(page.getByTestId('ga-coins')).toHaveText('132');
    await navigateScene(page,'/town/');
    await expect(page.getByTestId('world-coins')).toHaveText('132');
    const beforeFailure=await raw();
    // A real UI purchase with a simulated storage write failure must not debit.
    await page.evaluate(key=>{
      const set=Storage.prototype.setItem;
      Storage.prototype.setItem=function(name,value){
        if(name===key)throw new DOMException('Test storage failure','QuotaExceededError');
        set.call(this,name,value);
      };
    },key);
    const fiber=page.getByTestId('town-offer-fiber');
    await fiber.getByRole('button',{name:'购买本日货箱'}).click();
    await expect(fiber).toContainText('操作未完成');
    await expect(page.getByTestId('world-coins')).toHaveText('132');
    expect(await raw()).toBe(beforeFailure);
    expect((await read()).day).toBe(6);
    await page.reload();
    await fiber.getByRole('button',{name:'购买本日货箱'}).click();
    await expect(page.getByTestId('world-coins')).toHaveText('108');
    expect((await read()).tiles[6].stored).toBe(3);
    await expect(fiber.getByRole('button')).toBeDisabled();
    await navigateScene(page,'/warehouse/');
    await expect(page.getByTestId('world-coins')).toHaveText('108');
    const buy=page.getByRole('button',{name:'付费采购 +1 晶核'});
    await buy.click();
    await expect(page.getByTestId('world-coins')).toHaveText('66');
    await buy.click();
    await expect(page.getByTestId('world-coins')).toHaveText('24');
    await expect(page.getByTestId('world-cores')).toHaveText('10');
    await expect(page.getByTestId('warehouse-purchase-blocked')).toContainText('星币不足');
    await expect(buy).toHaveCount(0);
    const beforeShift=await read();
    expect(beforeShift.warehouse.core).toBe(10);
    expect(beforeShift.tiles[5].stored).toBe(5);
    expect(beforeShift.tiles[6].stored).toBe(3);
    expect(beforeShift.coins).toBe(24);
    expect(beforeShift.day).toBe(6);
    await navigateScene(page,'/workshop/');
    await expect(page.getByTestId('v2-stage').locator('canvas')).toBeVisible({timeout:25_000});
    await expect(page.getByTestId('v2-coins')).toHaveText('24');
    await page.getByTestId('v2-shift').click();
    await expect(page.getByTestId('v2-coins')).toHaveText('119');
    const afterShift=await read();
    expect(afterShift.coins).toBe(119);
    expect(afterShift.day).toBe(7);
    await expect(page.getByTestId('v2-day')).toHaveText('7');
    expect(afterShift.completed).toBe(2);
    expect(afterShift.last.fulfilled).toBe(true);
    expect(afterShift.warehouse.core).toBe(beforeShift.warehouse.core+afterShift.last.cores-3);
    expect(afterShift.last).toMatchObject({water:2,fiber:2,cores:2});
    expect(afterShift.tiles[5].stored).toBe(beforeShift.tiles[5].stored+2-1);
    expect(afterShift.tiles[6].stored).toBe(beforeShift.tiles[6].stored+2-2);
    expect(afterShift.tiles[7].stored).toBe(beforeShift.tiles[7].stored);
    await expect(page.getByTestId('v2-cores')).toHaveText('9');
    await navigateScene(page,'/');
    await expect(page.getByTestId('lobby-coins')).toHaveText('119');
    await expect(page.getByRole('button',{name:'打开玩家资料'})).toContainText('第 7 天');
    await page.goto('/apartment/');
    await expect(page.getByTestId('ga-coins')).toHaveText('119');
    await expect(page.getByTestId('ga-day')).toHaveText('7');
    await navigateScene(page,'/town/');
    await expect(page.getByTestId('world-coins')).toHaveText('119');
    await expect(page.getByTestId('world-day')).toHaveText('7');
    await navigateScene(page,'/warehouse/');
    await expect(page.getByTestId('world-coins')).toHaveText('119');
    await expect(page.getByTestId('world-day')).toHaveText('7');
    await page.reload();
    await expect(page.getByTestId('world-coins')).toHaveText('119');
    await expect(page.getByTestId('world-day')).toHaveText('7');
    for(const route of ['/orders/','/characters/']){
      await navigateScene(page,route);
      await expect(page.getByTestId('world-day')).toHaveText('7');
    }
    await page.goto('/');
    await expect(page.getByTestId('lobby-coins')).toHaveText('119');
    expect((await read()).coins).toBe(119);
    expect((await read()).day).toBe(7);
  });
  test(`shared inventory settles premium, patron and resident trades at ${viewport.width}px`,async({page})=>{
    test.setTimeout(120_000);
    await page.setViewportSize(viewport);
    const key='monster-apartment:workshop-v2-lab';
    const initial={
      version:2,day:6,coins:132,
      tiles:Array.from({length:15},(_,i)=>
        i===5?{craft:'well',worker:'brook',stored:5}:
        i===6?{craft:'garden',worker:'fern',stored:3}:
        i===7?{craft:'kiln',worker:'cinder',stored:0}:null),
      warehouse:{core:15},order:{due:6,cores:3,reward:95},last:null,
      completed:1,failed:0,patron:{status:'offered',due:6,cores:5,reward:135}
    };
    await page.addInitScript(({key,initial})=>{
      if(localStorage.getItem(key)===null)localStorage.setItem(key,JSON.stringify(initial));
    },{key,initial});
    const raw=()=>page.evaluate(key=>localStorage.getItem(key),key);
    const read=async()=>JSON.parse((await raw())!);
    await page.goto('/town/');
    await expect(page.getByTestId('world-cores')).toHaveText('15');
    await page.getByTestId('resident-deliver').click();
    await expect(page.getByTestId('world-cores')).toHaveText('14');
    await expect(page.getByTestId('resident-deliver')).toBeDisabled();
    await expect(page.getByTestId('town-offer-core').getByRole('button')).toBeDisabled();
    expect((await read()).residentsHelped).toBe(1);
    await navigateScene(page,'/orders/');
    await page.getByRole('button',{name:'接受高额大宗订单'}).click();
    await page.getByRole('button',{name:'接受月纱委托'}).click();
    await expect(page.getByTestId('world-premium-offer')).toHaveCount(0);
    await expect(page.getByText('当前状态：进行中')).toBeVisible();
    const before=await read();
    expect(before.warehouse.core).toBe(14);
    expect(before.order.cores).toBe(8);
    expect(before.patron.status).toBe('active');
    await navigateScene(page,'/workshop/');
    await expect(page.getByTestId('v2-stage').locator('canvas')).toBeVisible({timeout:25_000});
    await expect(page.getByTestId('v2-cores')).toHaveText('14');
    await page.getByTestId('v2-shift').click();
    await expect(page.getByTestId('v2-day')).toHaveText('7');
    await expect(page.getByTestId('v2-cores')).toHaveText('3');
    const after=await read();
    expect(after.last).toMatchObject({water:2,fiber:2,cores:2,fulfilled:true,premium:true});
    expect(after.warehouse.core).toBe(before.warehouse.core+2-8-5);
    expect(after.tiles[5].stored).toBe(6);
    expect(after.tiles[6].stored).toBe(3);
    expect(after.tiles[7].stored).toBe(0);
    expect(after.completed).toBe(2);
    expect(after.patron.status).toBe('completed');
    await navigateScene(page,'/town/');
    await expect(page.getByTestId('world-cores')).toHaveText('3');
    await page.getByTestId('town-offer-water').getByRole('button',{name:'购买本日货箱'}).click();
    await expect(page.getByTestId('market-status')).toContainText('今日交易已完成');
    expect((await read()).tiles[5].stored).toBe(9);
    expect((await read()).warehouse.core).toBe(3);
    await expect(page.getByTestId('resident-deliver')).toBeDisabled();
    const committed=await raw();
    await navigateScene(page,'/warehouse/');
    await expect(page.getByTestId('world-cores')).toHaveText('3');
    const grid=page.getByTestId('warehouse-stock-grid');
    await expect(grid.getByText('水汽泵储水',{exact:false}).locator('..').locator('b')).toHaveText('9');
    await expect(grid.getByText('温室内孢子',{exact:false}).locator('..').locator('b')).toHaveText('3');
    await expect(page.getByTestId('warehouse-purchase-blocked')).toContainText('已结束');
    await page.reload();
    await expect(page.getByTestId('world-cores')).toHaveText('3');
    await navigateScene(page,'/orders/');
    await expect(page.getByTestId('world-cores')).toHaveText('3');
    await expect(page.getByText('当前状态：交付完成')).toBeVisible();
    await navigateScene(page,'/');
    await expect(page.getByTestId('lobby-cores')).toHaveText('3');
    await page.goto('/apartment/');
    await expect(page.getByTestId('ga-cores')).toHaveText('3');
    expect(await raw()).toBe(committed);
  });
  test(`shared calendar waits for real stock and advances once after an explicit auto contract opt-in at ${viewport.width}px`,async({page})=>{
    test.setTimeout(120_000);
    await page.setViewportSize(viewport);
    const key='monster-apartment:workshop-v2-lab';
    const initial={
      version:2,day:6,coins:132,
      tiles:Array.from({length:15},(_,i)=>i===5?{craft:'well',worker:'brook',stored:5}:null),
      warehouse:{core:2},order:{due:6,cores:3,reward:95},last:null,
      completed:1,failed:0,patron:{status:'offered',due:8,cores:15,reward:135}
    };
    await page.addInitScript(({key,initial})=>{
      if(localStorage.getItem(key)===null)localStorage.setItem(key,JSON.stringify(initial));
    },{key,initial});
    const read=()=>page.evaluate(key=>JSON.parse(localStorage.getItem(key)!),key);
    // Accelerate only the saved scheduler deadline; never mutate day, stock,
    // completion or reward. The mounted production runtime must transact.
    const dueNow=(blockWrite=false)=>page.evaluate(({key,blockWrite})=>{
      const s=JSON.parse(localStorage.getItem(key)!);
      const now=Date.now();
      s.auto.lastSimulatedAt=now-2000;
      s.auto.nextContractAt=now-1000;
      const raw=JSON.stringify(s);
      localStorage.setItem(key,raw);
      if(blockWrite){
        const set=Storage.prototype.setItem;
        Storage.prototype.setItem=function(name,value){
          if(name===key){
            document.documentElement.dataset.u07WriteFailed='true';
            throw new DOMException('Test storage failure','QuotaExceededError');
          }
          set.call(this,name,value);
        };
      }
      window.dispatchEvent(new Event('moonwork:v2-update'));
      return {raw,due:s.auto.nextContractAt};
    },{key,blockWrite});
    await page.goto('/workshop/');
    await expect(page.getByTestId('v2-stage').locator('canvas')).toBeVisible({timeout:25_000});
    const auto=page.getByTestId('workshop-auto-toggle');
    await auto.click();
    await expect(auto).toHaveAttribute('aria-pressed','true');
    const contract=page.getByTestId('workshop-auto-contract-toggle');
    await expect(contract).toHaveAttribute('aria-pressed','false');
    expect((await read()).day).toBe(6);
    expect((await read()).auto.nextContractAt).toBe(0);
    await expect(page.getByTestId('v2-shift')).toBeDisabled();
    await contract.click();
    await expect(contract).toHaveAttribute('aria-pressed','true');
    expect((await read()).day).toBe(6);
    const shortage=await dueNow();
    await expect.poll(async()=>(await read()).auto.nextContractAt,{timeout:15000}).toBeGreaterThan(shortage.due);
    const waiting=await read();
    expect({day:waiting.day,coins:waiting.coins,cores:waiting.warehouse.core,
      completed:waiting.completed,failed:waiting.failed}).toEqual({day:6,coins:132,cores:2,completed:1,failed:0});
    await navigateScene(page,'/town/');
    await expect(page.getByTestId('world-day')).toHaveText('6');
    const purchase=page.getByTestId('town-offer-core').getByRole('button',{name:'购买本日货箱'});
    await purchase.click();
    await expect(page.getByTestId('world-cores')).toHaveText('3');
    await expect(page.getByTestId('world-coins')).toHaveText('95');
    const failed=await dueNow(true);
    await expect(page.locator('html')).toHaveAttribute('data-u07-write-failed','true',{timeout:15000});
    expect(await page.evaluate(key=>localStorage.getItem(key),key)).toBe(failed.raw);
    await expect(page.getByTestId('world-day')).toHaveText('6');
    // Reload restores storage availability, not a fabricated successful day.
    await page.reload();
    await expect(page.getByTestId('world-day')).toHaveText('7',{timeout:15000});
    await expect(page.getByTestId('world-coins')).toHaveText('190');
    const delivered=await read();
    expect({day:delivered.day,coins:delivered.coins,cores:delivered.warehouse.core,
      completed:delivered.completed,failed:delivered.failed,last:delivered.last})
      .toEqual({day:7,coins:190,cores:0,completed:2,failed:0,last:null});
    await page.evaluate(()=>{
      for(let i=0;i<3;i++)window.dispatchEvent(new Event('moonwork:v2-update'));
    });
    await navigateScene(page,'/orders/');
    await expect(page.getByTestId('world-day')).toHaveText('7');
    await navigateScene(page,'/workshop/');
    await expect(contract).toHaveAttribute('aria-pressed','true');
    await contract.click();
    await expect(contract).toHaveAttribute('aria-pressed','false');
    expect((await read()).auto.nextContractAt).toBe(0);
    expect((await read()).day).toBe(7);
    await auto.click();
    await expect(auto).toHaveAttribute('aria-pressed','false');
    await expect(page.getByTestId('v2-shift')).toBeEnabled();
    await navigateScene(page,'/');
    await expect(page.getByRole('button',{name:'打开玩家资料'})).toContainText('第 7 天');
    await page.goto('/apartment/');
    await expect(page.getByTestId('ga-day')).toHaveText('7');
    await navigateScene(page,'/warehouse/');
    await expect(page.getByTestId('world-day')).toHaveText('7');
    await navigateScene(page,'/characters/');
    await expect(page.getByTestId('world-day')).toHaveText('7');
    await page.reload();
    await expect(page.getByTestId('world-day')).toHaveText('7');
    const final=await read();
    expect(final.day).toBe(7);
    expect(final.completed).toBe(2);
    expect(final.coins).toBe(190);
  });

}
