import {assignWorker,moveMachine,newWorkshop,placeMachine} from '../v2/src/workshop-engine';
import {test,expect} from '@playwright/test';

test('mobile workshop machine states follow real staffing and supply',async({page})=>{
  test.setTimeout(90_000);
  await page.setViewportSize({width:390,height:844});
  await page.goto('/workshop/');
  const stage=page.getByTestId('v2-stage');
  const canvas=stage.locator('canvas');
  await expect(canvas).toBeVisible({timeout:25_000});
  await expect(stage).toHaveAttribute('data-machine-states',/5:idle;7:idle/);
  await expect(stage).toHaveAttribute('data-worker-art','hi-dpi-transparent-humanoid');

  await page.getByTestId('v2-worker-fern').click();
  const box=await canvas.boundingBox();
  expect(box).not.toBeNull();
  // On phones the Pixi stage uses a fixed 830x820 logical scene.
  await canvas.click({position:{
    x:(15+2*160+73)/830*box!.width,
    y:(225+160+73)/820*box!.height,
  }});
  await expect(stage).toHaveAttribute('data-machine-states',/7:blocked/);
  await expect(page.getByTestId('v2-status')).toContainText('已派往');

  // Compact launcher must not obstruct the scene's real factory actions.
  const layout=await page.evaluate(()=>{
    const consoleBox=document.querySelector('#root .console')!.getBoundingClientRect();
    const nav=document.querySelector('[data-testid="scene-navigation"]')!.getBoundingClientRect();
    const rail=document.querySelector('#root .middle')!.getBoundingClientRect();
    return {navWidth:nav.width,railBottom:rail.bottom,consoleTop:consoleBox.top,
      consoleWidth:consoleBox.width,viewport:window.innerWidth};
  });
  expect(layout.navWidth).toBeLessThan(190);
  expect(layout.railBottom).toBeLessThanOrEqual(layout.consoleTop+2);
  expect(layout.consoleWidth).toBeLessThan(layout.viewport);
});

test('world buttons and headings remain in their panels on a narrow phone',async({page})=>{
  test.setTimeout(90_000);
  await page.setViewportSize({width:320,height:700});
  await page.goto('/town/');
  await expect(page.getByTestId('moonlit-town-scene')).toBeVisible();
  const launcher=page.getByTestId('scene-navigation');
  await expect(launcher).toBeVisible();
  await expect(page.getByRole('navigation',{name:'月光工坊世界'})).toHaveCount(0);
  const launcherBounds=await launcher.boundingBox();
  expect(launcherBounds).not.toBeNull();
  expect(launcherBounds!.x).toBeGreaterThanOrEqual(-1);
  expect(launcherBounds!.x+launcherBounds!.width).toBeLessThanOrEqual(321);
  const positions=await page.locator('.mw-town-portal').evaluateAll(anchors=>
    anchors.map(node=>{
      const rect=node.getBoundingClientRect();
      const title=node.querySelector('strong')!.getBoundingClientRect();
      return {left:rect.left,right:rect.right,titleLeft:title.left,titleRight:title.right};
    }));
  expect(positions).toHaveLength(3);
  for(const p of positions){
    expect(p.titleLeft).toBeGreaterThanOrEqual(p.left-2);
    expect(p.titleRight).toBeLessThanOrEqual(p.right+2);
    expect(p.right).toBeLessThanOrEqual(320);
  }
});

test('three adult heroine portraits are distinct and gallery uses real WebP imagery',async({page})=>{
  test.setTimeout(90_000);
  await page.goto('/characters/');
  await expect(page.getByTestId('painted-worker-gallery')).toBeVisible();
  for(const id of ['brook','fern','cinder'] as const){
    const card=page.getByTestId('worker-card-'+id);
    const photo=card.locator('img.cg-card__image');
    await expect(card).toHaveAttribute('data-art-layout',/portrait|figure/);
    await expect(photo).toBeVisible();
    await expect.poll(()=>photo.evaluate(img=>(img as HTMLImageElement).naturalWidth))
      .toBeGreaterThan(0);
    await expect(photo).toHaveAttribute('alt',/人物肖像/);
  }
  // V3.90 A05 has independent reliable portrait images. Verify their decoded
  // sources and identity rather than old removed mw-worker-portrait nodes.
  const urls=await page.locator('[data-testid^="worker-card-"] img.cg-card__image')
    .evaluateAll(nodes=>nodes.map(node=>(node as HTMLImageElement).currentSrc));
  expect(urls).toHaveLength(3);
  expect(new Set(urls).size).toBe(3);
  await page.getByRole('button',{name:/选择泉泡/}).click();
  await page.getByRole('tab',{name:'养成'}).click();
  await page.getByRole('link',{name:'安排泉泡到工坊'}).click();
  await expect(page.getByTestId('v2-stage').locator('canvas')).toBeVisible({timeout:25_000});
  await expect(page.getByTestId('v2-stage'))
    .toHaveAttribute('data-worker-art','hi-dpi-transparent-humanoid');
});

test('daily output visuals use exact machine and input source, not fabricated totals',async({page})=>{
  test.setTimeout(90_000);
  let world=newWorkshop();
  world=assignWorker(world,'brook',5);
  world=assignWorker(world,'fern',7);
  world=moveMachine(world,7,6);
  world=placeMachine(world,7,'kiln');
  world=assignWorker(world,'cinder',7);
  await page.addInitScript(seed=>{
    const key='monster-apartment:workshop-v2-lab';
    if(!localStorage.getItem(key))localStorage.setItem(key,JSON.stringify(seed));
  },world);
  await page.goto('/workshop/');
  const stage=page.getByTestId('v2-stage');
  await expect(stage.locator('canvas')).toBeVisible({timeout:25_000});
  await expect(stage).toHaveAttribute('data-machine-states',/5:working;6:working;7:working/);
  await page.getByTestId('v2-shift').click();
  await expect(stage).toHaveAttribute('data-last-shift-output','5:well:2;6:garden:2;7:kiln:2');
  await expect(stage).toHaveAttribute('data-last-shift-inputs','5>6:1;6>7:2');
  await expect(stage).toHaveAttribute('data-device-phase-events','5:output;6:output;7:output');
  await expect(page.getByTestId('v2-day')).toHaveText('2');
  await page.reload();
  await expect(stage.locator('canvas')).toBeVisible({timeout:25_000});
  await expect(stage).not.toHaveAttribute('data-last-shift-output',/./);
  await expect(page.getByTestId('v2-day')).toHaveText('2');
});
