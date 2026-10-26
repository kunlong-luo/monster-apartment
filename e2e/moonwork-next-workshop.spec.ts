import {test,expect} from '@playwright/test';

test('Next-owned PixiJS workshop survives SPA navigation and keeps one save',async({page})=>{
  test.setTimeout(90_000);
  const errors:string[]=[];
  page.on('pageerror',error=>errors.push(error.message));
  await page.goto('/workshop/');
  const stage=page.getByTestId('v2-stage');
  await expect(stage.locator('canvas')).toBeVisible({timeout:25_000});
  await expect(stage).toHaveAttribute('data-renderer','pixi-webgl-bitmap');
  await expect(page.getByTestId('v2-day')).toHaveText('1');
  await expect(page.getByTestId('v2-world-nav')).toBeVisible();
  await expect(page.getByTestId('workshop-react-hud')).toBeVisible();
  await expect(page.locator('#root .game-world-nav')).toHaveCount(0);
  await expect(page.getByTestId('v2-coins')).toHaveText('100');
  await expect(page.getByTestId('v2-scene-menu')).toHaveCount(0);
  await expect(page.getByRole('navigation',{name:'月光工坊世界'}).getByRole('link')).toHaveCount(5);
  await expect(page.getByRole('navigation',{name:'月光工坊世界'}).getByRole('link',{name:'工坊'})).toHaveAttribute('aria-current','page');
  await page.getByTestId('v2-shift').click();
  await expect(page.getByTestId('v2-day')).toHaveText('2');
  await page.getByTestId('v2-world-gate').click();
  await expect(page).toHaveURL(/\/town\/?$/);
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
  await expect(page.getByTestId('world-day')).toHaveText('2');
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
