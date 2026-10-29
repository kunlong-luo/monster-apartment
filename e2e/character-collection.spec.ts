import {test,expect} from '@playwright/test';
test('character card can be summoned, forged and equipped without altering the factory',async({page})=>{
  test.setTimeout(90_000);
  await page.goto('/characters/');
  await expect(page.getByTestId('character-collection')).toBeVisible();
  await expect(page.getByTestId('gothic-summon-stage')).toBeVisible();
  await expect(page.getByTestId('summon-preview-yuesha-eclipse')).toHaveAttribute('aria-pressed','true');
  await page.getByTestId('summon-preview-brook-tide').click();
  await expect(page.getByTestId('summon-featured-portrait')).toHaveAttribute('data-tier','1');
  await expect(page.getByTestId('collection-tickets')).toHaveText('3');
  await expect(page.getByTestId('collection-odds')).toContainText('神话·月蚀');
  await expect(page.getByTestId('collection-odds')).toContainText('1.00%');
  await page.evaluate(()=>{
    const original=window.crypto.getRandomValues.bind(window.crypto);
    Object.defineProperty(window.crypto,'getRandomValues',{configurable:true,
      value:(array:Uint32Array)=>{
        if(array instanceof Uint32Array){array[0]=0;return array;}
        return original(array);
      }});
  });
  await page.getByTestId('collection-summon').click();
  await expect(page.getByTestId('collection-reveal')).toBeVisible();
  await expect(page.getByTestId('collection-reveal')).toHaveAttribute('data-rarity','普通');
  await expect(page.getByTestId('collection-reveal-name')).toContainText('泉泡');
  await page.getByTestId('collection-reveal-close').click();
  await expect(page.getByTestId('collection-card-brook-tide')).toContainText('已收录');
  await expect(page.getByTestId('collection-shards')).toHaveText('1');
  await page.getByTestId('collection-summon').click();
  await expect(page.getByTestId('collection-reveal')).toContainText('重复契约');
  await page.keyboard.press('Escape');
  await expect(page.getByTestId('collection-reveal')).toHaveCount(0);
  await expect(page.getByTestId('collection-shards')).toHaveText('3');
  await page.getByTestId('collection-gear-moon-pendant').click();
  await expect(page.getByTestId('collection-shards')).toHaveText('1');
  await page.getByTestId('collection-gear-moon-pendant').click();
  await expect(page.getByTestId('collection-feedback')).toContainText('泉泡已装备月纹吊坠');
  await expect(page.getByTestId('life-equipped-brook')).toContainText('月纹吊坠');
  await expect(page.getByTestId('adornment-brook-moon-pendant').first()).toBeVisible();
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

test('red eclipse reveal is visibly mythic and respects reduced motion',async({page})=>{
  test.setTimeout(90_000);
  await page.goto('/characters/');
  await expect(page.getByTestId('character-collection')).toBeVisible();
  await page.evaluate(()=>{
    localStorage.setItem('monster-apartment:gothic-motion-reduced','1');
    Object.defineProperty(window.crypto,'getRandomValues',{configurable:true,value:(a:Uint32Array)=>{
      a[0]=4294967295;return a;
    }});
  });
  await page.getByTestId('collection-summon').click();
  const reveal=page.getByTestId('collection-reveal');
  await expect(reveal).toBeVisible();
  await expect(reveal).toHaveAttribute('data-rarity','神话·月蚀');
  await expect(reveal).toHaveAttribute('data-motion','still');
  await expect(page.getByTestId('collection-reveal-rarity')).toContainText('红色');
  await expect(page.getByTestId('life-potential-yuesha')).toContainText('5 阶');
  await page.getByTestId('collection-reveal-close').click();
  await expect(page.getByTestId('adornment-tier-yuesha').first()).toBeVisible();
});

test('summon scene matches cinematic layout without horizontal overflow on 390px',async({page})=>{
  await page.setViewportSize({width:390,height:844});
  await page.goto('/characters/#summon');
  await expect(page.getByTestId('gothic-summon-stage')).toBeVisible();
  await expect(page.getByTestId('collection-summon')).toBeVisible();
  await expect(page.getByTestId('summon-preview-yuesha-eclipse')).toBeVisible();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)).toBeLessThanOrEqual(2);
  await page.getByTestId('summon-preview-yuesha-eclipse').click();
  await expect(page.getByTestId('summon-featured-portrait')).toHaveAttribute('data-tier','5');
  await expect(page.getByTestId('collection-odds')).toContainText('1.00%');
});
