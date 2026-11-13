import {expect,test} from '@playwright/test';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
import {installWorkshopWebGLProbe,WORKSHOP_WEBGL_RESOURCE_NAMES} from
  './helpers/workshop-webgl-probe';
import type {WorkshopWebGLContextReport,WorkshopWebGLProbeReport} from
  './helpers/workshop-webgl-probe';
import {workshopBenchmarkFixture} from '../v2/src/workshop-benchmark-fixtures';
import {navigateScene} from './helpers/scene-navigation';

/** Comparative WebGL allocation API metrics; NOT GPU memory or elapsed GPU time.
 * It lives in a separate, opt-in workflow and never patches a production page.
 * Navigation is client-side so the probe survives real Pixi mount/dispose cycles.
 */
test('R09.5 WebGL resources across repeated workshop mounts and plot changes',
  async({page,context,browser})=>{
  // Dedicated isolated benchmark jobs set this explicitly; normal gameplay
  // E2E must not turn machine-load-sensitive frame sampling into a release gate.
  test.skip(process.env.R09_DIAGNOSTICS !== '1',
    'R09 performance and GPU API diagnostics run in their dedicated workflows');
  test.setTimeout(330_000);
  await page.setViewportSize({width:1440,height:900});
  await page.addInitScript(installWorkshopWebGLProbe);
  await page.addInitScript(saved=>{
    localStorage.setItem('monster-apartment:workshop-v2-lab',saved);
  },JSON.stringify(workshopBenchmarkFixture('dense')));
  const cdp=await context.newCDPSession(page);
  await cdp.send('Performance.enable');
  const heap=async():Promise<number|null>=>{
    try{await cdp.send('HeapProfiler.collectGarbage');}
    catch{return null;}
    const {metrics}=await cdp.send('Performance.getMetrics');
    return metrics.find(x=>x.name==='JSHeapUsedSize')?.value??null;
  };
  const snapshot=async():Promise<WorkshopWebGLProbeReport>=>{
    const report=await page.evaluate(()=>window.__workshopWebGLProbe?.snapshot());
    expect(report,'WebGL probe missing on current page').toBeDefined();
    return report!;
  };
  const live=(report:WorkshopWebGLProbeReport,id:number)=>{
    const item=report.contexts.find(c=>c.id===id);
    expect(item,'Missing historical WebGL context').toBeDefined();
    return item!;
  };
  const validate=(item:WorkshopWebGLContextReport)=>{
    for(const name of WORKSHOP_WEBGL_RESOURCE_NAMES){
      const count=item.resources[name];
      expect(count.created).toBeGreaterThanOrEqual(count.deleted);
      expect(count.live).toBe(count.created-count.deleted);
      expect(count.highWater).toBeGreaterThanOrEqual(count.live);
    }
  };
  type Cycle={
    cycle:number;contextId:number;webglVersion:number;
    initial:WorkshopWebGLContextReport;
    after16:WorkshopWebGLContextReport;
    afterExit:WorkshopWebGLContextReport;
    frameSamples:number;sceneObjects:number;
    heapAfterExitBytes:number|null;
  };
  const records:Cycle[]=[];
  let firstOrigin:number|null=null;
  await page.goto('/workshop/');
  for(let cycle=0;cycle<3;cycle++){
    if(cycle>0)await navigateScene(page,'/workshop/');
    await expect(page.locator('#root')).toHaveAttribute(
      'data-runtime-ready','true',{timeout:60_000});
    const root=page.getByTestId('v2-stage');
    await expect(root).toHaveAttribute('data-scene-plot-container-count','15');
    if(firstOrigin===null)firstOrigin=await page.evaluate(()=>performance.timeOrigin);
    else expect(await page.evaluate(()=>performance.timeOrigin)).toBe(firstOrigin);
    await page.getByTestId('workshop-view-grid').click();
    await expect(root).toHaveAttribute('data-pixi-ticker','running');
    const stageBaseline=Number(await root.getAttribute('data-scene-object-count'));
    await expect.poll(async()=>Number(
      await root.getAttribute('data-frame-samples')),{timeout:40_000})
      .toBeGreaterThanOrEqual(32);
    const before=await snapshot();
    const active=before.contexts.filter(item=>item.connected&&!item.lost);
    expect(active.length,'Workshop should mount an active WebGL canvas')
      .toBeGreaterThan(0);
    const initial=active[active.length-1];
    validate(initial);
    expect(WORKSHOP_WEBGL_RESOURCE_NAMES.some(
      name=>initial.resources[name].created>0)).toBe(true);
    const initialRefreshes=Number(await root.getAttribute('data-scene-refreshes'));
    // 8 up/down pairs in the same plot (and 3 real mount/unmount cycles).
    // No arbitrary GPU memory / frame-time failure thresholds.
    for(let turn=0;turn<16;turn++){
      const last=Number((await root.getAttribute('data-plot-revisions'))!
        .split(',')[14]);
      await page.evaluate(upgraded=>{
        const key='monster-apartment:workshop-v2-lab';
        const state=JSON.parse(localStorage.getItem(key)!);
        if(upgraded)state.tiles[14].level=2;
        else delete state.tiles[14].level;
        localStorage.setItem(key,JSON.stringify(state));
        window.dispatchEvent(new Event('moonwork:v2-update'));
      },turn%2===0);
      await expect.poll(async()=>Number(
        (await root.getAttribute('data-plot-revisions'))!.split(',')[14]
      ),{timeout:15_000}).toBe(last+1);
    }
    // Ensure the renderer has had a chance to submit updated geometry.
    await page.evaluate(()=>new Promise<void>(resolve=>
      requestAnimationFrame(()=>requestAnimationFrame(()=>resolve()))));
    const after=live(await snapshot(),initial.id);
    validate(after);
    expect(Number(await root.getAttribute('data-scene-object-count')))
      .toBe(stageBaseline);
    expect(Number(await root.getAttribute('data-scene-refreshes')))
      .toBe(initialRefreshes);
    expect(after.drawCalls).toBeGreaterThan(initial.drawCalls);
    const frameSamples=Number(await root.getAttribute('data-frame-samples'));
    await page.getByTestId('workshop-view-cinematic').click();
    await expect(root).toHaveAttribute('data-pixi-ticker','stopped');
    await navigateScene(page,'/town/');
    await expect(page.getByTestId('v2-stage')).toHaveCount(0);
    const exited=live(await snapshot(),initial.id);
    validate(exited);
    expect(exited.connected).toBe(false);
    const record:Cycle={
      cycle:cycle+1,contextId:initial.id,webglVersion:initial.webglVersion,
      initial,after16:after,afterExit:exited,
      frameSamples,
      sceneObjects:stageBaseline,heapAfterExitBytes:await heap(),
    };
    records.push(record);
    console.log('R09_WEBGL_CYCLE '+JSON.stringify(record));
  }
  expect(new Set(records.map(record=>record.contextId)).size).toBe(3);
  const dir='visual-evidence/performance';
  await mkdir(dir,{recursive:true});
  const report={
    schema:1,measuredAt:new Date().toISOString(),browser:browser.version(),
    methodology:'WebGL API create/delete and draw* calls captured in isolated Chromium via prototype wrappers using WeakMap identities; 3 client-side mount/unmounts, 16 single-plot revisions per mount. Detached canvas resources may be released by browser without explicit delete* calls; NOT GPU bytes, GPU duration or proof of a leak.',
    cycles:records,
  };
  await writeFile(dir+'/workshop-r09-webgl-lifecycle.json',
    JSON.stringify(report,null,2)+'\n','utf8');
  const names=WORKSHOP_WEBGL_RESOURCE_NAMES;
  const lines=[
    '# Workshop R09.5 WebGL resource lifecycle (comparative CI diagnostics)',
    '',
    'Counters are WebGL API calls only. They do not measure GPU memory, driver allocations, or GPU time.',
    '',
    '| Mount | Context | Pixi nodes | '+names.map(x=>x+' live: start→16').join(' | ')+' | Draw calls Δ |',
    '| ---: | ---: | ---: | '+names.map(()=>'---:').join(' | ')+' | ---: |',
    ...records.map(r=>['| '+r.cycle,r.contextId,r.sceneObjects,
      ...names.map(n=>r.initial.resources[n].live+'→'+r.after16.resources[n].live),
      r.after16.drawCalls-r.initial.drawCalls].join(' | ')+' |'),
    '',
    'Disconnected canvas contexts are intentionally tracked historically, but their resource counters should not be interpreted as still-resident GPU allocations.',
  ];
  await writeFile(dir+'/workshop-r09-webgl-lifecycle.md',
    lines.join('\n')+'\n','utf8');
  expect(JSON.parse(await readFile(
    dir+'/workshop-r09-webgl-lifecycle.json','utf8')))
    .toMatchObject({schema:1});
  await cdp.detach();
});
