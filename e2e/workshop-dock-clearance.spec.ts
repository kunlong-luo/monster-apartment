import {expect,test} from '@playwright/test';
import {mkdir} from 'node:fs/promises';
import {assignWorker,moveMachine,newWorkshop,placeMachine} from '../v2/src/workshop-engine';

// The smaller persistent scene launcher must not steal the real factory shift
// button hit target at either PC or mobile widths.
for (const viewport of [{width:1440,height:900},{width:390,height:844}]) {
  test(`workshop shift is uncovered by scene navigation at ${viewport.width}px`,async({page})=>{
    test.setTimeout(90_000);
    await page.setViewportSize(viewport);
    await page.goto('/workshop/');
    await expect(page.locator('#root')).toHaveAttribute('data-runtime-ready','true',{timeout:30_000});
    await expect(page.getByTestId('v2-stage')).toHaveAttribute('data-machine-effect-style','layered-resource-v2');
    await expect(page.getByTestId('v2-stage')).toHaveAttribute('data-machine-material-style','glass-botanical-crystal-v1');
    await expect(page.getByTestId('v2-stage')).toHaveAttribute('data-machine-actuator-style','piston-leaves-iris-v1');
    await expect(page.getByTestId('v2-stage')).toHaveAttribute('data-machine-working-atlases','0');
    await expect(page.getByTestId('v2-stage')).toHaveAttribute('data-machine-artwork-tier','review-avif');
    await expect(page.getByTestId('v2-stage')).toHaveAttribute('data-supply-routes','');
    const shift=page.getByTestId('v2-shift');
    const nav=page.getByTestId('scene-navigation');
    await expect(shift).toBeVisible();
    await expect(nav).toBeVisible();
    await expect(page.getByTestId('v2-world-nav')).toHaveCount(0);
    const bounds=await page.evaluate(()=>{
      const nav=document.querySelector('[data-testid="scene-navigation"]')!.getBoundingClientRect();
      const button=document.querySelector('[data-testid="v2-shift"]')!.getBoundingClientRect();
      const hit=document.elementFromPoint(button.left+button.width/2,button.top+button.height/2);
      return {
        launcherWidth:nav.width,
        room:innerWidth-nav.width,
        clickable:hit?.closest('[data-testid="v2-shift"]')!==null
      };
    });
    expect(bounds.launcherWidth).toBeLessThan(190);
    expect(bounds.room).toBeGreaterThan(130);
    expect(bounds.clickable).toBe(true);

    // The obsolete 7-button dock must not leave a 108px/84px empty band.
    // Reserve only the compact map height, keeping the production buttons
    // physically clear of the launcher while restoring height to the canvas.
    const geometry=await page.evaluate(()=>{
      const get=(selector:string)=>document.querySelector<HTMLElement>(selector)!.getBoundingClientRect();
      const nav=get('[data-testid="scene-navigation"]');
      const consolePanel=get('[data-testid="workshop-console"]');
      const canvasStage=get('[data-testid="v2-stage"]');
      const middle=get('#root .middle');
      const root=document.querySelector<HTMLElement>('.gothic-workshop-shell')!;
      return {
        reserved:parseFloat(getComputedStyle(root).getPropertyValue('--workshop-scene-nav-clearance')),
        clearance:nav.top-consolePanel.bottom,
        stageHeight:canvasStage.height,
        middleHeight:middle.height,
        stageEndsAboveConsole:middle.bottom<=consolePanel.top+1,
        horizontalOverflow:document.documentElement.scrollWidth-innerWidth,
      };
    });
    expect(geometry.reserved).toBe(viewport.width<768?60:64);
    expect(geometry.clearance).toBeGreaterThanOrEqual(4);
    expect(geometry.clearance).toBeLessThan(28);
    expect(geometry.middleHeight).toBeGreaterThan(viewport.width<768?230:450);
    expect(geometry.stageHeight).toBeGreaterThan(viewport.width<768?140:350);
    expect(geometry.stageEndsAboveConsole).toBe(true);
    expect(geometry.horizontalOverflow).toBeLessThanOrEqual(2);

    // On PC, scene-first is the default; the taller three-column console is
    // opt-in and must always restore its canvas space when closed. Record
    // real-browser images of both modes for visual comparison in CI.
    if(viewport.width===1440){
      const stage=page.getByTestId('v2-stage');
      const consolePanel=page.getByTestId('workshop-console');
      const layoutToggle=page.getByTestId('workshop-stage-layout-toggle');
      const shell=page.getByTestId('next-workshop-shell');
      const compactStage=await stage.boundingBox();
      const compactConsole=await consolePanel.boundingBox();
      expect(compactStage).not.toBeNull();
      expect(compactConsole).not.toBeNull();
      expect(compactStage!.width).toBeGreaterThan(940);
      expect(compactStage!.height).toBeGreaterThan(380);
      expect(compactConsole!.height).toBeLessThan(250);
      await expect(page.getByTestId('v2-worker-cinder')).toBeVisible();
      await mkdir('visual-evidence/workshop',{recursive:true});
      await page.screenshot({path:'visual-evidence/workshop/desktop-workshop-scene-1440.png',animations:'disabled'});

      await layoutToggle.click();
      await expect(shell).toHaveAttribute('data-console-layout','expanded');
      const expandedStage=await stage.boundingBox();
      const expandedConsole=await consolePanel.boundingBox();
      expect(expandedStage).not.toBeNull();
      expect(expandedConsole).not.toBeNull();
      expect(compactStage!.height-expandedStage!.height).toBeGreaterThan(60);
      expect(expandedConsole!.height-compactConsole!.height).toBeGreaterThan(60);
      await page.screenshot({path:'visual-evidence/workshop/desktop-workshop-expanded-1440.png',animations:'disabled'});

      await layoutToggle.click();
      await expect(shell).toHaveAttribute('data-console-layout','scene');
      const restoredStage=await stage.boundingBox();
      expect(restoredStage!.height).toBeGreaterThanOrEqual(compactStage!.height-1);
    }
    await shift.click();
    await expect(page.getByTestId('v2-day')).toHaveText('2');
  });
}

