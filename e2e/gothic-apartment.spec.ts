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
  await expect(page.getByTestId('ga-room-2')).toContainText('澜歌');
  await page.getByTestId('ga-decor-books').click();
  await expect(page.getByTestId('ga-coins')).toHaveText('59');
  await page.reload();
  await expect(page.getByTestId('ga-room-2')).toContainText('澜歌');
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
  await expect(page.getByTestId('ga-build-nest')).toContainText('私人卧室');
  await page.getByTestId('ga-build-nest').click();
  await expect(page.getByTestId('ga-coins')).toHaveText('75');
  await expect(page.locator('.ga-feedback')).toContainText('新房间建好了');
});

test('apartment clock pauses for room choices and resumes after closing the drawer',async({page})=>{
  await page.goto('/apartment/');
  await expect(page.getByTestId('gothic-apartment')).toBeVisible();
  await page.getByTestId('ga-room-2').click();
  await expect(page.getByTestId('ga-room-drawer')).toBeVisible();
  const tick=()=>page.evaluate(()=>{
    const data=localStorage.getItem('monster-apartment:cozy:v1');
    return data?JSON.parse(data).tick:-1;
  });
  await expect.poll(tick).toBeGreaterThanOrEqual(0);
  const before=await tick();
  await page.waitForTimeout(2250);
  expect(await tick()).toBe(before);
  await page.getByRole('button',{name:'关闭房间操作'}).click();
  await expect.poll(tick,{timeout:6000}).toBeGreaterThan(before);
});

test('apartment never silently destroys an unreadable existing player save',async({page})=>{
  await page.addInitScript(()=>{
    localStorage.setItem('monster-apartment:cozy:v1','{broken-cozy');
  });
  await page.goto('/apartment/');
  const recovery=page.getByRole('alertdialog',{name:'公寓存档需要处理'});
  await expect(recovery).toBeVisible();
  expect(await page.evaluate(()=>localStorage.getItem('monster-apartment:cozy:v1'))).toBe('{broken-cozy');
  page.once('dialog',dialog=>dialog.dismiss());
  await recovery.getByRole('button',{name:'确认重新开始'}).click();
  await expect(recovery).toBeVisible();
  expect(await page.evaluate(()=>localStorage.getItem('monster-apartment:cozy:v1'))).toBe('{broken-cozy');
  page.once('dialog',dialog=>dialog.accept());
  await recovery.getByRole('button',{name:'确认重新开始'}).click();
  await expect(page.getByTestId('gothic-apartment')).toBeVisible();
  expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('monster-apartment:cozy:v1')||'{}'))).toHaveProperty('version');
});


test('stale apartment recovery cannot erase progress repaired after the warning opened',async({page})=>{
  await page.goto('/apartment/');
  await expect(page.getByTestId('gothic-apartment')).toBeVisible();
  await page.getByRole('button',{name:'暂停公寓时间'}).click();
  await page.getByTestId('ga-room-2').click();
  await page.getByTestId('ga-build-bath').click();
  await expect(page.getByTestId('ga-coins')).toHaveText('71');
  const repaired=await page.evaluate(()=>
    localStorage.getItem('monster-apartment:cozy:v1')!
  );
  await page.evaluate(()=>localStorage.setItem('monster-apartment:cozy:v1','{broken-in-old-tab'));
  await page.reload();
  const recovery=page.getByRole('alertdialog',{name:'公寓存档需要处理'});
  await expect(recovery).toBeVisible();

  // A separate tab can repair or replace the original save while the old
  // confirmation remains open. Writing in this page simulates the shared
  // storage update without firing a same-tab StorageEvent.
  await page.evaluate(saved=>
    localStorage.setItem('monster-apartment:cozy:v1',saved),repaired);
  page.once('dialog',dialog=>dialog.accept());
  await recovery.getByRole('button',{name:'确认重新开始'}).click();
  await expect(recovery.getByRole('alert')).toContainText('其它标签页已更新');
  expect(await page.evaluate(()=>
    localStorage.getItem('monster-apartment:cozy:v1'))).toBe(repaired);

  await page.reload();
  await expect(page.getByTestId('ga-coins')).toHaveText('71');
  await expect(page.getByTestId('ga-room-2')).toContainText('水汽浴室');
});


