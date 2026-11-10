import {expect,test} from '@playwright/test';
import {mkdir} from 'node:fs/promises';
import {assignWorker,moveMachine,newWorkshop,placeMachine,runShift} from '../v2/src/workshop-engine';

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
    const stageComposition=page.getByTestId('workshop-stage-composition');
    if(viewport.width===1440){
      // Desktop-first real cinematic scene, backed by the actual plot state.
      await expect(stageComposition).toHaveAttribute('data-view','cinematic');
      await expect(page.getByTestId('workshop-cinematic-scene')).toBeVisible();
      await expect(page.getByTestId('workshop-cinematic-machine-well'))
        .toHaveAttribute('data-plot','5');
      await page.getByTestId('workshop-cinematic-machine-well').click();
      await expect(page.getByTestId('v2-next-step')).toContainText('06 号地块');
      await expect(page.getByTestId('workshop-cinematic-machine-well'))
        .toHaveAttribute('aria-pressed','true');
    }else{
      await expect(stageComposition).toHaveAttribute('data-view','grid');
      await expect(page.getByTestId('workshop-view-cinematic')).toBeHidden();
    }
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
      // Scenic side panels must not cover the full-width stage toolbar.
      for(const testId of ['workshop-stage-layout-toggle','workshop-view-cinematic','workshop-view-grid']){
        const uncovered=await page.getByTestId(testId).evaluate(button=>{
          const bounds=button.getBoundingClientRect();
          const target=document.elementFromPoint(bounds.left+bounds.width/2,bounds.top+bounds.height/2);
          return target===button||button.contains(target);
        });
        expect(uncovered,testId+' is occluded by a scenic overlay').toBe(true);
      }
      const compactStage=await stage.boundingBox();
      const compactConsole=await consolePanel.boundingBox();
      expect(compactStage).not.toBeNull();
      expect(compactConsole).not.toBeNull();
      expect(compactStage!.width).toBeGreaterThan(940);
      expect(compactStage!.height).toBeGreaterThan(380);
      expect(compactConsole!.height).toBeLessThan(80);
      await expect(page.getByTestId('console-roster')).toBeHidden();
      await expect(page.getByTestId('v2-worker-cinder')).toBeHidden();
      await mkdir('visual-evidence/workshop',{recursive:true});
      await page.screenshot({path:'visual-evidence/workshop/desktop-workshop-scene-1440.png',animations:'disabled'});

      await page.getByTestId('workshop-view-grid').click();
      await expect(stageComposition).toHaveAttribute('data-view','grid');
      await expect(page.getByTestId('workshop-cinematic-scene')).toHaveCount(0);
      await page.screenshot({path:'visual-evidence/workshop/desktop-workshop-build-grid-1440.png',animations:'disabled'});
      await page.getByTestId('workshop-view-cinematic').click();
      await expect(stageComposition).toHaveAttribute('data-view','cinematic');

      await layoutToggle.click();
      await expect(shell).toHaveAttribute('data-console-layout','expanded');
      await expect(page.getByTestId('v2-worker-cinder')).toBeVisible();
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
  await expect(stage).toHaveAttribute('data-machine-preview-scale','painted-1.075-1.125');
  await expect(stage).toHaveAttribute('data-machine-working-atlases','0');
  await expect(stage).toHaveAttribute('data-machine-animated-tiles','');
  // R01 hides the equipment catalog in scenic mode. Open the real drawer
  // before checking image decoding, so lazy WebPs are requested by the browser.
  await expect(page.getByTestId('console-equipment')).toBeHidden();
  await page.getByTestId('workshop-stage-layout-toggle').click();
  await expect(page.getByTestId('console-equipment')).toBeVisible();
  for(const craft of ['well','garden','kiln']){
    const frame=page.getByTestId('workshop-machine-thumbnail-frame-'+craft);
    const image=page.getByTestId('workshop-machine-thumbnail-'+craft);
    await expect(frame).toHaveAttribute('data-art-tier','cg-review');
    await expect(image).toHaveAttribute('src',new RegExp('review/machines/'+craft+'/lv1[.]webp'));
    await image.scrollIntoViewIfNeeded();
    const good=await image.evaluate(async el=>{
      const img=el as HTMLImageElement;
      await img.decode();
      return img.naturalWidth===512&&img.naturalHeight===512;
    });
    expect(good).toBe(true);
  }
  await expect(stage.locator('canvas')).toBeVisible();
  await mkdir('visual-evidence/workshop',{recursive:true});
  await page.screenshot({path:'visual-evidence/workshop/desktop-machine-art-review-1440.png',animations:'disabled'});
  expect(await page.evaluate(()=>localStorage.getItem('monster-apartment:workshop-v2-lab')))
    .toBe(saved);
  await page.goto('/workshop/');
  await expect(stage).toHaveAttribute('data-machine-artwork-tier','review-avif',{timeout:35_000});
  await expect(stage).toHaveAttribute('data-machine-preview-scale','normal');
  for(const craft of ['well','garden','kiln']){
    await expect(page.getByTestId('workshop-machine-thumbnail-frame-'+craft))
      .toHaveAttribute('data-art-tier','legacy');
  }
  await page.setViewportSize({width:390,height:844});
  await page.goto('/workshop/?machine-art=review');
  await expect(stage).toHaveAttribute('data-machine-artwork-tier','review-webp',{timeout:35_000});
  await expect(stage.locator('canvas')).toBeVisible();
  await page.screenshot({path:'visual-evidence/workshop/mobile-machine-art-review-390.png',animations:'disabled'});
  expect(await page.evaluate(()=>localStorage.getItem('monster-apartment:workshop-v2-lab')))
    .toBe(saved);
});

test('Lv.2 painted review keeps correct equipment and production without mismatched atlases',async({page})=>{
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
  await expect(stage).toHaveAttribute('data-machine-working-atlases','0');
  await expect(stage).toHaveAttribute('data-machine-states',/5:working;6:working;7:working/);
  await expect(stage).toHaveAttribute('data-machine-animated-tiles','');
  await expect(stage).toHaveAttribute('data-machine-preview-scale','painted-1.075-1.125');
  for(const craft of ['well','garden','kiln']){
    await expect(page.getByTestId('workshop-machine-thumbnail-'+craft))
      .toHaveAttribute('src',new RegExp('review/machines/'+craft+'/lv2[.]webp'));
  }
  await mkdir('visual-evidence/workshop',{recursive:true});
  await page.screenshot({path:'visual-evidence/workshop/desktop-machine-lv2-cg-still-1440.png',animations:'disabled'});
  expect(await page.evaluate(()=>localStorage.getItem('monster-apartment:workshop-v2-lab'))).toBe(saved);
  await page.evaluate(()=>{
    localStorage.setItem('monster-apartment:gothic-motion-reduced','1');
    window.dispatchEvent(new Event('monster-apartment:motion-changed'));
  });
  await expect(stage).toHaveAttribute('data-motion-state','paused');
  await expect(stage).toHaveAttribute('data-machine-animated-tiles','');
  await page.setViewportSize({width:390,height:844});
  await page.goto('/workshop/?machine-art=review');
  await expect(stage).toHaveAttribute('data-machine-animated-tiles','',{timeout:45_000});
  await page.screenshot({path:'visual-evidence/workshop/mobile-machine-lv2-cg-still-390.png',animations:'disabled'});
  expect(await page.evaluate(()=>localStorage.getItem('monster-apartment:workshop-v2-lab'))).toBe(saved);
  // Normal players do not load even one review atlas.
  await page.goto('/workshop/');
  await expect(stage).toHaveAttribute('data-machine-working-atlases','0',{timeout:45_000});
  await expect(stage).toHaveAttribute('data-machine-animated-tiles','');
});


