import {test,expect} from '@playwright/test';

test('V2.2 world has five reachable destinations without inventing a save',async({page})=>{
  await page.goto('/town/');
  await expect(page.getByTestId('moonwork-world')).toHaveAttribute('data-area','town');
  await expect(page.getByText('尚无可用的 V2 工坊存档')).toBeVisible();
  await expect(page.getByRole('link',{name:'进入工坊开始经营'}))
    .toHaveAttribute('href','/workshop');
  await page.getByRole('navigation',{name:'月光工坊世界'}).getByRole('link',{name:'委托大厅'}).click();
  await expect(page).toHaveURL(/\/orders\/?$/);
  await expect(page.getByTestId('moonwork-world')).toHaveAttribute('data-area','orders');
  await page.getByRole('navigation',{name:'月光工坊世界'}).getByRole('link',{name:'角色图鉴'}).click();
  await expect(page.getByTestId('moonwork-world')).toHaveAttribute('data-area','characters');
  await page.getByRole('navigation',{name:'月光工坊世界'}).getByRole('link',{name:'魔法仓库'}).click();
  await expect(page.getByTestId('moonwork-world')).toHaveAttribute('data-area','warehouse');
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
  await page.getByRole('navigation',{name:'月光工坊世界'}).getByRole('link',{name:'魔法仓库'}).click();
  await expect(page.getByTestId('world-cores')).toHaveText('8');
  await page.getByRole('button',{name:'付费采购 +1 晶核'}).click();
  await expect(page.getByTestId('world-cores')).toHaveText('9');
  await expect(page.getByTestId('world-coins')).toHaveText('90');
  await page.reload();
  await expect(page.getByTestId('world-cores')).toHaveText('9');
  await page.getByRole('navigation',{name:'月光工坊世界'}).getByRole('link',{name:'角色图鉴'}).click();
  await expect(page.getByText(/正在 06 号工位/)).toBeVisible();
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
  await page.getByRole('navigation',{name:'月光工坊世界'})
    .getByRole('link',{name:'工坊'}).click();
  await expect(page.getByTestId('v2-stage').locator('canvas')).toBeVisible({timeout:25000});
  await expect(page.locator('#target')).toHaveText('8');
  await expect(page.locator('#contract-title')).toHaveText('高额大宗订单');
  await page.getByRole('navigation',{name:'月光工坊世界'})
    .getByRole('link',{name:'委托大厅'}).click();
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
  await expect(page.getByTestId('town-painting')).toHaveJSProperty('naturalWidth',210);
  await expect(page.getByTestId('town-guide-painting')).toHaveJSProperty('naturalWidth',210);
  await expect(page.getByRole('navigation',{name:'月光街建筑入口'}).getByRole('link')).toHaveCount(3);
  await expect(page.getByRole('link',{name:/晶核工坊/})).toBeVisible();
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
  await page.getByRole('navigation',{name:'月光工坊世界'}).getByRole('link',{name:'工坊'}).click();
  await expect(page.getByTestId('v2-stage').locator('canvas')).toBeVisible({timeout:25000});
  await expect(page.getByTestId('v2-coins')).toHaveText('108');
  await page.getByTestId('v2-shift').click();
  await expect(page.getByTestId('v2-day')).toHaveText('7');
  await page.getByRole('navigation',{name:'月光工坊世界'}).getByRole('link',{name:'月光街'}).click();
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
  await page.getByRole('navigation',{name:'月光工坊世界'})
    .getByRole('link',{name:'魔法仓库'}).click();
  await expect(page.getByTestId('world-cores')).toHaveText('2');
  await page.getByRole('navigation',{name:'月光工坊世界'})
    .getByRole('link',{name:'工坊'}).click();
  await expect(page.getByTestId('v2-stage').locator('canvas')).toBeVisible({timeout:25000});
  await expect(page.getByTestId('v2-stock')).toHaveText('2');
  await page.getByTestId('v2-shift').click();
  await expect(page.getByTestId('v2-day')).toHaveText('4');
  await page.getByRole('navigation',{name:'月光工坊世界'})
    .getByRole('link',{name:'月光街'}).click();
  await expect(page.getByTestId('town-resident')).toContainText('阿洛');
  await expect(page.getByTestId('market-status')).toContainText('第 4 天');
  await page.reload();
  await expect(page.getByTestId('town-resident')).toContainText('阿洛');
  await expect(page.getByTestId('town-resident')).toContainText('累计帮助街区居民 1 次');
});