test('an older apartment recovery dialog cannot reset a newer damaged payload from another tab',async({page,context})=>{
  await page.goto('/apartment/');
  await expect(page.getByTestId('gothic-apartment')).toBeVisible();
  await page.evaluate(()=>localStorage.setItem('monster-apartment:cozy:v1','{older-damaged'));
  await page.reload();
  const recovery=page.getByRole('alertdialog',{name:'公寓存档需要处理'});
  await expect(recovery).toBeVisible();
  const second=await context.newPage();
  try{
    await second.goto('/');
    await page.evaluate(()=>{
      window.addEventListener('storage',event=>{
        if(event.key==='monster-apartment:cozy:v1'&&event.newValue==='{newer-damaged')
          sessionStorage.setItem('observed-newer-corrupt-save','yes');
      });
    });
    await second.evaluate(()=>
      localStorage.setItem('monster-apartment:cozy:v1','{newer-damaged')
    );
    await expect.poll(()=>page.evaluate(()=>
      sessionStorage.getItem('observed-newer-corrupt-save'))).toBe('yes');
    await page.evaluate(()=>new Promise<void>(resolve=>
      requestAnimationFrame(()=>requestAnimationFrame(()=>resolve()))));
    page.once('dialog',dialog=>dialog.accept());
    await recovery.getByRole('button',{name:'确认重新开始'}).click();
    await expect(recovery.getByRole('alert')).toContainText('其它标签页已更新');
    expect(await page.evaluate(()=>
      localStorage.getItem('monster-apartment:cozy:v1'))).toBe('{newer-damaged');
  }finally{
    await second.close();
  }
});


test('simultaneous housing builds in two tabs both survive without a lost update',async({page,context})=>{
  test.setTimeout(90000);
  await page.goto('/apartment/');
  await expect(page.getByTestId('gothic-apartment')).toBeVisible();
  await page.getByRole('button',{name:'暂停公寓时间'}).click();
  const second=await context.newPage();
  await second.goto('/apartment/');
  try{
    await expect(second.getByTestId('gothic-apartment')).toBeVisible();
    await second.getByRole('button',{name:'暂停公寓时间'}).click();
    await page.getByTestId('ga-room-0').click();
    await second.getByTestId('ga-room-2').click();
    await Promise.all([
      page.getByTestId('ga-build-nest').click(),
      second.getByTestId('ga-build-bath').click(),
    ]);
    await expect(page.getByTestId('ga-coins')).toHaveText('41');
    await expect(second.getByTestId('ga-coins')).toHaveText('41');
    await page.reload();
    await expect(page.getByTestId('ga-room-0')).toContainText('私人卧室');
    await expect(page.getByTestId('ga-room-2')).toContainText('水汽浴室');
    await expect(page.getByTestId('ga-coins')).toHaveText('41');
    expect(await page.evaluate(()=>JSON.parse(
      localStorage.getItem('monster-apartment:cozy:v1')||'{}').rooms[0]?.type)).toBe('nest');
  }finally{await second.close();}
});

test('apartment refuses normal writes without cross-tab locks',async({page})=>{
  await page.addInitScript(()=>{
    Object.defineProperty(navigator,'locks',{configurable:true,value:undefined});
  });
  await page.goto('/apartment/');
  await expect(page.getByTestId('gothic-apartment')).toBeVisible();
  await page.getByTestId('ga-room-2').click();
  await page.getByTestId('ga-build-bath').click();
  await expect(page.getByTestId('cozy-save-error')).toContainText('本次操作未保存');
  expect(await page.evaluate(()=>
    localStorage.getItem('monster-apartment:cozy:v1'))).toBeNull();
  await expect(page.getByTestId('ga-coins')).toHaveText('105');
});

test('another open tab receives housing progress without overwriting a newer save',async({page,context})=>{
  test.setTimeout(90000);
  await page.goto('/apartment/');
  const second=await context.newPage();
  await second.goto('/apartment/');
  try{
    await page.getByRole('button',{name:'暂停公寓时间'}).click();
    await second.getByRole('button',{name:'暂停公寓时间'}).click();
    await page.getByTestId('ga-room-2').click();
    await page.getByTestId('ga-build-bath').click();
    await expect(page.getByTestId('ga-coins')).toHaveText('71');
    await expect(second.getByTestId('ga-coins')).toHaveText('71',{timeout:10000});
    const shared=await second.evaluate(()=>
      JSON.parse(localStorage.getItem('monster-apartment:cozy:v1')||'null')
    );
    expect(shared.rooms[2]?.type).toBe('bath');
    await second.getByTestId('ga-room-2').click();
    await second.getByTestId('ga-welcome-dewdrop').click();
    await expect(second.getByTestId('ga-room-2')).toContainText('澜歌');
    await expect(page.getByTestId('ga-room-2')).toContainText('澜歌',{timeout:10000});
    await page.reload();
    await expect(page.getByTestId('ga-room-2')).toContainText('澜歌');
  }finally{
    await second.close();
  }
});

test('external corrupted apartment saves are not silently repaired by another tab',async({page,context})=>{
  await page.goto('/apartment/');
  const second=await context.newPage();
  await second.goto('/apartment/');
  try{
    await second.evaluate(()=>localStorage.setItem('monster-apartment:cozy:v1','{invalid-cross-tab'));
    await expect(page.getByRole('alertdialog',{name:'公寓存档需要处理'})).toBeVisible();
    expect(await page.evaluate(()=>localStorage.getItem('monster-apartment:cozy:v1')))
      .toBe('{invalid-cross-tab');
  }finally{await second.close();}
});
