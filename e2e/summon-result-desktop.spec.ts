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
  await expect(card.locator('.contract-card__art-status')).toHaveText('契约典藏 · 人物肖像');
  await expect(card.locator('svg.lucide-sparkles')).toHaveCount(0);
  await expect.poll(()=>card.locator('img').evaluate(img=>(img as HTMLImageElement).complete&&(img as HTMLImageElement).naturalWidth>0)).toBe(true);
  // Wait for Motion's full-card reveal: a screenshot of a mid-rotate
  // silhouette is not a valid assessment of finished portrait composition.
  await page.waitForTimeout(750);
  const bounds=await card.boundingBox();
  expect(bounds).not.toBeNull();
  expect(bounds!.height).toBeGreaterThan(430);
  const projection=await page.locator('.summon-result__hero').evaluate(element=>{
    const node=element as HTMLElement;
    return {width:node.getBoundingClientRect().width,layoutWidth:node.offsetWidth};
  });
  expect(projection.width/projection.layoutWidth).toBeGreaterThan(.97);
  expect(bounds!.y).toBeGreaterThanOrEqual(0);
  expect(bounds!.y+bounds!.height).toBeLessThanOrEqual(900);
  const firstDraw=await page.evaluate(()=>JSON.parse(localStorage.getItem('monster-apartment:gacha-v2')!).totalSummons);
  expect(firstDraw).toBe(1);
  await page.addStyleTag({content:'nextjs-portal{display:none!important}'});
  await page.screenshot({path:'test-results/desktop-summon-single-v373.png',animations:'disabled'});
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
  // Pause autoplay before testing deliberate selection, avoiding a timer race.
  await page.getByTestId('summon-autoplay-pause').click();
  await page.getByTestId('summon-result-thumb').first().click();
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
  await page.screenshot({path:'test-results/desktop-summon-ten-v373.png',animations:'disabled'});
  const total=await page.evaluate(()=>JSON.parse(localStorage.getItem('monster-apartment:gacha-v2')!).totalSummons);
  expect(total).toBe(10);
});