test('review mode validates nine high-detail 512px machine CG candidates without mismatched motion',async({page})=>{
  test.setTimeout(110_000);
  await page.setViewportSize({width:1440,height:900});
  await page.goto('/workshop/');
  await expect(page.locator('#root')).toHaveAttribute('data-runtime-ready','true',{timeout:45_000});
  await expect(page.getByTestId('workshop-art-review-launcher')).toHaveCount(0);

  await page.goto('/workshop/?machine-art=review');
  await expect(page.locator('#root')).toHaveAttribute('data-runtime-ready','true',{timeout:45_000});
  const before=await page.evaluate(()=>localStorage.getItem('monster-apartment:workshop-v2-lab'));
  const launch=page.getByTestId('workshop-art-review-launcher');
  await expect(launch).toBeVisible();
  await launch.click();
  const dialog=page.getByTestId('workshop-art-review-dialog');
  await expect(dialog).toBeVisible();
  await expect(page.getByTestId('workshop-review-static-image')).toHaveAttribute('src',new RegExp('review/machines/well/lv2[.]webp'));
  // R10.3 adds a matching light-only study, NOT the mismatched old procedural
  // mechanical atlas. The still chassis never morphs into a foreign machine.
  await expect(page.getByTestId('workshop-review-working-frame'))
    .toHaveAttribute('data-animation-tier','light-study');
  await expect(page.getByTestId('workshop-review-playback')).toBeEnabled();
  await expect(page.getByTestId('workshop-review-frame-2')).toBeEnabled();

  await page.getByTestId('workshop-review-craft-garden').click();
  await expect(page.getByTestId('workshop-review-static-image')).toHaveAttribute('src',new RegExp('review/machines/garden/lv2[.]webp'));
  await page.getByTestId('workshop-review-level-3').click();
  await expect(page.getByTestId('workshop-review-no-atlas')).toBeVisible();
  await expect(page.getByTestId('workshop-review-playback')).toBeDisabled();
  await expect(page.getByTestId('workshop-review-static-image')).toHaveAttribute('src',new RegExp('review/machines/garden/lv3[.]webp'));
  await page.getByTestId('workshop-review-craft-kiln').click();
  await expect(page.getByTestId('workshop-review-static-image')).toHaveAttribute('src',new RegExp('review/machines/kiln/lv3[.]webp'));
  await page.getByTestId('workshop-review-level-2').click();
  await expect(page.getByTestId('workshop-review-working-frame'))
    .toHaveAttribute('data-animation-tier','light-study');
  // Prove all nine actual imported WebPs decode at native dimensions.
  for(const craft of ['well','garden','kiln']){
    await page.getByTestId('workshop-review-craft-'+craft).click();
    for(const level of [1,2,3]){
      await page.getByTestId('workshop-review-level-'+level).click();
      await expect(page.getByTestId('workshop-review-static-image'))
        .toHaveAttribute('src',new RegExp('review/machines/'+craft+'/lv'+level+'[.]webp'));
      const dimensions=await page.getByTestId('workshop-review-static-image')
        .evaluate(async element=>{
          const img=element as HTMLImageElement;
          await img.decode();
          return [img.naturalWidth,img.naturalHeight];
        });
      expect(dimensions).toEqual([512,512]);
    }
  }

  const decoded=await page.getByTestId('workshop-review-static-image').evaluate(async element=>{
    const img=element as HTMLImageElement;
    await img.decode();
    return [img.naturalWidth,img.naturalHeight];
  });
  expect(decoded).toEqual([512,512]);
  await mkdir('visual-evidence/workshop',{recursive:true});
  await page.screenshot({path:'visual-evidence/workshop/desktop-machine-review-inspector-1440.png',animations:'disabled'});
  await expect(page.getByTestId('workshop-review-static-image')).toBeVisible();
  await expect(page.getByTestId('workshop-review-no-atlas')).toBeVisible();
  expect(await page.evaluate(()=>localStorage.getItem('monster-apartment:workshop-v2-lab'))).toBe(before);

  await page.keyboard.press('Escape');
  await expect(dialog).not.toBeVisible();
  await page.setViewportSize({width:390,height:844});
  await launch.click();
  await expect(dialog).toBeVisible();
  await page.screenshot({path:'visual-evidence/workshop/mobile-machine-review-inspector-390.png',animations:'disabled'});
  await page.getByRole('button',{name:'关闭原画审查'}).click();
  await expect(dialog).not.toBeVisible();
  expect(await page.evaluate(()=>localStorage.getItem('monster-apartment:workshop-v2-lab'))).toBe(before);
});


test('cinematic unbuilt machine opens the actual grid without changing saved inventory',async({page})=>{
  test.setTimeout(90_000);
  await page.setViewportSize({width:1440,height:900});
  await page.goto('/workshop/');
  await expect(page.locator('#root')).toHaveAttribute('data-runtime-ready','true',{timeout:35_000});
  const saved=await page.evaluate(()=>localStorage.getItem('monster-apartment:workshop-v2-lab'));
  await expect(page.getByTestId('workshop-stage-composition')).toHaveAttribute('data-view','cinematic');
  const forge=page.getByTestId('workshop-cinematic-machine-kiln');
  await expect(forge).toHaveAttribute('data-plot','unbuilt');
  await forge.click();
  await expect(page.getByTestId('workshop-stage-composition')).toHaveAttribute('data-view','grid');
  await expect(page.getByTestId('v2-next-step')).toContainText('待建造：晶核熔炉');
  expect(await page.evaluate(()=>localStorage.getItem('monster-apartment:workshop-v2-lab'))).toBe(saved);
});


test('desktop cinematic fallback art is legible without enormous card highlights',
  async({page})=>{
  test.setTimeout(90_000);
  await page.setViewportSize({width:1440,height:900});
  await page.goto('/workshop/');
  await expect(page.locator('#root')).toHaveAttribute(
    'data-runtime-ready','true',{timeout:45_000});
  const scene=page.getByTestId('workshop-cinematic-scene');
  await expect(scene).toBeVisible();
  const machines=await page.locator('.workshop-cinematic__station')
    .evaluateAll(items=>items.map(item=>{
      const img=item.querySelector<HTMLImageElement>('.workshop-cinematic__machine-art img');
      const s=getComputedStyle(item);
      return {
        artTier:item.getAttribute('data-art-tier'),
        zoom:img?new DOMMatrix(getComputedStyle(img).transform).a:NaN,
        verticalOffset:img?new DOMMatrix(getComputedStyle(img).transform).f:NaN,
        borderColor:s.borderColor,
        backgroundImage:s.backgroundImage,
        shadow:getComputedStyle(item,'::before').backgroundImage,
      };
    }));
  expect(machines).toHaveLength(3);
  for(const [i,machine] of machines.entries()){
    // Legacy props have uneven transparent margins: align their actual
    // silhouettes towards the same floor rather than moving hit targets.
    if(i<2)expect(machine.verticalOffset).toBeGreaterThan(20);
    else expect(machine.verticalOffset).toBeGreaterThanOrEqual(0);
    // Unreviewed CGs remain gated. Legacy fallback art is not overstretched
    // into a blurry 1.9x hero image and selection is not a giant card border.
    expect(machine.artTier).toBe('legacy');
    expect(machine.zoom).toBeGreaterThanOrEqual(1);
    expect(machine.zoom).toBeLessThanOrEqual(1.35);
    expect(machine.borderColor).toBe('rgba(0, 0, 0, 0)');
    expect(machine.backgroundImage).toBe('none');
    expect(machine.shadow).toContain('radial-gradient');
  }
  await mkdir('visual-evidence/workshop',{recursive:true});
  await page.screenshot({
    path:'visual-evidence/workshop/desktop-workshop-integrated-props-1440.png',
    animations:'disabled',
  });
  const well=page.getByTestId('workshop-cinematic-machine-well');
  await well.click();
  await expect(well).toHaveAttribute('aria-pressed','true');
  await expect(page.getByTestId('workshop-context-panel')).toBeVisible();
  const selectedBorder=await well.evaluate(item=>getComputedStyle(item).borderColor);
  expect(selectedBorder).toBe('rgba(0, 0, 0, 0)');
  // Selection uses a 200ms optical fade; test the settled visible state.
  // Reading in the same animation frame as click only captures a mid-fade
  // number such as 0.21, which is not a visual defect.
  await expect.poll(async()=>Number(await well.evaluate(item=>
    getComputedStyle(item,'::after').opacity
  )),{timeout:5000}).toBeGreaterThan(.9);
  await page.screenshot({
    path:'visual-evidence/workshop/desktop-workshop-selected-prop-1440.png',
    animations:'disabled',
  });
});