test('painted workshop shows only authentic supplier-to-receiver flow',async({page})=>{
  test.setTimeout(90_000);
  let world=newWorkshop();
  world=moveMachine(world,7,6);
  world=placeMachine(world,7,'kiln');
  world=assignWorker(world,'brook',5);
  world=assignWorker(world,'fern',6);
  world=assignWorker(world,'cinder',7);
  const before=JSON.stringify(world);
  await page.setViewportSize({width:1440,height:900});
  await page.addInitScript(seed=>{
    const key='monster-apartment:workshop-v2-lab';
    if(localStorage.getItem(key)===null)localStorage.setItem(key,JSON.stringify(seed));
  },world);
  await page.goto('/workshop/');
  const stage=page.getByTestId('v2-stage');
  await expect(page.locator('#root')).toHaveAttribute('data-runtime-ready','true',{timeout:30_000});
  await expect(stage).toHaveAttribute('data-machine-effect-style','layered-resource-v2');
  await expect(stage).toHaveAttribute('data-machine-material-style','glass-botanical-crystal-v1');
  await expect(stage).toHaveAttribute('data-machine-actuator-style','piston-leaves-iris-v1');
  await expect(stage).toHaveAttribute('data-machine-working-atlases','0');
  await expect(stage).toHaveAttribute('data-machine-artwork-tier','review-avif');
  await expect(stage).toHaveAttribute('data-supply-routes','5>6:water;6>7:fiber');
  await expect(stage).toHaveAttribute('data-machine-states',/5:working;6:working;7:working/);
  await expect(stage.locator('canvas')).toBeVisible();
  const persisted=await page.evaluate(()=>localStorage.getItem('monster-apartment:workshop-v2-lab'));
  expect(persisted).toBe(before); // rendering must not alter the economy or save
  await mkdir('visual-evidence/workshop',{recursive:true});
  await page.screenshot({path:'visual-evidence/workshop/desktop-workshop-working-effects-1440.png',animations:'disabled'});
  await page.evaluate(()=>{
    localStorage.setItem('monster-apartment:gothic-motion-reduced','1');
    window.dispatchEvent(new Event('monster-apartment:motion-changed'));
  });
  await expect(stage).toHaveAttribute('data-motion-state','paused');
  await expect(stage).toHaveAttribute('data-supply-routes','5>6:water;6>7:fiber');
});


