import { test, expect } from '@playwright/test';

test('one living apartment replaces separated recruitment and battle dashboards', async ({page})=>{
  const errors:string[]=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.setViewportSize({width:1440,height:900});
  await page.goto('/');
  await expect(page.getByRole('heading',{name:/灵核公寓/})).toBeVisible();
  await expect(page.getByTestId('living-world')).toBeVisible();
  await expect(page.getByTestId('living-phaser').locator('canvas')).toBeVisible();
  for(const room of ['reactor','garden','gate']){
    await expect(page.getByTestId('living-room-'+room)).toBeVisible();
  }
  await expect(page.getByRole('button',{name:'结束今天'})).toHaveCount(0);
  await expect(page.getByTestId('open-night-raid')).toHaveCount(0);
  await page.getByTestId('living-start').click();
  await expect(page.getByTestId('living-time')).toContainText('/10');
  await page.getByTestId('living-worker-dewdrop').click();
  await page.getByTestId('living-room-reactor').click();
  await expect(page.getByTestId('living-room-reactor')).toContainText('露珠灵');
  await expect(page.getByTestId('living-room-gate')).toContainText('灯甲虫');
  await page.getByTestId('living-pause').click();
  await expect(page.getByTestId('living-pause')).toHaveAttribute('aria-pressed','true');
  const time=await page.getByTestId('living-time').textContent();
  await page.waitForTimeout(1200);
  expect(await page.getByTestId('living-time').textContent()).toBe(time);
  await page.reload();
  await expect(page.getByTestId('living-room-reactor')).toContainText('露珠灵');
  expect(errors).toEqual([]);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)).toBeLessThanOrEqual(1);
});

test('mobile sanctuary offers direct room assignments without page scrolling',async({page})=>{
  await page.setViewportSize({width:390,height:844});
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto('/');
  await expect(page.getByTestId('living-room-garden')).toBeVisible();
  await page.getByTestId('living-start').click();
  await page.getByTestId('living-worker-dewdrop').click();
  await page.getByTestId('living-room-garden').click();
  await expect(page.getByTestId('living-room-garden')).toContainText('露珠灵');
  await expect(page.getByTestId('living-room-gate')).toContainText('芽核');
  await page.getByRole('button',{name:'Change language'}).click();
  await expect(page.getByRole('heading',{name:/Spirit Sanctuary/})).toBeVisible();
  const dimensions=await page.evaluate(()=>({
    vertical:document.documentElement.scrollHeight-innerHeight,
    horizontal:document.documentElement.scrollWidth-innerWidth,
  }));
  expect(dimensions.vertical).toBeLessThanOrEqual(1);
  expect(dimensions.horizontal).toBeLessThanOrEqual(1);
});

test('crisis changes the scene inside the same apartment and progress is restorable',async({page})=>{
  await page.goto('/');
  await page.getByTestId('living-start').click();
  await expect.poll(()=>page.evaluate(()=>Boolean(localStorage.getItem('monster-apartment:living:v1')))).toBe(true);
  await page.evaluate(()=>{
    const key='monster-apartment:living:v1';
    const save=JSON.parse(localStorage.getItem(key)!);
    save.state.tick=37;
    save.state.power=8;
    save.state.food=5;
    localStorage.setItem(key,JSON.stringify(save));
  });
  await page.reload();
  await expect(page.getByTestId('living-crisis')).toContainText('孢子侵袭',{timeout:5000});
  await expect(page.getByTestId('living-stat-food')).toBeVisible();
  await page.getByTestId('living-worker-dewdrop').click();
  await page.getByTestId('living-room-garden').click();
  await expect(page.getByTestId('living-room-garden')).toContainText('露珠灵');
});

test('assignments show future consequences in the room before committing, not another menu',async({page})=>{
  const errors:string[]=[];
  page.on('pageerror',error=>errors.push(error.message));
  await page.setViewportSize({width:1360,height:830});
  await page.goto('/');
  await page.getByTestId('living-start').click();
  await page.getByTestId('living-worker-dewdrop').click();
  const preview=page.getByTestId('living-impact-reactor');
  await expect(preview).toBeVisible();
  await expect(preview).toContainText('预计未来8刻');
  await expect(preview).toContainText('炉温');
  await expect(page.getByTestId('living-impact-garden')).toBeVisible();
  await expect(page.getByTestId('living-impact-gate')).toHaveCount(0);
  await page.getByTestId('living-room-reactor').click();
  await expect(page.getByTestId('living-room-reactor')).toContainText('露珠灵');
  await expect(preview).toHaveCount(0);
  await expect(page.getByTestId('living-event')).toContainText('露珠灵');
  await expect(page.getByTestId('living-phaser').locator('canvas')).toBeVisible();
  expect(errors).toEqual([]);
});