// R03/R04: hidden Pixi must stop and panorama must expose each real plot.
test('panorama pauses Pixi and exposes all same-craft machines',async({page})=>{
  test.setTimeout(90_000);
  const seed=newWorkshop();
  seed.tiles[0]={craft:'well',worker:null,stored:0,level:2};
  await page.addInitScript(saved=>{
    window.localStorage.setItem('monster-apartment:workshop-v2-lab',saved);
  },JSON.stringify(seed));
  await page.setViewportSize({width:1440,height:900});
  await page.goto('/workshop/');
  await expect(page.locator('#root')).toHaveAttribute('data-runtime-ready','true',{timeout:30_000});
  const stage=page.getByTestId('v2-stage');
  const view=page.getByTestId('workshop-stage-composition');
  await expect(view).toHaveAttribute('data-view','cinematic');
  await expect(stage).toHaveAttribute('data-presentation-mode','cinematic');
  await expect(stage).toHaveAttribute('data-pixi-ticker','stopped');
  const well=page.getByTestId('workshop-cinematic-machine-well');
  await expect(well).toHaveAttribute('data-plot','0');
  await well.click();
  await expect(page.getByTestId('workshop-cinematic-picker-well')).toBeVisible();
  await page.getByTestId('workshop-cinematic-choice-well-5').click();
  await expect(well).toHaveAttribute('data-plot','5');
  await expect(page.getByTestId('v2-next-step')).toContainText('06 号地块');
  await expect(stage).toHaveAttribute('data-pixi-ticker','stopped');
  await page.getByTestId('workshop-view-grid').click();
  await expect(view).toHaveAttribute('data-view','grid');
  await expect(stage).toHaveAttribute('data-pixi-ticker','running');
  await expect(page.getByTestId('v2-next-step')).toContainText('06 号地块');
  await page.getByTestId('workshop-view-cinematic').click();
  await expect(stage).toHaveAttribute('data-pixi-ticker','stopped');
  expect(await page.evaluate(()=>localStorage.getItem('monster-apartment:workshop-v2-lab')))
    .toBe(JSON.stringify(seed));
});


test('PC selected machine has one contextual path to state and scheduling',async({page})=>{
  test.setTimeout(90_000);
  await page.setViewportSize({width:1440,height:900});
  await page.goto('/workshop/');
  await expect(page.locator('#root')).toHaveAttribute('data-runtime-ready','true',{timeout:30_000});
  const shell=page.getByTestId('next-workshop-shell');
  const well=page.getByTestId('workshop-cinematic-machine-well');
  await expect(shell).toHaveAttribute('data-console-layout','scene');
  await expect(page.getByTestId('console-roster')).toBeHidden();
  await well.click();
  const context=page.getByTestId('workshop-context-panel');
  await expect(context).toBeVisible();
  await expect(context).toContainText('水汽泵');
  await expect(context).toContainText('06');
  await expect(page.getByTestId('v2-salvage')).toHaveCount(1);
  await expect(page.getByTestId('v2-move')).toBeVisible();
  await page.getByTestId('workshop-context-manage').click();
  await expect(shell).toHaveAttribute('data-console-layout','expanded');
  await expect(page.getByTestId('v2-worker-cinder')).toBeVisible();
});

for(const width of [390,360]){
  test('mobile camera has readable plot targets and bounded pan at '+width+'px',async({page})=>{
    test.setTimeout(90_000);
    await page.setViewportSize({width,height:844});
    await page.goto('/workshop/');
    await expect(page.locator('#root')).toHaveAttribute('data-runtime-ready','true',{timeout:30_000});
    const stage=page.getByTestId('v2-stage');
    await expect(stage).toHaveAttribute('data-mobile-camera','pan');
    const metrics=await stage.evaluate(el=>({
      target:Number(el.dataset.plotTargetPx),
      clientWidth:el.clientWidth,
      clientHeight:el.clientHeight,
      scrollWidth:el.scrollWidth,
      scrollHeight:el.scrollHeight,
      pageOverflow:document.documentElement.scrollWidth-innerWidth,
    }));
    expect(metrics.target).toBeGreaterThanOrEqual(70);
    expect(metrics.clientHeight).toBeGreaterThan(220);
    expect(metrics.scrollWidth).toBeGreaterThan(metrics.clientWidth);
    expect(metrics.scrollHeight).toBeGreaterThan(metrics.clientHeight);
    expect(metrics.pageOverflow).toBeLessThanOrEqual(2);
    const before=await page.evaluate(()=>localStorage.getItem('monster-apartment:workshop-v2-lab'));
    await stage.evaluate(el=>{el.scrollLeft=el.scrollWidth;el.scrollTop=el.scrollHeight;});
    await expect.poll(()=>stage.evaluate(el=>el.scrollLeft)).toBeGreaterThan(0);
    expect(await page.evaluate(()=>localStorage.getItem('monster-apartment:workshop-v2-lab'))).toBe(before);
  });
}


// R07.2: stock-only changes patch Text. Staffing changes refresh their
// plot display tree; only global supply/guide transitions repaint the scene.
test('Pixi updates stock labels in place but repaints changed machine state',async({page})=>{
  test.setTimeout(90_000);
  await page.setViewportSize({width:1440,height:900});
  await page.goto('/workshop/');
  const stage=page.getByTestId('v2-stage');
  await expect(page.locator('#root')).toHaveAttribute('data-runtime-ready','true',{timeout:30_000});
  const before=Number(await stage.getAttribute('data-scene-refreshes'));
  await page.evaluate(()=>{
    const key='monster-apartment:workshop-v2-lab';
    const state=JSON.parse(localStorage.getItem(key)!);
    state.tiles[5].stored=4; // inventory only, no staffing/route change
    localStorage.setItem(key,JSON.stringify(state));
    window.dispatchEvent(new Event('moonwork:v2-update'));
  });
  await expect(stage).toHaveAttribute('data-last-stock-plots','5');
  expect(Number(await stage.getAttribute('data-scene-refreshes'))).toBe(before);
  await page.evaluate(()=>{
    const key='monster-apartment:workshop-v2-lab';
    const state=JSON.parse(localStorage.getItem(key)!);
    state.tiles[5].worker='brook'; // machine signal and worker Sprite change
    localStorage.setItem(key,JSON.stringify(state));
    window.dispatchEvent(new Event('moonwork:v2-update'));
  });
  await expect(stage).toHaveAttribute('data-last-patched-plots','5');
  expect(Number(await stage.getAttribute('data-scene-refreshes'))).toBe(before);
  await expect(stage).toHaveAttribute('data-machine-states',/5:working/);
});


