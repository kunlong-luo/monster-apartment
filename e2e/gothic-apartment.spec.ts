import {test,expect} from '@playwright/test';

test('the new gothic apartment uses the existing real housing economy',async({page})=>{
  await page.setViewportSize({width:1440,height:900});
  await page.goto('/apartment/');
  await expect(page.getByTestId('gothic-apartment')).toBeVisible();
  await expect(page.getByTestId('ga-coins')).toHaveText('105');
  await expect(page.getByRole('button',{name:/3号房/})).toBeVisible();
  await page.getByTestId('ga-room-2').click();
  await expect(page.getByTestId('ga-build-bath')).toBeVisible();
  await page.getByTestId('ga-build-bath').click();
  await expect(page.getByTestId('ga-coins')).toHaveText('71');
  await page.getByTestId('ga-welcome-dewdrop').click();
  await expect(page.getByTestId('ga-room-2')).toContainText('露珠灵');
  await page.getByTestId('ga-decor-books').click();
  await expect(page.getByTestId('ga-coins')).toHaveText('59');
  await page.reload();
  await expect(page.getByTestId('ga-room-2')).toContainText('露珠灵');
  await expect(page.getByTestId('ga-coins')).toHaveText('59');
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

test('2D polish: architectural room controls, Moonveil dialogue, accessible gameplay feedback',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto('/apartment/');
  await expect(page.getByTestId('gothic-apartment')).toBeVisible();
  await page.getByRole('button',{name:'与女主人月纱交流'}).click();
  await expect(page.getByRole('dialog',{name:'与月纱交谈'})).toBeVisible();
  await expect(page.getByRole('dialog',{name:'与月纱交谈'})).toContainText('幸福度');
  await page.getByRole('button',{name:'关闭月纱对话'}).click();
  await expect(page.getByRole('dialog',{name:'与月纱交谈'})).toHaveCount(0);
  await page.getByTestId('ga-room-0').click();
  await expect(page.getByTestId('ga-build-nest')).toBeVisible();
  await expect(page.getByTestId('ga-build-nest')).toContainText('软绵卧室');
  await page.getByTestId('ga-build-nest').click();
  await expect(page.getByTestId('ga-coins')).toHaveText('75');
  await expect(page.locator('.ga-feedback')).toContainText('新房间建好了');
});
