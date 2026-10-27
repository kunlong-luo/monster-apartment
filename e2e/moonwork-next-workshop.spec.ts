import {test,expect} from '@playwright/test';

test('Next-owned PixiJS workshop survives SPA navigation and keeps one save',async({page})=>{
  test.setTimeout(90_000);
  const errors:string[]=[];
  page.on('pageerror',error=>errors.push(error.message));
  await page.goto('/workshop/');
  const stage=page.getByTestId('v2-stage');
  await expect(stage.locator('canvas')).toBeVisible({timeout:25_000});
  await expect(stage).toHaveAttribute('data-renderer','pixi-webgl-bitmap');
  await expect(page.getByTestId('v2-day')).toHaveCount(1);
  await expect(page.getByTestId('v2-coins')).toHaveCount(1);
  await expect(page.getByTestId('v2-internal-day')).toHaveCount(0);
  await expect(page.getByTestId('v2-internal-coins')).toHaveCount(0);
  await expect(page.getByTestId('v2-day')).toHaveText('1');
  await expect(page.getByTestId('v2-world-nav')).toBeVisible();
  await expect(page.getByTestId('v2-status')).toBeVisible();
  await expect(page.getByTestId('workshop-react-hud')).toBeVisible();
  await expect(page.locator('#root .game-world-nav')).toHaveCount(0);
  await expect(page.getByTestId('v2-coins')).toHaveText('100');
  await expect(page.getByTestId('v2-scene-menu')).toHaveCount(0);
  await expect(page.getByRole('navigation',{name:'月光工坊世界'}).getByRole('link')).toHaveCount(5);
  await expect(page.getByRole('navigation',{name:'月光工坊世界'}).getByRole('link',{name:'工坊'})).toHaveAttribute('aria-current','page');
  await page.getByTestId('v2-shift').click();
  await expect(page.getByTestId('v2-day')).toHaveText('2');
  await page.getByTestId('v2-world-gate').click();
  await expect(page).toHaveURL(/\/town\/?$/,{timeout:15_000});
  await expect(page.getByTestId('world-day')).toHaveText('2');
  await page.getByRole('navigation',{name:'月光工坊世界'}).getByRole('link',{name:'工坊',exact:true}).click();
  await expect(page).toHaveURL(/\/workshop\/?$/);
  await expect(page.getByTestId('v2-day')).toHaveText('2');
  await expect(page.getByTestId('v2-stage').locator('canvas')).toHaveCount(1);
  await expect(page.getByTestId('v2-stage')).toHaveAttribute('data-machine-art','all-painted-machine-reviews');
  await page.getByTestId('v2-world-gate').click();
  await expect(page.getByTestId('world-day')).toHaveText('2');
  expect(errors).toEqual([]);
});

test('Next workshop remains playable on a 390px phone viewport',async({page})=>{
  test.setTimeout(90_000);
  await page.setViewportSize({width:390,height:844});
  await page.goto('/workshop/');
  await expect(page.getByTestId('v2-stage').locator('canvas')).toBeVisible({timeout:25_000});
  await expect(page.getByTestId('v2-world-nav')).toBeVisible();
  await expect(page.getByRole('navigation',{name:'月光工坊世界'}).getByRole('link')).toHaveCount(5);
  await expect(page.getByTestId('v2-build-well')).toBeVisible();
  await expect(page.getByTestId('v2-worker-fern')).toBeVisible();
  await expect(page.getByTestId('v2-shift')).toBeVisible();
  await page.getByTestId('v2-shift').click();
  await expect(page.getByTestId('v2-day')).toHaveText('2');
  await page.getByTestId('v2-world-gate').click();
  await expect(page.getByTestId('world-day')).toHaveText('2',{timeout:15_000});
});