// R07.2: Refresh an independent plot's Pixi children, not the scene or
// unrelated machine sprites. Check both the desktop canvas and mobile camera.
for(const viewport of [{width:1440,height:900},{width:390,height:844}]){
  test(`R07.2 changes only one machine display group at ${viewport.width}px`,async({page})=>{
    test.setTimeout(90_000);
    await page.setViewportSize(viewport);
    await page.goto('/workshop/');
    await expect(page.locator('#root'))
      .toHaveAttribute('data-runtime-ready','true',{timeout:30_000});
    const stage=page.getByTestId('v2-stage');
    await expect(stage).toHaveAttribute('data-plot-revisions',/\d+,\d+/);
    const baselineObjects=Number(await stage.getAttribute('data-scene-object-count'));
    const baselineEffects=Number(await stage.getAttribute('data-scene-effect-count'));
    const baselineAnimations=Number(await stage.getAttribute('data-scene-animated-count'));
    expect(baselineObjects).toBeGreaterThan(30);
    await expect(stage).toHaveAttribute('data-scene-plot-container-count','15');
    const refreshes=Number(await stage.getAttribute('data-scene-refreshes'));
    const before=(await stage.getAttribute('data-plot-revisions'))!
      .split(',').map(Number);
    expect(before).toHaveLength(15);
    await page.evaluate(()=>{
      const key='monster-apartment:workshop-v2-lab';
      const state=JSON.parse(localStorage.getItem(key)!);
      state.tiles[5].level=2; // only the water machine's painted body changes
      localStorage.setItem(key,JSON.stringify(state));
      window.dispatchEvent(new Event('moonwork:v2-update'));
    });
    await expect(stage).toHaveAttribute('data-last-patched-plots','5');
    const after=(await stage.getAttribute('data-plot-revisions'))!
      .split(',').map(Number);
    expect(after[5]).toBe(before[5]+1);
    for(let index=0;index<after.length;index++)
      if(index!==5)expect(after[index]).toBe(before[index]);
    expect(Number(await stage.getAttribute('data-scene-refreshes'))).toBe(refreshes);
    await expect(stage).toHaveAttribute('data-machine-states',/5:idle/);
    expect(Number(await stage.getAttribute('data-scene-object-count')))
      .toBeGreaterThanOrEqual(baselineObjects);
    // Return to the original level three times: a recycled plot must not
    // accumulate hidden Pixi children or stale animation/effect callbacks.
    for(let n=0;n<3;n++){
      await page.evaluate(()=>{
        const key='monster-apartment:workshop-v2-lab';
        const state=JSON.parse(localStorage.getItem(key)!);
        // V2 level one is represented by an absent level field.
        delete state.tiles[5].level;
        localStorage.setItem(key,JSON.stringify(state));
        window.dispatchEvent(new Event('moonwork:v2-update'));
      });
      await expect(stage).toHaveAttribute('data-last-patched-plots','5');
      expect(Number(await stage.getAttribute('data-scene-object-count')))
        .toBe(baselineObjects);
      expect(Number(await stage.getAttribute('data-scene-effect-count')))
        .toBe(baselineEffects);
      expect(Number(await stage.getAttribute('data-scene-animated-count')))
        .toBe(baselineAnimations);
      if(n<2)await page.evaluate(()=>{
        const key='monster-apartment:workshop-v2-lab';
        const state=JSON.parse(localStorage.getItem(key)!);
        state.tiles[5].level=2;
        localStorage.setItem(key,JSON.stringify(state));
        window.dispatchEvent(new Event('moonwork:v2-update'));
      });
    }

    // The worker presence row is global on mobile, so it intentionally
    // takes the complete-render fallback; desktop only replaces plot 7.
    await page.evaluate(()=>{
      const key='monster-apartment:workshop-v2-lab';
      const state=JSON.parse(localStorage.getItem(key)!);
      state.tiles[7].worker='fern';
      localStorage.setItem(key,JSON.stringify(state));
      window.dispatchEvent(new Event('moonwork:v2-update'));
    });
    await expect(stage).toHaveAttribute('data-machine-states',/7:blocked/);
    if(viewport.width===1440){
      await expect(stage).toHaveAttribute('data-last-patched-plots','7');
      expect(Number(await stage.getAttribute('data-scene-refreshes'))).toBe(refreshes);
    }else{
      await expect.poll(async()=>Number(
        await stage.getAttribute('data-scene-refreshes'))).toBe(refreshes+1);
    }
  });
}


// R06: Before this consolidation 611-640px had a 182px legacy max-height
// despite reserving 270-345px for the console. Verify the actual pixel box.
test('R06 625px console matches reserved stage clearance',async({page})=>{
  test.setTimeout(90_000);
  await page.setViewportSize({width:625,height:844});
  await page.goto('/workshop/');
  await expect(page.locator('#root')).toHaveAttribute(
    'data-runtime-ready','true',{timeout:30_000});
  await expect(page.getByTestId('v2-shift')).toBeVisible();
  const layout=await page.evaluate(()=>{
    const box=(selector:string)=>document.querySelector<HTMLElement>(selector)!
      .getBoundingClientRect();
    const dock=box('[data-testid="workshop-console"]');
    const scene=box('#root .middle');
    return {consoleHeight:dock.height,gap:dock.top-scene.bottom,
      documentOverflow:document.documentElement.scrollWidth-window.innerWidth};
  });
  expect(layout.consoleHeight).toBeGreaterThan(260);
  expect(layout.consoleHeight).toBeLessThan(346);
  expect(layout.gap).toBeGreaterThanOrEqual(4);
  expect(layout.documentOverflow).toBeLessThanOrEqual(2);
});


// R09: no indefinite telemetry arrays, no frame measurement while the
// cinematic canvas is paused. Only compare measured values for finiteness,
// not synthetic FPS thresholds from variable CI hardware.
test('R09 Pixi samples running grid frames and freezes diagnostics in cinematic mode',async({page})=>{
  test.setTimeout(150_000);
  await page.setViewportSize({width:1440,height:900});
  await page.goto('/workshop/');
  await expect(page.locator('#root')).toHaveAttribute(
    'data-runtime-ready','true',{timeout:30_000});
  const stage=page.getByTestId('v2-stage');
  await expect(stage).toHaveAttribute('data-pixi-ticker','stopped');
  expect(await stage.getAttribute('data-frame-samples')).toBeNull();
  await page.getByTestId('workshop-view-grid').click();
  await expect(stage).toHaveAttribute('data-pixi-ticker','running');
  // Reports publish every 32 samples, one in four Pixi frames (128 frames).
  // Software WebGL on shared CI can exceed 20s for those frames; this is a
  // cadence wait, not an FPS performance gate.
  await expect.poll(async()=>Number(
    await stage.getAttribute('data-frame-samples')),{timeout:60000})
    .toBeGreaterThanOrEqual(32);
  const readings=await stage.evaluate(element=>{
    const keys=['frameSamples','frameWindow','frameIntervalP50Ms',
      'frameIntervalP95Ms','frameUpdateP95Ms','frameUpdateMaxMs'] as const;
    return Object.fromEntries(keys.map(key=>[key,Number(element.dataset[key])]));
  });
  for(const value of Object.values(readings))expect(Number.isFinite(value)).toBe(true);
  expect(readings.frameWindow).toBeLessThanOrEqual(128);
  expect(readings.frameIntervalP95Ms).toBeGreaterThanOrEqual(readings.frameIntervalP50Ms);
  expect(readings.frameUpdateMaxMs).toBeGreaterThanOrEqual(readings.frameUpdateP95Ms);
  await page.getByTestId('workshop-view-cinematic').click();
  await expect(stage).toHaveAttribute('data-pixi-ticker','stopped');
  const stoppedSamples=await stage.getAttribute('data-frame-samples');
  await page.waitForTimeout(350);
  expect(await stage.getAttribute('data-frame-samples')).toBe(stoppedSamples);
});


