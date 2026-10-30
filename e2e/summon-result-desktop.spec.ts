import {test,expect} from '@playwright/test';

test('PC single pull reveals a large face card with real persisted award',async({page})=>{
  test.setTimeout(90000);
  await page.setViewportSize({width:1440,height:900});
  await page.goto('/characters/#summon-screen');
  await expect(page.getByTestId('gothic-summon-stage')).toBeVisible({timeout:30000});
  await page.getByTestId('collection-summon').click();
  const modal=page.getByTestId('collection-reveal');
  await expect(modal).toBeVisible();
  await modal.getByRole('button',{name:'跳过仪式'}).click();
  const card=page.getByTestId('collection-focus-card');
  await expect(card).toBeVisible();
  await expect(page.getByTestId('collection-reveal-award')).toContainText('首次收录');
  await expect(page.getByTestId('collection-reveal-award')).toContainText('+1 锻造碎片');
  await expect.poll(()=>card.locator('img').evaluate(img=>(img as HTMLImageElement).complete&&(img as HTMLImageElement).naturalWidth>0)).toBe(true);
  const bounds=await card.boundingBox();
  expect(bounds).not.toBeNull();
  expect(bounds!.height).toBeGreaterThan(430);
  expect(bounds!.y).toBeGreaterThanOrEqual(0);
  expect(bounds!.y+bounds!.height).toBeLessThanOrEqual(900);
  const firstDraw=await page.evaluate(()=>JSON.parse(localStorage.getItem('monster-apartment:gacha-v2')!).totalSummons);
  expect(firstDraw).toBe(1);
  await page.addStyleTag({content:'nextjs-portal{display:none!important}'});
  await page.screenshot({path:'test-results/desktop-summon-single-v370.png',animations:'disabled'});
});
test('PC ten-pull lets the player select every actual card in one cinematic focus',async({page})=>{
  test.setTimeout(90000);
  await page.setViewportSize({width:1440,height:900});
  await page.goto('/characters/#summon-screen');
  await expect(page.getByTestId('gothic-summon-stage')).toBeVisible();
  await page.evaluate(()=>localStorage.setItem('monster-apartment:gacha-v2',JSON.stringify({
    version:2,tickets:10,crystals:0,moonstones:0,pityCountdown:90,
    totalSummons:0,history:[],ownedIds:[],claimedProgressRewards:[],
    activePoolId:'mythic-eclipse',
  })));
  await page.reload();
  await page.getByTestId('collection-summon-ten').click();
  const modal=page.getByTestId('collection-reveal');
  await modal.getByRole('button',{name:'跳过仪式'}).click();
  await expect(page.getByTestId('summon-result-filmstrip').getByRole('button')).toHaveCount(10);
  await page.getByRole('button',{name:'翻开第 1 张契约卡'}).click();
  await expect(page.getByTestId('collection-focus-card')).toBeVisible();
  await page.getByRole('button',{name:'全部翻开'}).click();
  await expect(page.getByTestId('collection-reveal-award')).toHaveCount(10);
  await expect(page.getByTestId('collection-reveal-view-collection')).toBeVisible();
  const thumbs=page.getByTestId('summon-result-thumb');
  await thumbs.last().click();
  await expect(page.getByTestId('summon-result-stage')).toHaveAttribute('data-selected-index','9');
  const current=await page.getByTestId('collection-focus-card').getAttribute('data-card-id');
  const owned=await page.evaluate(()=>JSON.parse(localStorage.getItem('monster-apartment:gacha-v2')!).history.map((r:{characterId:string})=>r.characterId));
  // Gacha history stores the ten draws in their original order; index 9 is the last selected card.
  expect(current).toBe(owned[9]);
  await expect.poll(()=>page.getByTestId('collection-focus-card').locator('img').evaluate(img=>(img as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
  const box=await page.getByTestId('collection-focus-card').boundingBox();
  expect(box!.height).toBeGreaterThan(350);
  expect(box!.y+box!.height).toBeLessThanOrEqual(900);
  await page.addStyleTag({content:'nextjs-portal{display:none!important}'});
  await page.screenshot({path:'test-results/desktop-summon-ten-v370.png',animations:'disabled'});
  const total=await page.evaluate(()=>JSON.parse(localStorage.getItem('monster-apartment:gacha-v2')!).totalSummons);
  expect(total).toBe(10);
});
