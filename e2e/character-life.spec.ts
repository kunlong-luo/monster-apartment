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
  await expect(page.getByRole('alert')).toContainText('存档损坏');
  expect(await page.evaluate(()=>localStorage.getItem('monster-apartment:character-life:v1'))).toBe('{damaged');
});