test('workshop portal switches to actual contract and stock pages without losing progress',async({page})=>{
  test.setTimeout(90_000);
  await page.goto('/workshop/');
  await expect(page.getByTestId('v2-stage').locator('canvas')).toBeVisible({timeout:25_000});
  await page.getByTestId('v2-shift').click();
  await expect(page.getByTestId('v2-day')).toHaveText('2');
  await page.getByRole('navigation',{name:'月光工坊世界'}).getByRole('link',{name:'委托大厅'}).click();
  await expect(page).toHaveURL(/\/orders\/?$/);
  await expect(page.getByTestId('world-day')).toHaveText('2');
  await page.getByRole('navigation',{name:'月光工坊世界'}).getByRole('link',{name:'工坊'}).click();
  await expect(page.getByTestId('v2-day')).toHaveText('2');
  await page.getByRole('navigation',{name:'月光工坊世界'}).getByRole('link',{name:'魔法仓库'}).click();
  await expect(page).toHaveURL(/\/warehouse\/?$/);
  await expect(page.getByTestId('world-day')).toHaveText('2');
});


test('untouched first factory is immediately accessible across all scenes',async({page})=>{
  test.setTimeout(90_000);
  await page.goto('/workshop/');
  await expect(page.getByTestId('v2-stage').locator('canvas')).toBeVisible({timeout:25_000});
  await expect.poll(()=>page.evaluate(()=>Boolean(localStorage.getItem(
    'monster-apartment:workshop-v2-lab')))).toBe(true);
  await page.getByRole('navigation',{name:'月光工坊世界'})
    .getByRole('link',{name:'角色图鉴'}).click();
  await expect(page.getByTestId('painted-worker-gallery')).toBeVisible();
  await page.getByRole('navigation',{name:'月光工坊世界'})
    .getByRole('link',{name:'委托大厅'}).click();
  await expect(page.getByText('正式委托')).toBeVisible();
  await page.getByRole('navigation',{name:'月光工坊世界'})
    .getByRole('link',{name:'魔法仓库'}).click();
  await expect(page.getByText('当前真实库存')).toBeVisible();
});

test('Next workshop uses React-owned worker and machine controls with the original Pixi engine',async({page})=>{
  test.setTimeout(90000);
  await page.goto('/workshop/');
  const stage=page.getByTestId('v2-stage');
  const canvas=stage.locator('canvas');
  await expect(canvas).toBeVisible({timeout:25000});
  await expect(page.locator('#root')).toHaveAttribute('data-react-controls','true');
  const worker=page.getByTestId('v2-worker-brook');
  await expect(worker).toBeVisible();
  await worker.click();
  await expect(worker).toHaveAttribute('aria-pressed','true');
  await expect(page.getByTestId('v2-status')).toContainText('选择一台机器');
  const kiln=page.getByTestId('v2-build-kiln');
  await kiln.click();
  await expect(kiln).toHaveAttribute('aria-pressed','true');
  await expect(worker).toHaveAttribute('aria-pressed','false');
  const box=await canvas.boundingBox();
  expect(box).not.toBeNull();
  // Empty plot 07 (index 6) on the original 1050x645 Pixi stage.
  await canvas.click({position:{
    x:(131+160+73)/1050*box!.width,
    y:(104+160+73)/645*box!.height
  }});
  await expect(page.getByTestId('v2-coins')).toHaveText('62');
  await expect(kiln).toHaveAttribute('aria-pressed','false');
  await expect.poll(()=>page.evaluate(()=>{
    const raw=localStorage.getItem('monster-apartment:workshop-v2-lab');
    return raw?JSON.parse(raw).tiles[6]?.craft:null;
  })).toBe('kiln');
  await page.getByRole('navigation',{name:'月光工坊世界'})
    .getByRole('link',{name:'委托大厅'}).click();
  await expect(page.getByTestId('world-coins')).toHaveText('62');
});

test('invalid save is preserved until the player explicitly confirms recovery', async ({page}) => {
  test.setTimeout(90_000);
  await page.addInitScript(() => {
    localStorage.setItem('monster-apartment:workshop-v2-lab', '{broken');
  });
  await page.goto('/workshop/');
  const recovery = page.getByRole('alertdialog', {name: '工坊存档需要处理'});
  await expect(recovery).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem('monster-apartment:workshop-v2-lab'))).toBe('{broken');
  page.once('dialog', dialog => dialog.accept());
  await recovery.getByRole('button', {name: '确认重新开始'}).click();
  await expect(page.getByTestId('v2-stage').locator('canvas')).toBeVisible({timeout: 25_000});
  await expect(page.getByTestId('v2-day')).toHaveText('1');
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('monster-apartment:workshop-v2-lab') || '{}').version)).toBe(2);
});