test('cinematic omen shows exact rarest awarded rarity and never rerolls',async({page})=>{
  test.setTimeout(90000);
  await page.setViewportSize({width:1440,height:900});
  await page.goto('/characters/#summon-screen');
  await expect(page.getByTestId('gothic-summon-stage')).toBeVisible({timeout:30000});
  await page.evaluate(()=>localStorage.setItem('monster-apartment:gacha-v2',JSON.stringify({
    version:2,tickets:1,crystals:0,moonstones:0,pityCountdown:1,
    totalSummons:0,history:[],ownedIds:[],claimedProgressRewards:[],activePoolId:'mythic-eclipse',
  })));
  await page.reload();
  await page.getByTestId('collection-summon').click();
  const reveal=page.getByTestId('collection-reveal');
  await expect(reveal).toHaveAttribute('data-ritual-phase','charge');
  await expect(reveal).toHaveAttribute('data-ritual-phase','seal',{timeout:5000});
  await expect(reveal).toHaveAttribute('data-ritual-phase','omen',{timeout:5000});
  await expect(page.getByTestId('summon-ritual-intro')).toHaveAttribute('data-omen-rarity',/^SSR-/);
  const ritualViewport=await page.getByTestId('summon-ritual-intro').boundingBox();
  expect(ritualViewport!.height).toBeGreaterThan(690);
  const omenShape=page.locator('.summon-cinematic-ritual__omen');
  const omenText=page.locator('.summon-cinematic-ritual__copy');
  await expect(omenShape).toBeVisible();
  await expect(omenText).toBeVisible();
  const computedFrame=await page.locator('.summon-cinematic-ritual__art').evaluate(el=>({
    position:getComputedStyle(el).position,top:getComputedStyle(el).top,
    height:getComputedStyle(el).height,
  }));
  expect(computedFrame.position).toBe('relative');
  const omenBox=await omenShape.boundingBox();
  const omenCopyBox=await omenText.boundingBox();
  const diagnostic=await page.evaluate(()=>{
    const box=(selector:string)=>{
      const el=document.querySelector<HTMLElement>(selector);
      if(!el)return null;
      const b=el.getBoundingClientRect(),style=getComputedStyle(el);
      return {top:b.top,bottom:b.bottom,left:b.left,height:b.height,
        position:style.position,cssTop:style.top,cssHeight:style.height,
        transform:style.transform,display:style.display};
    };
    return {parent:box('.summon-cinematic-ritual'),art:box('.summon-cinematic-ritual__art'),
      omen:box('.summon-cinematic-ritual__omen'),copy:box('.summon-cinematic-ritual__copy'),
      modal:box('.summon-reveal-overlay'),viewport:{width:innerWidth,height:innerHeight}};
  });
  console.log('CINEMATIC_GEOMETRY_DIAGNOSTIC',JSON.stringify(diagnostic));
  await page.screenshot({path:'test-results/desktop-summon-omen-layout-v373.png',animations:'disabled'});
  expect(omenBox!.y+omenBox!.height,JSON.stringify(diagnostic)).toBeLessThan(omenCopyBox!.y-8);
  const rarity=await page.getByTestId('summon-ritual-intro').getAttribute('data-omen-rarity');
  await page.addStyleTag({content:'nextjs-portal{display:none!important}'});
  await page.screenshot({path:'test-results/desktop-summon-omen-v373.png',animations:'disabled'});
  await expect(reveal).toHaveAttribute('data-ritual-phase','flip',{timeout:5000});
  // The flip must actually render before the sequence moves into reveal.
  await expect(page.getByTestId('summon-ritual-flip')).toBeVisible({timeout:1600});
  const flipBox=await page.locator('.summon-cinematic-ritual__turning-card').boundingBox();
  const captionBox=await page.locator('.summon-cinematic-ritual__copy').boundingBox();
  expect(flipBox!.y+flipBox!.height).toBeLessThan(captionBox!.y-8);
  await page.screenshot({path:'test-results/desktop-summon-flip-v373.png',animations:'disabled'});
  await expect(reveal).toHaveAttribute('data-ritual-phase','reveal',{timeout:5000});
  const actual=await page.getByTestId('collection-focus-card').getAttribute('data-rarity');
  expect(actual).toBe(rarity);
  const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('monster-apartment:gacha-v2')!));
  expect(saved.totalSummons).toBe(1);
  expect(saved.history).toHaveLength(1);
});
test('game reduced motion skips cinematic, with one saved draw even after Escape',async({page})=>{
  test.setTimeout(90000);
  await page.setViewportSize({width:1440,height:900});
  await page.goto('/characters/#summon-screen');
  await expect(page.getByTestId('gothic-summon-stage')).toBeVisible();
  await page.evaluate(()=>localStorage.setItem('monster-apartment:gothic-motion-reduced','1'));
  await page.getByTestId('collection-summon').click();
  const modal=page.getByTestId('collection-reveal');
  await expect(modal).toHaveAttribute('data-motion','still');
  await expect(modal).toHaveAttribute('data-ritual-phase','reveal',{timeout:2500});
  await expect(page.getByTestId('collection-reveal-award')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(modal).toHaveCount(0);
  const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('monster-apartment:gacha-v2')!));
  expect(saved.totalSummons).toBe(1);
  expect(saved.history).toHaveLength(1);
});