test('cinematic feedback features actual working equipment before idle high-level art',async({page})=>{
  test.setTimeout(90_000);
  const world=newWorkshop();
  world.tiles[0]={craft:'well',worker:null,stored:9,level:3};
  world.tiles[5]!.worker='brook';
  world.tiles[5]!.stored=4;
  const original=JSON.stringify(world);
  await page.setViewportSize({width:1440,height:900});
  await page.emulateMedia({reducedMotion:'no-preference'});
  await page.addInitScript(saved=>{
    if(!localStorage.getItem('monster-apartment:workshop-v2-lab')){
      localStorage.setItem('monster-apartment:workshop-v2-lab',saved);
    }
  },original);
  await page.goto('/workshop/');
  await expect(page.locator('#root')).toHaveAttribute('data-runtime-ready','true',{timeout:45_000});
  const well=page.getByTestId('workshop-cinematic-machine-well');
  await expect(well).toBeVisible();
  await expect(well).toHaveAttribute('data-plot','5');
  await expect(well).toHaveAttribute('data-state','working');
  await expect(well).toHaveAttribute('data-level','1');
  await expect(page.getByTestId('workshop-cinematic-stock-well')).toContainText('设备暂存 4');
  const halo=well.locator('.workshop-cinematic__station-halo');
  await expect.poll(()=>halo.evaluate(el=>getComputedStyle(el).animationName))
    .toBe('workshop-operating-floor');
  await page.emulateMedia({reducedMotion:'reduce'});
  await expect.poll(()=>halo.evaluate(el=>getComputedStyle(el).animationName))
    .toBe('none');
  await mkdir('visual-evidence/workshop',{recursive:true});
  await page.screenshot({path:'visual-evidence/workshop/desktop-workshop-production-feedback-1440.png',animations:'disabled'});
  expect(await page.evaluate(()=>localStorage.getItem('monster-apartment:workshop-v2-lab')))
    .toBe(original);
});


test('R10.2 shows real linked production and recognizable worker portraits',async({page})=>{
  test.setTimeout(100_000);
  let world=newWorkshop();
  world=moveMachine(world,7,6);
  world=placeMachine(world,7,'kiln');
  world=assignWorker(world,'brook',5);
  world=assignWorker(world,'fern',6);
  world=assignWorker(world,'cinder',7);
  const saved=JSON.stringify(world);
  await page.addInitScript(seed=>{
    if(!localStorage.getItem('monster-apartment:workshop-v2-lab')){
      localStorage.setItem('monster-apartment:workshop-v2-lab',seed);
    }
  },saved);
  await page.setViewportSize({width:1440,height:900});
  await page.emulateMedia({reducedMotion:'no-preference'});
  await page.goto('/workshop/');
  const scene=page.getByTestId('workshop-cinematic-scene');
  await expect(page.locator('#root')).toHaveAttribute('data-runtime-ready','true',{timeout:45_000});
  await expect(scene).toHaveAttribute('data-motion','running');
  await expect(page.getByTestId('workshop-route-water')).toHaveAttribute('data-active','true');
  await expect(page.getByTestId('workshop-route-fiber')).toHaveAttribute('data-active','true');
  for(const craft of ['well','garden','kiln']){
    const worker=page.getByTestId('workshop-cinematic-worker-'+craft);
    await expect(worker).toBeVisible();
    const image=worker.locator('img');
    await expect.poll(()=>image.evaluate(img=>(img as HTMLImageElement).naturalWidth))
      .toBeGreaterThan(0);
    await expect.poll(()=>worker.evaluate(el=>getComputedStyle(el).animationName))
      .toBe('workshop-worker-breathe');
    await expect(page.getByTestId('workshop-cinematic-forecast-'+craft))
      .toContainText('本班预计 +2');
  }
  await expect(page.getByTestId('workshop-cinematic-stock-kiln')).toContainText('晶核直入仓库');
  await page.evaluate(()=>{
    localStorage.setItem('monster-apartment:gothic-motion-reduced','1');
    window.dispatchEvent(new Event('monster-apartment:motion-changed'));
  });
  await expect(scene).toHaveAttribute('data-motion','paused');
  await expect.poll(()=>page.getByTestId('workshop-cinematic-worker-well')
    .evaluate(el=>getComputedStyle(el).animationName)).toBe('none');
  await mkdir('visual-evidence/workshop',{recursive:true});
  await page.screenshot({path:'visual-evidence/workshop/desktop-workshop-worker-production-r102-1440.png',animations:'disabled'});
  expect(await page.evaluate(()=>localStorage.getItem('monster-apartment:workshop-v2-lab')))
    .toBe(saved);
});

test('R10.2 art review can compare existing 512px candidates to fallback without promoting',async({page})=>{
  test.setTimeout(90_000);
  await page.setViewportSize({width:1440,height:900});
  await page.goto('/workshop/');
  await expect(page.locator('#root')).toHaveAttribute('data-runtime-ready','true',{timeout:45_000});
  await expect(page.getByTestId('workshop-art-compare')).toHaveCount(0);
  await page.goto('/workshop/?machine-art=review');
  await expect(page.locator('#root')).toHaveAttribute('data-runtime-ready','true',{timeout:45_000});
  const saved=await page.evaluate(()=>localStorage.getItem('monster-apartment:workshop-v2-lab'));
  const well=page.getByTestId('workshop-cinematic-machine-well');
  const compare=page.getByTestId('workshop-art-compare');
  await expect(compare).toBeVisible();
  await expect(well).toHaveAttribute('data-art-tier','review');
  await page.getByTestId('workshop-art-compare-legacy').click();
  await expect(well).toHaveAttribute('data-art-tier','legacy');
  await page.getByTestId('workshop-art-compare-review').click();
  await expect(well).toHaveAttribute('data-art-tier','review');
  await mkdir('visual-evidence/workshop',{recursive:true});
  await page.screenshot({path:'visual-evidence/workshop/desktop-workshop-review-candidate-r102-1440.png',animations:'disabled'});
  expect(await page.evaluate(()=>localStorage.getItem('monster-apartment:workshop-v2-lab')))
    .toBe(saved);
});


