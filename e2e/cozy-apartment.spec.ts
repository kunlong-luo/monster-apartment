import { test, expect } from '@playwright/test';

test('first-time player builds a bath, welcomes Dewdrop, and furnishes it',async({page})=>{
  const errors:string[]=[];
  page.on('pageerror',error=>errors.push(error.message));
  await page.setViewportSize({width:1440,height:900});
  await page.goto('/');
  await expect(page.getByRole('heading',{name:'灵核公寓'})).toBeVisible();
  for(let n=0;n<6;n++)await expect(page.getByTestId('cozy-room-'+n)).toBeVisible();
  await expect(page.getByTestId('cozy-actor-seedling')).toBeVisible();
  await expect(page.getByTestId('open-night-raid')).toHaveCount(0);
  await expect(page.getByTestId('living-stat-heat')).toHaveCount(0);
  await expect(page.getByTestId('cozy-coins')).toHaveText('105');
  await page.getByTestId('cozy-room-2').click();
  await expect(page.getByTestId('cozy-build-bath')).toBeVisible();
  await page.getByTestId('cozy-build-bath').click();
  await expect(page.getByTestId('cozy-coins')).toHaveText('71');
  await expect(page.getByTestId('cozy-room-2')).toContainText('水汽浴室');
  await page.getByTestId('cozy-welcome-dewdrop').click();
  await expect(page.getByTestId('cozy-room-2')).toContainText('露珠灵');
  await expect(page.getByTestId('cozy-occupancy')).toContainText('2');
  await page.getByTestId('cozy-decor-books').click();
  await expect(page.getByTestId('cozy-coins')).toHaveText('59');
  await expect(page.getByTestId('cozy-room-2')).toContainText('露珠灵');
  await expect(page.getByTestId('cozy-story')).toContainText('故事书');
  await page.getByTestId('cozy-pause').click();
  await expect(page.getByTestId('cozy-pause')).toHaveAttribute('aria-pressed','true');
  await page.reload();
  await expect(page.getByTestId('cozy-room-2')).toContainText('露珠灵');
  await expect(page.getByTestId('cozy-coins')).toHaveText('59');
  expect(errors).toEqual([]);
});

test('phone shows the whole three-story building without document scroll',async({page})=>{
  await page.setViewportSize({width:390,height:844});
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto('/');
  await expect(page.getByRole('heading',{name:'灵核公寓'})).toBeVisible();
  await expect(page.getByTestId('cozy-room-4')).toBeVisible();
  await page.getByTestId('cozy-room-5').click();
  await expect(page.getByTestId('cozy-build-greenhouse')).toBeVisible();
  await page.getByTestId('cozy-build-greenhouse').click();
  await expect(page.getByTestId('cozy-room-5')).toContainText('屋顶花房');
  const dims=await page.evaluate(()=>({
    vertical:document.documentElement.scrollHeight-innerHeight,
    horizontal:document.documentElement.scrollWidth-innerWidth,
  }));
  expect(dims.vertical).toBeLessThanOrEqual(1);
  expect(dims.horizontal).toBeLessThanOrEqual(1);
  await page.getByRole('button',{name:'Change language'}).click();
  await expect(page.getByRole('heading',{name:'Spirit Residence'})).toBeVisible();
});

test('daily rent and a new resident offer are visible in the same building',async({page})=>{
  await page.goto('/');
  await expect.poll(()=>page.evaluate(()=>!!localStorage.getItem('monster-apartment:cozy:v1'))).toBe(true);
  await page.evaluate(()=>{
    const key='monster-apartment:cozy:v1';
    const state=JSON.parse(localStorage.getItem(key)!);
    state.tick=11;
    localStorage.setItem(key,JSON.stringify(state));
  });
  await page.reload();
  await expect(page.getByTestId('cozy-applicant-fern-hare')).toBeVisible({timeout:6500});
  await expect(page.getByTestId('cozy-story')).toContainText('蕨尾兔');
  const cash=Number(await page.getByTestId('cozy-coins').textContent());
  expect(cash).toBeGreaterThan(105);
  await page.getByTestId('cozy-room-5').click();
  await page.getByTestId('cozy-build-greenhouse').click();
  await page.getByTestId('cozy-welcome-fern-hare').click();
  await expect(page.getByTestId('cozy-occupancy')).toContainText('2');
  await expect(page.getByTestId('cozy-actor-fern-hare')).toBeVisible();
});