test('canceling machine movement does not alter the real factory save', async ({page}) => {
  test.setTimeout(90_000);
  await page.goto('/workshop/');
  const canvas = page.getByTestId('v2-stage').locator('canvas');
  await expect(canvas).toBeVisible({timeout: 25_000});
  const box = await canvas.boundingBox();
  expect(box).not.toBeNull();
  // Plot 06 (index 5) starts with the water pump.
  await canvas.click({position: {
    x: (131 + 73) / 1050 * box!.width,
    y: (104 + 160 + 73) / 645 * box!.height,
  }});
  const move = page.getByTestId('v2-move');
  await expect(move).toBeEnabled();
  await move.click();
  await expect(move).toHaveAttribute('aria-pressed', 'true');
  await move.click();
  await expect(move).toHaveAttribute('aria-pressed', 'false');
  await expect(page.getByTestId('v2-status')).toContainText('已取消设备搬动');
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('monster-apartment:workshop-v2-lab') || '{}'));
  expect(saved.tiles[5].craft).toBe('well');
  expect(saved.tiles[6]).toBeNull();
  expect(saved.coins).toBe(100);
});


test('selected machine can be safely dismantled to recover money and rebuild',async({page})=>{
  test.setTimeout(90_000);
  await page.goto('/workshop/');
  const canvas=page.getByTestId('v2-stage').locator('canvas');
  await expect(canvas).toBeVisible({timeout:25_000});
  await expect(page.getByTestId('v2-next-step')).toContainText('温室');
  const refund=page.getByTestId('v2-salvage');
  await expect(refund).toBeHidden();
  const box=await canvas.boundingBox();
  expect(box).not.toBeNull();
  // Initial greenhouse is on plot 08 (index 7).
  await canvas.click({position:{
    x:(131+2*160+73)/1050*box!.width,
    y:(104+160+73)/645*box!.height
  }});
  await expect(refund).toBeVisible();
  await expect(refund).toContainText('15');
  page.once('dialog',dialog=>dialog.accept());
  await refund.click();
  await expect(page.getByTestId('v2-coins')).toHaveText('115');
  await expect(refund).toBeHidden();
  await expect.poll(()=>page.evaluate(()=>{
    const raw=localStorage.getItem('monster-apartment:workshop-v2-lab');
    const state=raw?JSON.parse(raw):null;
    return state?.tiles?.[7]===null&&state?.coins===115;
  })).toBe(true);
  await page.reload();
  await expect(page.getByTestId('v2-coins')).toHaveText('115');
  await expect(page.getByTestId('v2-stage').locator('canvas')).toBeVisible({timeout:25_000});
});


test('first-shift scene highlights actual garden move and updates the next target',async({page})=>{
  test.setTimeout(90_000);
  await page.goto('/workshop/');
  const canvas=page.getByTestId('v2-stage').locator('canvas');
  await expect(canvas).toBeVisible({timeout:25_000});
  const stage=page.getByTestId('v2-stage');
  await expect(stage).toHaveAttribute('data-guide-action','move');
  await expect(stage).toHaveAttribute('data-guide-source','7');
  await expect(stage).toHaveAttribute('data-guide-target','6');
  await expect(page.getByTestId('v2-guide-instruction')).toContainText('07 号地块');
  const box=await canvas.boundingBox();
  expect(box).not.toBeNull();
  // Initial garden 08 -> empty 07, using the actual Pixi stage coordinate grid.
  await canvas.click({position:{
    x:(131+2*160+73)/1050*box!.width,
    y:(104+160+73)/645*box!.height
  }});
  await page.getByTestId('v2-move').click();
  await canvas.click({position:{
    x:(131+160+73)/1050*box!.width,
    y:(104+160+73)/645*box!.height
  }});
  await expect(stage).toHaveAttribute('data-guide-action','build');
  await expect(page.getByTestId('v2-next-step')).toContainText('晶核熔炉');
  await expect.poll(()=>page.evaluate(()=>{
    const raw=localStorage.getItem('monster-apartment:workshop-v2-lab');
    return raw?JSON.parse(raw).tiles[6]?.craft:null;
  })).toBe('garden');
  await page.reload();
  await expect(page.getByTestId('v2-stage')).toHaveAttribute('data-guide-action','build');
});


