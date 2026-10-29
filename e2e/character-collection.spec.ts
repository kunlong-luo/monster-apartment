import {test,expect} from '@playwright/test';
test('character card can be summoned, forged and equipped without altering the factory',async({page})=>{
  test.setTimeout(90_000);
  await page.goto('/characters/');
  await expect(page.getByTestId('character-collection')).toBeVisible();
  await expect(page.getByTestId('collection-tickets')).toHaveText('3');
  await expect(page.getByTestId('collection-odds')).toContainText('神话·月蚀 1%');
  await page.evaluate(()=>{
    const original=window.crypto.getRandomValues.bind(window.crypto);
    Object.defineProperty(window.crypto,'getRandomValues',{configurable:true,
      value:(array:Uint32Array)=>{
        if(array instanceof Uint32Array){array[0]=0;return array;}
        return original(array);
      }});
  });
  await page.getByTestId('collection-summon').click();
  await expect(page.getByTestId('collection-card-brook-tide')).toContainText('已收录');
  await expect(page.getByTestId('collection-shards')).toHaveText('1');
  await page.getByTestId('collection-summon').click();
  await expect(page.getByTestId('collection-shards')).toHaveText('3');
  await page.getByTestId('collection-gear-moon-pendant').click();
  await expect(page.getByTestId('collection-shards')).toHaveText('1');
  await page.getByTestId('collection-gear-moon-pendant').click();
  await expect(page.getByTestId('collection-feedback')).toContainText('泉泡已装备月纹吊坠');
  await expect(page.getByTestId('life-equipped-brook')).toContainText('月纹吊坠');
  await page.getByTestId('life-expand-brook').click();
  await expect(page.getByTestId('life-profile-brook')).toContainText('+8');
  await expect(page.getByTestId('life-potential-brook')).toContainText('1 阶');
  await page.reload();
  await expect(page.getByTestId('collection-card-brook-tide')).toContainText('已收录');
  await expect(page.getByTestId('life-equipped-brook')).toContainText('月纹吊坠');
  await expect(page.getByTestId('collection-tickets')).toHaveText('1');
});
test('corrupt collections are preserved and cannot consume summons',async({page})=>{
  await page.goto('/characters/');
  await expect(page.getByTestId('character-collection')).toBeVisible();
  await page.evaluate(()=>localStorage.setItem('monster-apartment:character-collection:v1','{bad-original'));
  await page.reload();
  await expect(page.getByTestId('collection-storage-error')).toBeVisible();
  await expect(page.getByTestId('collection-summon')).toBeDisabled();
  expect(await page.evaluate(()=>localStorage.getItem('monster-apartment:character-collection:v1')))
    .toBe('{bad-original');
});