test('R10.3 previews matched painted-light frames without publishing an unapproved atlas',async({page})=>{
  test.setTimeout(100_000);
  await page.setViewportSize({width:1440,height:900});
  await page.emulateMedia({reducedMotion:'no-preference'});
  await page.goto('/workshop/?machine-art=review');
  await expect(page.locator('#root')).toHaveAttribute('data-runtime-ready','true',{timeout:45_000});
  const saved=await page.evaluate(()=>localStorage.getItem('monster-apartment:workshop-v2-lab'));
  await page.getByTestId('workshop-art-review-launcher').click();
  const dialog=page.getByTestId('workshop-art-review-dialog');
  await expect(dialog).toBeVisible();
  // Next's local dev server loads Pixi assets from :3901, while Pages serves
  // them at /workshop/assets/. Infer the root from an actual decoded review
  // still; never assume location.href and asset origin have the same port.
  const still=await page.getByTestId('workshop-review-static-image').getAttribute('src');
  if(!still)throw Error('No candidate still src');
  const assetRoot=still.replace(/review\/machines\/well\/lv2\.webp(?:\?.*)?$/,'');
  const index=await page.evaluate(async root=>{
    const response=await fetch(new URL('machine-art-index.json',root));
    if(!response.ok)throw Error('No review art index at '+root);
    return response.json() as Promise<{
      workers:Record<string,string>;
      working:Record<string,string>;
      reviewWorking:Record<string,string>;
      reviewLightStudies:Record<string,string>;
    }>;
  },assetRoot);
  expect(Object.keys(index.reviewLightStudies).sort()).toEqual(['garden','kiln','well']);
  // Four light-only frames do not become real mechanical animation.
  expect(index.working).toEqual({});
  expect(index.reviewWorking).toEqual({});
  // Three workers still need original transparent full-body drawings.
  expect(index.workers).toEqual({});

  const sheet=await page.evaluate(async root=>{
    const url=new URL('review/machines/well/light-study.webp',root);
    const image=new Image();image.crossOrigin='anonymous';
    image.src=url.href;await image.decode();
    const canvas=document.createElement('canvas');canvas.width=image.naturalWidth;
    canvas.height=image.naturalHeight;
    const g=canvas.getContext('2d')!;
    g.drawImage(image,0,0);
    const pixels=g.getImageData(0,0,canvas.width,canvas.height).data;
    let alphaMismatch=0,rgbChanged=0;
    for(let y=10;y<502;y+=6)for(let x=10;x<502;x+=6){
      const first=(y*2048+x)*4;
      const second=(y*2048+x+1024)*4;
      if(pixels[first+3]!==pixels[second+3])alphaMismatch++;
      if(Math.abs(pixels[first]-pixels[second])+
        Math.abs(pixels[first+1]-pixels[second+1])+
        Math.abs(pixels[first+2]-pixels[second+2])>4)rgbChanged++;
    }
    return {width:image.naturalWidth,height:image.naturalHeight,alphaMismatch,rgbChanged};
  },assetRoot);
  expect(sheet.width).toBe(2048);
  expect(sheet.height).toBe(512);
  expect(sheet.alphaMismatch).toBe(0);
  expect(sheet.rgbChanged).toBeGreaterThan(10);

  await expect(page.getByTestId('workshop-review-working-frame'))
    .toHaveAttribute('data-animation-tier','light-study');
  await expect(dialog).toContainText('非机械动作');
  await page.getByTestId('workshop-review-frame-2').click();
  await expect(page.getByTestId('workshop-review-working-frame'))
    .toHaveAttribute('data-frame','2');
  await mkdir('visual-evidence/workshop',{recursive:true});
  await page.screenshot({
    path:'visual-evidence/workshop/desktop-workshop-painted-light-study-r103-1440.png',
    animations:'disabled'
  });
  await page.emulateMedia({reducedMotion:'reduce'});
  await expect(page.getByTestId('workshop-review-playback')).toBeDisabled();
  expect(await page.evaluate(()=>localStorage.getItem('monster-apartment:workshop-v2-lab')))
    .toBe(saved);
  await page.goto('/workshop/');
  await expect(page.locator('#root')).toHaveAttribute('data-runtime-ready','true',{timeout:45_000});
  await expect(page.getByTestId('workshop-art-review-launcher')).toHaveCount(0);
  await expect(page.getByTestId('v2-stage')).toHaveAttribute('data-machine-working-atlases','0');
  await expect(page.getByTestId('v2-stage')).toHaveAttribute('data-worker-paintings','0');
});


test('R10.4 shows only settled shift output, not a fake effect from page hydration',async({page})=>{
  test.setTimeout(110_000);
  let world=newWorkshop();
  world=moveMachine(world,7,6);
  world=placeMachine(world,7,'kiln');
  world=assignWorker(world,'brook',5);
  world=assignWorker(world,'fern',6);
  world=assignWorker(world,'cinder',7);
  const original=JSON.stringify(world);
  await page.addInitScript(seed=>{
    if(!localStorage.getItem('monster-apartment:workshop-v2-lab'))
      localStorage.setItem('monster-apartment:workshop-v2-lab',seed);
  },original);
  await page.setViewportSize({width:1440,height:900});
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto('/workshop/');
  await expect(page.locator('#root')).toHaveAttribute('data-runtime-ready','true',{timeout:45_000});
  const scene=page.getByTestId('workshop-cinematic-scene');
  await expect(scene).toHaveAttribute('data-motion','paused');
  await expect(page.getByTestId('workshop-shift-output-well')).toHaveCount(0);
  await page.getByTestId('v2-shift').click();
  await expect(page.getByTestId('workshop-cinematic-shift-announcement'))
    .toContainText('第1日生产完成，水汽 2，孢子 2，晶核 2');
  for(const craft of ['well','garden','kiln']){
    await expect(page.getByTestId('workshop-shift-output-'+craft)).toBeVisible();
    await expect(page.getByTestId('workshop-shift-output-'+craft))
      .toContainText((craft==='well'?'水汽':craft==='garden'?'孢子':'晶核')+' +2');
  }
  await mkdir('visual-evidence/workshop',{recursive:true});
  await page.screenshot({
    path:'visual-evidence/workshop/desktop-workshop-real-settlement-r104-1440.png',
    animations:'disabled'
  });
  const persisted=await page.evaluate(()=>{
    return localStorage.getItem('monster-apartment:workshop-v2-lab');
  });
  const snapshot=JSON.parse(persisted!) as {day:number;last:{
    water:number;fiber:number;cores:number
  }};
  expect(snapshot.day).toBe(2);
  expect(snapshot.last).toMatchObject({water:2,fiber:2,cores:2});
  // A reload is NOT a new shift. Rehydrating day 2 must never fabricate
  // another floating reward receipt from the persisted last report.
  await page.reload();
  await expect(page.locator('#root')).toHaveAttribute('data-runtime-ready','true',{timeout:45_000});
  await expect(page.getByTestId('workshop-shift-output-well')).toHaveCount(0);
  await expect(page.getByTestId('workshop-cinematic-shift-announcement')).toBeEmpty();
  expect(await page.evaluate(()=>localStorage.getItem('monster-apartment:workshop-v2-lab')))
    .toBe(persisted);
  // Normal motion is a one-shot Motion transition, not an idle loop.
  await page.emulateMedia({reducedMotion:'no-preference'});
  await expect(scene).toHaveAttribute('data-motion','running');
  await page.getByTestId('v2-shift').click();
  await expect(page.getByTestId('workshop-shift-output-well')).toBeVisible();
  await expect(page.getByTestId('workshop-shift-output-well')).toHaveCount(0,{timeout:12_000});
  const day3=await page.evaluate(()=>{
    const raw=localStorage.getItem('monster-apartment:workshop-v2-lab');
    return raw?JSON.parse(raw).day:null;
  });
  expect(day3).toBe(3);
});