test('approved sprites stay live while nine independent review WebPs require explicit opt-in',async({page})=>{
  test.setTimeout(100_000);
  let world=newWorkshop();
  world=moveMachine(world,7,6);
  world=placeMachine(world,7,'kiln');
  world=assignWorker(world,'brook',5);
  world=assignWorker(world,'fern',6);
  world=assignWorker(world,'cinder',7);
  const saved=JSON.stringify(world);
  await page.setViewportSize({width:1440,height:900});
  await page.addInitScript(seed=>{
    const key='monster-apartment:workshop-v2-lab';
    if(localStorage.getItem(key)===null)localStorage.setItem(key,JSON.stringify(seed));
  },world);
  await page.goto('/workshop/?machine-art=review');
  const stage=page.getByTestId('v2-stage');
  await expect(page.locator('#root')).toHaveAttribute('data-runtime-ready','true',{timeout:35_000});
  await expect(stage).toHaveAttribute('data-machine-artwork-tier','review-webp');
  await expect(stage).toHaveAttribute('data-machine-working-atlases','3');
  await expect(stage).toHaveAttribute('data-machine-animated-tiles','');
  await expect(stage.locator('canvas')).toBeVisible();
  await mkdir('visual-evidence/workshop',{recursive:true});
  await page.screenshot({path:'visual-evidence/workshop/desktop-machine-art-review-1440.png',animations:'disabled'});
  expect(await page.evaluate(()=>localStorage.getItem('monster-apartment:workshop-v2-lab')))
    .toBe(saved);
  await page.goto('/workshop/');
  await expect(stage).toHaveAttribute('data-machine-artwork-tier','review-avif',{timeout:35_000});
  await page.setViewportSize({width:390,height:844});
  await page.goto('/workshop/?machine-art=review');
  await expect(stage).toHaveAttribute('data-machine-artwork-tier','review-webp',{timeout:35_000});
  await expect(stage.locator('canvas')).toBeVisible();
  await page.screenshot({path:'visual-evidence/workshop/mobile-machine-art-review-390.png',animations:'disabled'});
  expect(await page.evaluate(()=>localStorage.getItem('monster-apartment:workshop-v2-lab')))
    .toBe(saved);
});

test('Lv.2 animated review art follows real production and leaves all saved values intact',async({page})=>{
  test.setTimeout(115_000);
  let world=newWorkshop();
  world=moveMachine(world,7,6);
  world=placeMachine(world,7,'kiln');
  world=assignWorker(world,'brook',5);
  world=assignWorker(world,'fern',6);
  world=assignWorker(world,'cinder',7);
  for(const index of [5,6,7])world.tiles[index]!.level=2;
  const saved=JSON.stringify(world);
  await page.emulateMedia({reducedMotion:'no-preference'});
  await page.setViewportSize({width:1440,height:900});
  await page.addInitScript(seed=>{
    const key='monster-apartment:workshop-v2-lab';
    if(localStorage.getItem(key)===null)localStorage.setItem(key,JSON.stringify(seed));
  },world);
  await page.goto('/workshop/?machine-art=review');
  const stage=page.getByTestId('v2-stage');
  await expect(page.locator('#root')).toHaveAttribute('data-runtime-ready','true',{timeout:45_000});
  await expect(stage).toHaveAttribute('data-machine-artwork-tier','review-webp');
  await expect(stage).toHaveAttribute('data-machine-working-atlases','3');
  await expect(stage).toHaveAttribute('data-machine-states',/5:working;6:working;7:working/);
  await expect(stage).toHaveAttribute('data-machine-animated-tiles','5;6;7');
  await mkdir('visual-evidence/workshop',{recursive:true});
  await page.screenshot({path:'visual-evidence/workshop/desktop-machine-lv2-working-1440.png',animations:'disabled'});
  expect(await page.evaluate(()=>localStorage.getItem('monster-apartment:workshop-v2-lab'))).toBe(saved);
  await page.evaluate(()=>{
    localStorage.setItem('monster-apartment:gothic-motion-reduced','1');
    window.dispatchEvent(new Event('monster-apartment:motion-changed'));
  });
  await expect(stage).toHaveAttribute('data-motion-state','paused');
  await expect(stage).toHaveAttribute('data-machine-animated-tiles','5;6;7');
  await page.setViewportSize({width:390,height:844});
  await page.goto('/workshop/?machine-art=review');
  await expect(stage).toHaveAttribute('data-machine-animated-tiles','5;6;7',{timeout:45_000});
  await page.screenshot({path:'visual-evidence/workshop/mobile-machine-lv2-working-390.png',animations:'disabled'});
  expect(await page.evaluate(()=>localStorage.getItem('monster-apartment:workshop-v2-lab'))).toBe(saved);
  // Normal players do not load even one review atlas.
  await page.goto('/workshop/');
  await expect(stage).toHaveAttribute('data-machine-working-atlases','0',{timeout:45_000});
  await expect(stage).toHaveAttribute('data-machine-animated-tiles','');
});