test('PC ten-pull automatically flips results in order and supports pause, resume and replay',async({page})=>{
  test.setTimeout(110000);
  await page.setViewportSize({width:1440,height:900});
  await page.goto('/characters/#summon-screen');
  await expect(page.getByTestId('gothic-summon-stage')).toBeVisible({timeout:30000});
  await page.evaluate(()=>localStorage.setItem('monster-apartment:gacha-v2',JSON.stringify({
    version:2,tickets:10,crystals:0,moonstones:0,pityCountdown:1,
    totalSummons:0,history:[],ownedIds:[],claimedProgressRewards:[],
    activePoolId:'mythic-eclipse',
  })));
  await page.reload();
  await page.getByTestId('collection-summon-ten').click();
  await page.getByTestId('collection-reveal').getByRole('button',{name:'跳过仪式'}).click();
  const stage=page.getByTestId('summon-result-stage');
  await expect(stage).toHaveAttribute('data-playback-state','playing');
  await expect(stage).toHaveAttribute('data-revealed-count',/[1-4]/,{timeout:4000});
  await page.getByTestId('summon-autoplay-pause').click();
  await expect(stage).toHaveAttribute('data-playback-state','paused');
  const pausedCount=await stage.getAttribute('data-revealed-count');
  await page.waitForTimeout(750);
  expect(await stage.getAttribute('data-revealed-count')).toBe(pausedCount);
  await page.getByTestId('summon-autoplay-resume').click();
  await expect(stage).toHaveAttribute('data-playback-state','playing');
  await expect(stage).toHaveAttribute('data-revealed-count','10',{timeout:25000});
  await expect(stage).toHaveAttribute('data-playback-state','complete',{timeout:6000});
  await expect(page.getByTestId('collection-reveal-award')).toHaveCount(10);
  const history=await page.evaluate(()=>JSON.parse(localStorage.getItem('monster-apartment:gacha-v2')!).history);
  expect(history).toHaveLength(10);
  await expect(page.getByTestId('summon-replay')).toBeVisible();
  await page.addStyleTag({content:'nextjs-portal{display:none!important}'});
  await page.screenshot({path:'test-results/desktop-ten-autoplay-v373.png',animations:'disabled'});
  await page.getByTestId('summon-replay').click();
  await expect(stage).toHaveAttribute('data-playback-state','playing');
  await expect(stage).toHaveAttribute('data-revealed-count','0');
  await page.getByTestId('summon-reveal-all').click();
  await expect(stage).toHaveAttribute('data-playback-state','complete');
  await expect(stage).toHaveAttribute('data-selected-index',/\d/);
  const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('monster-apartment:gacha-v2')!));
  expect(saved.totalSummons).toBe(10);
  expect(saved.history).toEqual(history);
  const high=page.getByTestId('summon-result-thumb');
  const ssrIndex=history.findIndex((record:{rarity:string})=>record.rarity.startsWith('SSR'));
  if(ssrIndex>=0){
    await high.nth(ssrIndex).click();
    await expect(page.getByTestId('summon-high-rarity')).toBeVisible();
    // High-rarity narration belongs to the side column, not over the face.
    const badge=await page.getByTestId('summon-high-rarity').boundingBox();
    const art=await page.getByTestId('collection-focus-card').boundingBox();
    expect(badge!.x).toBeGreaterThan(art!.x+art!.width);
    await expect(page.getByTestId('summon-result-focus').locator('img')).toHaveCount(1);
    // Screenshot the settled collectible portrait, not a mid-rotate Motion frame.
    await page.waitForTimeout(600);
    await expect(page.getByTestId('collection-focus-card')).toBeVisible();
    await expect(page.locator('.contract-card__rarity svg.lucide-sparkles')).toHaveCount(0);
    await page.screenshot({path:'test-results/desktop-ten-ssr-focus-v373.png',animations:'disabled'});
  }
});
test('reduced-motion ten-pull reveals all without timed autoplay',async({page})=>{
  test.setTimeout(60000);
  await page.setViewportSize({width:1440,height:900});
  await page.goto('/characters/#summon-screen');
  await expect(page.getByTestId('gothic-summon-stage')).toBeVisible();
  await page.evaluate(()=>{
    localStorage.setItem('monster-apartment:gothic-motion-reduced','1');
    localStorage.setItem('monster-apartment:gacha-v2',JSON.stringify({
      version:2,tickets:10,crystals:0,moonstones:0,pityCountdown:90,
      totalSummons:0,history:[],ownedIds:[],claimedProgressRewards:[],activePoolId:'mythic-eclipse',
    }));
  });
  await page.reload();
  await page.getByTestId('collection-summon-ten').click();
  const stage=page.getByTestId('summon-result-stage');
  await expect(stage).toHaveAttribute('data-playback-state','complete',{timeout:3000});
  await expect(stage).toHaveAttribute('data-revealed-count','10');
  await expect(page.getByTestId('summon-autoplay-pause')).toHaveCount(0);
  await expect(page.getByTestId('collection-reveal-award')).toHaveCount(10);
  expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('monster-apartment:gacha-v2')!).totalSummons)).toBe(10);
});