test('R10.5 panorama chooses only approved machine paintings and handles a broken file',async({page})=>{
  test.setTimeout(110_000);
  await page.setViewportSize({width:1440,height:900});
  // Browser-only simulation. Does not change art manifest or promote images.
  await page.route('**/assets/machine-art-index.json',async route=>{
    const response=await route.fetch();
    const index=await response.json() as {machines:Record<string,unknown>};
    index.machines={...index.machines,well:{'1':'production/machines/well/lv1.webp'}};
    await route.fulfill({status:200,contentType:'application/json',
      body:JSON.stringify(index)});
  });
  let servedApprovedImage=0;
  await page.route('**/assets/production/machines/well/lv1.webp',async route=>{
    servedApprovedImage++;
    // The development Pixi asset server publishes the audited 512px review
    // preview, but (correctly) has no production file until human approval.
    // Serve its real decoded 512px bytes at a fake READY path for this test.
    const source=route.request().url().replace(
      '/production/machines/well/lv1.webp',
      '/review/machines/well/lv1.webp'
    );
    const preview=await route.fetch({url:source});
    expect(preview.ok()).toBe(true);
    await route.fulfill({response:preview,contentType:'image/webp'});
  });
  await page.goto('/workshop/');
  await expect(page.locator('#root')).toHaveAttribute('data-runtime-ready','true',{timeout:45_000});
  const well=page.getByTestId('workshop-cinematic-machine-well');
  await expect(well).toHaveAttribute('data-art-tier','ready');
  const image=well.locator('.workshop-cinematic__machine-art img');
  // Distinguish a failure to request READY art from an image decode failure.
  await expect.poll(()=>image.getAttribute('src')).toContain(
    '/assets/production/machines/well/lv1.webp'
  );
  await expect.poll(()=>servedApprovedImage).toBeGreaterThan(0);
  await expect.poll(()=>image.evaluate(el=>(el as HTMLImageElement).naturalWidth),
    {timeout:15000}).toBe(512);
  await expect(page.getByTestId('workshop-cinematic-machine-garden'))
    .toHaveAttribute('data-art-tier','legacy');
  await expect(page.getByTestId('workshop-art-compare')).toHaveCount(0);
  await expect(page.getByTestId('v2-stage')).toHaveAttribute('data-machine-working-atlases','0');

  // A READY index alone must never leave a broken illustration visible.
  await page.route('**/assets/production/machines/well/lv1.webp',route=>
    route.fulfill({status:404,contentType:'text/plain',body:'not found'}));
  await page.reload();
  await expect(page.locator('#root')).toHaveAttribute('data-runtime-ready','true',{timeout:45_000});
  const fallback=page.getByTestId('workshop-cinematic-machine-well');
  await expect(fallback).toHaveAttribute('data-art-tier','legacy',{timeout:15_000});
  expect(await fallback.locator('.workshop-cinematic__machine-art img')
    .evaluate(el=>(el as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
});


test('R10.6 displays independently approved full-body worker art on PC with opt-in review and portrait fallback',async({page})=>{
  test.setTimeout(115_000);
  const world=assignWorker(newWorkshop(),'brook',5);
  const saved=JSON.stringify(world);
  await page.addInitScript(seed=>{
    if(!localStorage.getItem('monster-apartment:workshop-v2-lab'))
      localStorage.setItem('monster-apartment:workshop-v2-lab',seed);
  },saved);
  await page.setViewportSize({width:1440,height:900});
  // A generated transparent canvas is TEST DATA ONLY. It is never committed
  // as a player-facing full-body CG, and never changes review/ready art state.
  const mockBytes=Buffer.from((await page.evaluate(()=>{
    const c=document.createElement('canvas');c.width=512;c.height=768;
    const ctx=c.getContext('2d')!;
    ctx.clearRect(0,0,512,768);
    ctx.fillStyle='#435879';ctx.beginPath();ctx.ellipse(256,112,58,69,0,0,2*Math.PI);ctx.fill();
    ctx.fillStyle='#ac8d72';ctx.fillRect(185,180,140,300);
    ctx.fillStyle='#201a35';ctx.fillRect(198,465,42,250);ctx.fillRect(268,465,42,250);
    return c.toDataURL('image/webp',.9).split(',')[1];
  })),'base64');
  await page.route('**/assets/machine-art-index.json',async route=>{
    const fetched=await route.fetch();
    const index=await fetched.json() as Record<string,unknown>;
    index.workers={brook:'workers/brook.webp'};
    index.reviewWorkers={brook:'review/workers/brook.webp'};
    await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(index)});
  });
  for(const path of ['workers/brook.webp','review/workers/brook.webp']){
    await page.route('**/assets/'+path,route=>
      route.fulfill({body:mockBytes,contentType:'image/webp'}));
  }
  await page.goto('/workshop/');
  await expect(page.locator('#root')).toHaveAttribute('data-runtime-ready','true',{timeout:45_000});
  const worker=page.getByTestId('workshop-cinematic-worker-well');
  const image=page.getByTestId('workshop-cinematic-worker-img-well');
  await expect(worker).toHaveAttribute('data-art-tier','ready');
  await expect.poll(()=>image.evaluate(el=>(el as HTMLImageElement).naturalHeight)).toBe(768);
  await expect(image).toHaveAttribute('src',/\/assets\/workers\/brook\.webp/);
  // This does not bypass Pixi's independently gated full-body picture loader.
  await expect(page.getByTestId('v2-stage')).toHaveAttribute('data-worker-paintings','1');

  await page.goto('/workshop/?machine-art=review');
  await expect(page.locator('#root')).toHaveAttribute('data-runtime-ready','true',{timeout:45_000});
  await expect(worker).toHaveAttribute('data-art-tier','review');
  await expect(image).toHaveAttribute('src',/\/assets\/review\/workers\/brook\.webp/);
  await page.getByTestId('workshop-art-compare-legacy').click();
  await expect(worker).toHaveAttribute('data-art-tier','portrait');
  await expect(image).not.toHaveAttribute('src',/\/review\/workers\//);

  await page.route('**/assets/workers/brook.webp',route=>
    route.fulfill({status:404,body:'not approved',contentType:'text/plain'}));
  await page.goto('/workshop/');
  await expect(page.locator('#root')).toHaveAttribute('data-runtime-ready','true',{timeout:45_000});
  await expect(worker).toHaveAttribute('data-art-tier','portrait',{timeout:15_000});
  expect(await image.evaluate(el=>(el as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
  // The review simulation does not edit inventories, art approval or saves.
  expect(await page.evaluate(()=>localStorage.getItem('monster-apartment:workshop-v2-lab')))
    .toBe(saved);
});


test('R10.7 Moonveil dialogue follows real machine, staff and order state without touching a save',async({page})=>{
  test.setTimeout(100_000);
  const start=newWorkshop();
  await page.addInitScript(seed=>{
    if(!localStorage.getItem('monster-apartment:workshop-v2-lab'))
      localStorage.setItem('monster-apartment:workshop-v2-lab',seed);
  },JSON.stringify(start));
  await page.setViewportSize({width:1440,height:900});
  await page.goto('/workshop/');
  await expect(page.locator('#root')).toHaveAttribute('data-runtime-ready','true',{timeout:45_000});
  const line=page.getByTestId('workshop-yuesha-dialogue');
  const next=page.locator('button.gothic-cameo-bubble');
  // A clickable DOM node alone did not catch the R10.7 cropped-cameo regression.
  // Verify real desktop geometry and the pointer target before advancing dialogue.
  const cameo=page.locator('.gothic-cameo-assistant');
  const frame=page.locator('.gothic-cameo-frame');
  await expect(cameo).toBeVisible();
  await expect(frame).toBeVisible();
  await expect(next).toBeVisible();
  const geometry=await page.evaluate(()=>{
    const portrait=document.querySelector('.gothic-cameo-frame');
    const bubble=document.querySelector('button.gothic-cameo-bubble');
    if(!(portrait instanceof HTMLElement)||!(bubble instanceof HTMLElement))return null;
    const a=portrait.getBoundingClientRect(),b=bubble.getBoundingClientRect();
    const x=b.left+b.width/2,y=b.top+Math.min(b.height/2,20);
    return {
      portraitWidth:a.width,portraitHeight:a.height,
      bubbleWidth:b.width,bubbleHeight:b.height,
      bubbleLeft:b.left,portraitRight:a.right,
      bubbleRight:b.right,bubbleBottom:b.bottom,
      viewportWidth:innerWidth,viewportHeight:innerHeight,
      pointerInside:bubble.contains(document.elementFromPoint(x,y))
    };
  });
  expect(geometry).not.toBeNull();
  expect(geometry!.portraitWidth).toBeGreaterThan(70);
  expect(geometry!.portraitHeight).toBeGreaterThan(120);
  expect(geometry!.bubbleWidth).toBeGreaterThan(150);
  expect(geometry!.bubbleHeight).toBeGreaterThan(20);
  expect(geometry!.bubbleLeft).toBeGreaterThanOrEqual(geometry!.portraitRight-2);
  expect(geometry!.bubbleRight).toBeLessThanOrEqual(geometry!.viewportWidth);
  expect(geometry!.bubbleBottom).toBeLessThanOrEqual(geometry!.viewportHeight);
  expect(geometry!.pointerInside).toBe(true);
  const saved=await page.evaluate(()=>
    localStorage.getItem('monster-apartment:workshop-v2-lab'));
  await expect(line).toHaveAttribute('data-beat-id','welcome');
  await next.click();
  await expect(line).toHaveAttribute('data-beat-id','missing-kiln');
  await expect(line).toContainText('还没有熔炉');
  await next.click();
  await expect(line).toHaveAttribute('data-beat-id','worker-invitation');
  await next.click();
  await expect(line).toHaveAttribute('data-beat-id','contract-countdown');
  await expect(line).toContainText('仓库现有 0 枚');
  // The first short line fitting does not prove that later, longer dialogue
  // remains readable or clickable. Inspect the actual final rendered bubble.
  const finalBubble=await next.evaluate(element=>{
    const rect=element.getBoundingClientRect();
    const style=getComputedStyle(element);
    const pointX=rect.left+rect.width/2;
    const pointY=rect.top+Math.min(rect.height/2,20);
    return {
      width:rect.width,height:rect.height,
      left:rect.left,right:rect.right,top:rect.top,bottom:rect.bottom,
      viewportWidth:innerWidth,viewportHeight:innerHeight,
      overflowY:style.overflowY,
      scrollHeight:element.scrollHeight,clientHeight:element.clientHeight,
      clickable:element.contains(document.elementFromPoint(pointX,pointY))
    };
  });
  expect(finalBubble.width).toBeGreaterThan(150);
  expect(finalBubble.height).toBeGreaterThan(20);
  expect(finalBubble.left).toBeGreaterThanOrEqual(0);
  expect(finalBubble.top).toBeGreaterThanOrEqual(0);
  expect(finalBubble.right).toBeLessThanOrEqual(finalBubble.viewportWidth);
  expect(finalBubble.bottom).toBeLessThanOrEqual(finalBubble.viewportHeight);
  expect(finalBubble.clickable).toBe(true);
  // A long line may scroll within the bubble, but must not be silently clipped.
  expect(finalBubble.scrollHeight<=finalBubble.clientHeight ||
    ['auto','scroll'].includes(finalBubble.overflowY)).toBe(true);
  await mkdir('visual-evidence/workshop',{recursive:true});
  await page.screenshot({
    path:'visual-evidence/workshop/desktop-workshop-true-dialogue-r107-1440.png',
    animations:'disabled'
  });
  expect(await page.evaluate(()=>
    localStorage.getItem('monster-apartment:workshop-v2-lab'))).toBe(saved);
});


test('R10.7 mobile 390x844 workshop remains usable with reduced motion and unchanged save',async({page})=>{
  test.setTimeout(100_000);
  await page.setViewportSize({width:390,height:844});
  await page.emulateMedia({reducedMotion:'reduce'});
  const seed=JSON.stringify(newWorkshop());
  await page.addInitScript(value=>{
    if(!localStorage.getItem('monster-apartment:workshop-v2-lab'))
      localStorage.setItem('monster-apartment:workshop-v2-lab',value);
  },seed);
  await page.goto('/workshop/');
  await expect(page.locator('#root')).toHaveAttribute('data-runtime-ready','true',{timeout:45_000});
  const saved=await page.evaluate(()=>localStorage.getItem('monster-apartment:workshop-v2-lab'));
  const bounds=await page.evaluate(()=>({
    viewport:document.documentElement.clientWidth,
    scroll:document.documentElement.scrollWidth,
    stage:document.querySelector('#root')?.getBoundingClientRect().toJSON()
  }));
  expect(bounds.viewport).toBe(390);
  expect(bounds.scroll).toBeLessThanOrEqual(bounds.viewport+1);
  expect(bounds.stage).toBeTruthy();
  expect(bounds.stage!.width).toBeGreaterThan(250);
  await mkdir('visual-evidence/workshop',{recursive:true});
  await page.screenshot({path:'visual-evidence/workshop/mobile-workshop-reduced-motion-r107-390.png',animations:'disabled'});
  expect(await page.evaluate(()=>localStorage.getItem('monster-apartment:workshop-v2-lab'))).toBe(saved);
});


test('R10.8 workshop production log never fabricates gains before a real shift',async({page})=>{
  test.setTimeout(90000);
  await page.setViewportSize({width:1440,height:900});
  const seed=JSON.stringify(newWorkshop());
  await page.addInitScript(value=>{
    if(!localStorage.getItem('monster-apartment:workshop-v2-lab'))
      localStorage.setItem('monster-apartment:workshop-v2-lab',value);
  },seed);
  await page.goto('/workshop/');
  await expect(page.locator('#root')).toHaveAttribute('data-runtime-ready','true',{timeout:45000});
  await expect(page.getByTestId('workshop-production-log-not-started')).toBeVisible();
  await expect(page.getByTestId('workshop-production-log-not-started'))
    .toContainText('尚未完成生产班次');
  await expect(page.getByTestId('workshop-production-log-list'))
    .not.toContainText('持续光合作用');
  await expect(page.getByTestId('workshop-production-log-list'))
    .not.toContainText('水脉充盈');
  await page.getByTestId('v2-shift').click();
  await expect(page.getByTestId('workshop-production-log-no-output'))
    .toContainText('上一班没有产出');
  await expect(page.getByTestId('workshop-production-log-list'))
    .not.toContainText('实际产出');
  await page.getByRole('button',{name:'产出',exact:true}).click();
  await expect(page.getByTestId('workshop-production-log-empty'))
    .toContainText('没有实际产出');
  const saved=await page.evaluate(()=>
    localStorage.getItem('monster-apartment:workshop-v2-lab'));
  expect(JSON.parse(saved!).day).toBe(2);
  await page.reload();
  await expect(page.locator('#root')).toHaveAttribute('data-runtime-ready','true',{timeout:45000});
  await expect(page.getByTestId('workshop-production-log-no-output')).toBeVisible();
  expect(await page.evaluate(()=>
    localStorage.getItem('monster-apartment:workshop-v2-lab'))).toBe(saved);
});

test('R10.8 workshop production log lists only settled material outputs and honest alarms',async({page})=>{
  test.setTimeout(90000);
  let world=newWorkshop();
  world=moveMachine(world,7,6);
  world=placeMachine(world,7,'kiln');
  world=assignWorker(world,'brook',5);
  world=assignWorker(world,'fern',6);
  world=assignWorker(world,'cinder',7);
  world=runShift(world);
  const seed=JSON.stringify(world);
  await page.addInitScript(value=>{
    if(!localStorage.getItem('monster-apartment:workshop-v2-lab'))
      localStorage.setItem('monster-apartment:workshop-v2-lab',value);
  },seed);
  await page.setViewportSize({width:1440,height:900});
  await page.goto('/workshop/');
  await expect(page.locator('#root')).toHaveAttribute('data-runtime-ready','true',{timeout:45000});
  for(const [id,caption] of [
    ['output-water','实际产出 水汽 ×2'],
    ['output-fiber','实际产出 孢子纤维 ×2'],
    ['output-cores','实际产出 晶核 ×2']
  ]){
    await expect(page.getByTestId('workshop-production-log-'+id)).toContainText(caption);
  }
  await expect(page.getByTestId('workshop-production-log-list'))
    .not.toContainText('缺料告警');
  const saved=await page.evaluate(()=>localStorage.getItem('monster-apartment:workshop-v2-lab'));
  await mkdir('visual-evidence/workshop',{recursive:true});
  await page.screenshot({
    path:'visual-evidence/workshop/desktop-workshop-honest-log-r108-1440.png',
    animations:'disabled'
  });
  expect(await page.evaluate(()=>localStorage.getItem('monster-apartment:workshop-v2-lab')))
    .toBe(saved);
});