test('plot selection only repaints focus without restarting the Pixi scene',async({page})=>{
  test.setTimeout(90_000);
  await page.goto('/workshop/');
  const stage=page.getByTestId('v2-stage');
  const canvas=stage.locator('canvas');
  await expect(canvas).toBeVisible({timeout:25_000});
  await expect(stage).toHaveAttribute('data-scene-refreshes',/^[1-9]\d*$/,{timeout:25_000});
  const baseline=await stage.getAttribute('data-scene-refreshes');
  const box=await canvas.boundingBox();
  expect(box).not.toBeNull();
  await canvas.click({position:{
    x:(131+73)/1050*box!.width,y:(104+160+73)/645*box!.height,
  }});
  await expect(page.getByTestId('v2-next-step')).toContainText('06 号地块');
  await expect(stage).toHaveAttribute('data-scene-refreshes',baseline!);
  await canvas.click({position:{
    x:(131+2*160+73)/1050*box!.width,y:(104+160+73)/645*box!.height,
  }});
  await expect(page.getByTestId('v2-next-step')).toContainText('08 号地块');
  await expect(stage).toHaveAttribute('data-scene-refreshes',baseline!);
  await page.getByTestId('v2-shift').click();
  await expect(page.getByTestId('v2-day')).toHaveText('2');
  await expect.poll(async()=>Number(await stage.getAttribute('data-scene-refreshes'))).toBeGreaterThan(Number(baseline));
});


test('accurate next-shift forecast becomes production and a visible first contract reward',async({page})=>{
  test.setTimeout(90_000);
  const initial={
    version:2,day:1,coins:62,
    tiles:Array.from({length:15},(_,i)=>
      i===5?{craft:'well',worker:'brook',stored:0}:
      i===6?{craft:'garden',worker:'fern',stored:0}:
      i===7?{craft:'kiln',worker:'cinder',stored:0}:null),
    warehouse:{core:0},order:{due:5,cores:2,reward:70},
    last:null,completed:0,failed:0,patron:null
  };
  await page.addInitScript(seed=>localStorage.setItem(
    'monster-apartment:workshop-v2-lab',JSON.stringify(seed)),initial);
  await page.goto('/workshop/');
  const stage=page.getByTestId('v2-stage');
  await expect(stage).toHaveAttribute('data-scene-refreshes',/^[1-9]\d*$/,{timeout:25_000});
  await expect(page.getByTestId('v2-shift-forecast')).toContainText('水汽 +2');
  await expect(page.getByTestId('v2-shift-forecast')).toContainText('孢子 +2');
  await expect(page.getByTestId('v2-shift-forecast')).toContainText('晶核 +2');
  expect((await page.evaluate(()=>JSON.parse(localStorage.getItem(
    'monster-apartment:workshop-v2-lab')!).day))).toBe(1);
  await page.getByTestId('v2-shift').click();
  await expect(stage).toHaveAttribute('data-last-shift-flow','water:2;fiber:2;cores:2');
  await expect(page.getByTestId('v2-output')).toHaveText('2');
  await expect(page.getByTestId('v2-stock')).toHaveText('2');
  for(let day=3;day<=5;day++){
    await page.getByTestId('v2-shift').click();
    await expect(page.getByTestId('v2-day')).toHaveText(String(day));
  }
  await expect(page.getByTestId('v2-shift-forecast')).toContainText('本班结算订单');
  await page.getByTestId('v2-shift').click();
  await expect(page.getByTestId('v2-day')).toHaveText('6');
  await expect(stage).toHaveAttribute('data-last-shift-delivery','first');
  await expect(page.getByTestId('v2-coins')).toHaveText('132');
  await expect(page.getByTestId('v2-diagnosis')).toContainText('订单完成');
  await expect(page.getByTestId('v2-patron-card')).toBeVisible();
  await page.reload();
  await expect(page.getByTestId('v2-coins')).toHaveText('132');
  await expect(page.getByTestId('v2-day')).toHaveText('6');
  await expect(page.getByTestId('v2-stage')).not.toHaveAttribute('data-last-shift-delivery','first');
});
