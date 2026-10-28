import {test,expect} from '@playwright/test';

test('Moonsha private room preserves a meaningful first choice without changing apartment money',async({page})=>{
  await page.goto('/apartment/');
  await page.getByRole('button',{name:'与女主人月纱交流'}).click();
  await expect(page.getByRole('dialog',{name:'与月纱交谈'})).toContainText('幸福度');
  await page.getByTestId('visit-yuesha-room').click();
  await expect(page.getByTestId('yuesha-private-room')).toBeVisible();
  await expect(page.getByTestId('life-profile-yuesha')).toContainText('谨慎而机敏');
  const before=await page.evaluate(()=>JSON.parse(localStorage.getItem('monster-apartment:cozy:v1')||'{}').coins);
  await page.getByTestId('yuesha-choice-transparent').click();
  await expect(page.getByTestId('yuesha-dialogue')).toContainText('账本摊开');
  expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('monster-apartment:cozy:v1')||'{}').coins)).toBe(before);
  await page.getByRole('button',{name:'月纹蜡封'}).click();
  await expect(page.getByTestId('scene-discovery')).toContainText('月纹');
  await expect(page.getByTestId('yuesha-hotspot-text')).toContainText('月纹');
  await page.reload();
  await page.getByRole('button',{name:'与女主人月纱交流'}).click();
  await page.getByTestId('visit-yuesha-room').click();
  await expect(page.getByTestId('yuesha-dialogue')).toContainText('账本摊开');
  await expect(page.getByTestId('yuesha-choice-careful')).toHaveCount(0);
  const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('monster-apartment:character-life:v1')||'{}'));
  expect(saved.visited).toEqual(['yuesha']);
  expect(saved.decisions['yuesha-first-visit']).toBe('transparent');
});

test('character gallery can open the same room; corrupt lore save is not silently overwritten',async({page})=>{
  await page.goto('/characters/');
  await expect(page.getByTestId('life-profile-brook')).toBeVisible();
  await page.getByTestId('life-expand-brook').click();
  await expect(page.getByTestId('life-profile-brook')).toContainText('耐力');
  await page.getByRole('link',{name:/拜访月纱会客室/}).click();
  await expect(page.getByTestId('yuesha-private-room')).toBeVisible();
  await page.goto('/apartment/');
  await page.evaluate(()=>localStorage.setItem('monster-apartment:character-life:v1','{damaged'));
  await page.reload();
  await page.getByRole('button',{name:'与女主人月纱交流'}).click();
  await page.getByTestId('visit-yuesha-room').click();
  await expect(page.getByTestId('character-life-error')).toContainText('存档损坏');
  expect(await page.evaluate(()=>localStorage.getItem('monster-apartment:character-life:v1'))).toBe('{damaged');
});

test('Brook, Fern and Cinder have unique rooms and persisted personal choices',async({page})=>{
  await page.goto('/characters/');
  for(const person of [
    {id:'brook',name:'泉泡',objects:['空掉的工具挂钩','水汽压力表'],secret:'扳手'},
    {id:'fern',name:'青枝',objects:['花期手札','窗边月光花'],secret:'水脉图'},
    {id:'cinder',name:'炽角',objects:['旧锻锤','稳定器草图'],secret:'旧熔炉'},
  ] as const){
    await page.getByTestId('visit-worker-room-'+person.id).click();
    const dialog=page.getByRole('dialog',{name:'拜访'+person.name+'的房间'});
    await expect(dialog).toBeVisible();
    await expect(page.getByTestId('worker-private-room-'+person.id)).toContainText(person.name);
    await dialog.getByRole('button',{name:person.objects[0]}).click();
    await dialog.getByRole('button',{name:person.objects[1]}).click();
    await expect(page.getByTestId('worker-room-secret-'+person.id)).toContainText(person.secret);
    await page.getByTestId('worker-room-choice-'+person.id+'-care').click();
    await expect(page.getByTestId('worker-room-choice-'+person.id+'-practice')).toHaveCount(0);
    await dialog.getByRole('button',{name:'离开'+person.name+'的房间'}).click();
    await expect(dialog).toHaveCount(0);
  }
  await page.reload();
  await page.getByTestId('visit-worker-room-brook').click();
  await expect(page.getByTestId('worker-room-dialogue-brook')).toContainText('先坐一会儿');
  await expect(page.getByTestId('worker-room-secret-brook')).toContainText('扳手');
  const stored=await page.evaluate(()=>JSON.parse(localStorage.getItem('monster-apartment:character-life:v1')||'{}'));
  expect(stored.visited).toEqual(['brook','fern','cinder']);
  expect(stored.workerDecisions).toEqual({brook:'care',fern:'care',cinder:'care'});
  expect(stored.observations.brook).toEqual(['toolbox','gauge']);
});

test('assigned worker is not duplicated in their private room',async({page})=>{
  await page.goto('/characters/');
  await page.evaluate(()=>{
    const key='monster-apartment:workshop-v2-lab';
    const world=JSON.parse(localStorage.getItem(key)!);
    world.tiles[5].worker='brook';
    localStorage.setItem(key,JSON.stringify(world));
  });
  await page.reload();
  await page.getByTestId('visit-worker-room-brook').click();
  await expect(page.getByTestId('room-resident-away-brook')).toBeVisible();
  await expect(page.getByTestId('room-resident-present-brook')).toHaveCount(0);
  await expect(page.getByTestId('worker-room-choice-brook-care')).toHaveCount(0);
  await page.getByRole('button',{name:'空掉的工具挂钩'}).click();
  await expect(page.getByTestId('scene-discovery')).toContainText('扳手');
});
