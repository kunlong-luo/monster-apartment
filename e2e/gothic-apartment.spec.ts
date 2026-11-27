import {test,expect} from '@playwright/test';
import {newWorkshop} from '../engine/src/workshop-engine';

const worldKey='monster-apartment:workshop-v2-lab';
const retiredKey='monster-apartment:cozy:v1';

test('apartment and town share one real balance, day and inventory across tabs and reloads',async({page,context})=>{
  const initial={...newWorkshop(),coins:200,warehouse:{core:8}};
  const retired='{"version":1,"coins":999,"retired":true}';
  await page.goto('/apartment/');
  await page.evaluate(({worldKey,retiredKey,initial,retired})=>{
    localStorage.setItem(worldKey,JSON.stringify(initial));
    localStorage.setItem(retiredKey,retired);
  },{worldKey,retiredKey,initial,retired});
  await page.reload();
  await expect(page.getByTestId('ga-coins')).toHaveText('200');
  await expect(page.getByTestId('ga-cores')).toHaveText('8');
  await expect(page.getByTestId('ga-day')).toHaveText(String(initial.day));
  const town=await context.newPage();
  try{
    await town.goto('/town/');
    await expect(town.getByTestId('world-coins')).toHaveText('200');
    await town.getByTestId('town-offer-fiber').getByRole('button',{name:'购买本日货箱'}).click();
    await expect(town.getByTestId('world-coins')).toHaveText('176');
    await expect(page.getByTestId('ga-coins')).toHaveText('176');
    await page.reload();
    await expect(page.getByTestId('ga-coins')).toHaveText('176');
    expect(await page.evaluate(key=>localStorage.getItem(key),retiredKey)).toBe(retired);
  }finally{await town.close();}
});

test('a fresh player has four actual character rooms and never creates the retired housing save',async({page})=>{
  await page.setViewportSize({width:1440,height:900});
  await page.goto('/apartment/');
  await expect(page.getByTestId('ga-coins')).toHaveText(String(newWorkshop().coins));
  await expect(page.locator('.ga-door')).toHaveCount(4);
  for(const [index,id,name] of [[0,'yuesha','月纱'],[1,'brook','泉泡'],[2,'fern','青枝'],[3,'cinder','炽角']] as const){
    const door=page.getByTestId('ga-room-'+index);
    await expect(door).toContainText(name);
    await expect(door).toHaveAttribute('href',new RegExp('visit='+id));
  }
  await page.getByTestId('ga-room-0').click();
  await expect(page.getByTestId('yuesha-private-room')).toBeVisible();
  await expect(page.getByTestId('yuesha-living-state')).toContainText('已交付');
  expect(await page.evaluate(key=>localStorage.getItem(key),retiredKey)).toBeNull();
});

test('corrupt legacy housing payload remains exportable without blocking or modifying the shared game',async({page})=>{
  await page.addInitScript(({retiredKey})=>localStorage.setItem(retiredKey,'{broken-legacy'),{retiredKey});
  await page.goto('/apartment/');
  await expect(page.getByTestId('ga-coins')).toHaveText(String(newWorkshop().coins));
  await page.getByRole('button',{name:'公寓日志'}).click();
  const pending=page.waitForEvent('download');
  await page.getByRole('button',{name:'导出旧公寓经营记录'}).click();
  const download=await pending;
  expect(download.suggestedFilename()).toBe('monster-apartment-retired-housing-v1.json');
  expect(await page.evaluate(key=>localStorage.getItem(key),retiredKey)).toBe('{broken-legacy');
});

test('corrupt unified economic record is not replaced or presented as a new balance',async({page})=>{
  await page.addInitScript(({worldKey})=>localStorage.setItem(worldKey,'{broken-workshop'),{worldKey});
  await page.goto('/apartment/');
  await expect(page.getByTestId('ga-coins')).toHaveText('—');
  await expect(page.locator('.ga-story')).toContainText('经营记录暂不可用');
  expect(await page.evaluate(key=>localStorage.getItem(key),worldKey)).toBe('{broken-workshop');
});

test('redesigned pages never restore the old scrolling web dashboard',async({page})=>{
  await page.setViewportSize({width:390,height:844});
  for(const route of ['/apartment/','/town/','/orders/','/characters/','/warehouse/']){
    await page.goto(route);
    await expect(page.locator('main').first()).toBeVisible();
    const scroll=await page.evaluate(()=>({
      x:document.documentElement.scrollWidth-innerWidth,
      y:document.documentElement.scrollHeight-innerHeight,
    }));
    expect(scroll.x,route+' horizontal scroll').toBeLessThanOrEqual(1);
    expect(scroll.y,route+' vertical scroll').toBeLessThanOrEqual(1);
  }
});

test('PC Web YueSha room deep links stay in sync with browser history and art-review query',async({page})=>{
  test.setTimeout(90_000);
  await page.setViewportSize({width:1440,height:900});
  await page.goto('/apartment/?visit=yuesha');
  await expect(page.getByTestId('gothic-apartment')).toBeVisible();
  await expect(page.getByTestId('yuesha-private-room')).toBeVisible();
  const dialogue=page.getByRole('dialog',{name:'与月纱交谈'});
  await expect(dialogue).toBeVisible();

  // SSR can expose the room before App Router installs its History API bridge.
  // Wait for real client effects (modal focus and shared world hydration), not
  // an arbitrary delay, before simulating an external history entry.
  await expect(dialogue).toBeFocused();
  await expect(page.getByTestId('ga-coins')).toHaveText(String(newWorkshop().coins));
  await page.evaluate(()=>window.history.pushState(null,'','/apartment/'));
  await expect(page).toHaveURL(/\/apartment\/?$/);
  await expect(page.getByTestId('yuesha-private-room')).toHaveCount(0);
  await expect(dialogue).toHaveCount(0);

  await page.getByRole('button',{name:'与女主人月纱交流'}).click();
  await expect(dialogue).toBeVisible();
  await page.getByTestId('visit-yuesha-room').click();
  await expect(page).toHaveURL(/\/apartment\/?\?visit=yuesha$/);
  await expect(page.getByTestId('yuesha-private-room')).toBeVisible();
  await page.goBack();
  await expect(page).toHaveURL(/\/apartment\/?$/);
  await expect(page.getByTestId('yuesha-private-room')).toHaveCount(0);
  await expect(dialogue).toBeVisible(); // conversation the player opened stays open
  await page.getByRole('button',{name:'关闭月纱对话'}).click();
  await expect(dialogue).toHaveCount(0);

  await page.goto('/apartment/?roomArtReview=1');
  await page.getByRole('button',{name:'与女主人月纱交流'}).click();
  await page.getByTestId('visit-yuesha-room').click();
  await expect.poll(()=>new URL(page.url()).searchParams.get('visit')).toBe('yuesha');
  await expect.poll(()=>new URL(page.url()).searchParams.get('roomArtReview')).toBe('1');
  await expect(page.getByTestId('yuesha-private-room')).toBeVisible();
  await page.getByRole('button',{name:'关闭月纱对话'}).click();
  await expect(page).toHaveURL(/\/apartment\/?\?roomArtReview=1$/);
  await expect(dialogue).toHaveCount(0);
});
