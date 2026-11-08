import {expect,test} from '@playwright/test';
import {mkdir,writeFile} from 'node:fs/promises';
import {workshopBenchmarkFixture,WORKSHOP_BENCHMARK_PROFILES} from '../v2/src/workshop-benchmark-fixtures';
import type {WorkshopBenchmarkProfile} from '../v2/src/workshop-benchmark-fixtures';

type PerfRecord={
  profile:WorkshopBenchmarkProfile;
  machineCount:number;
  sceneObjects:number;
  sceneEffects:number;
  sceneAnimations:number;
  frameIntervalP50Ms:number;
  frameIntervalP95Ms:number;
  workshopUpdateP95Ms:number;
  workshopUpdateMaxMs:number;
  sampleCount:number;
  jsHeapBeforeBytes:number|null;
  jsHeapAfterBytes:number|null;
  jsHeapDeltaBytes:number|null;
  sceneObjectsAfterCycles:number;
  sceneRefreshesDuringCycles:number;
};

test('R09 fixed-save 0/2/15-machine browser performance baseline',async({context,browser})=>{
  test.setTimeout(240_000);
  const records:PerfRecord[]=[];
  for(const profile of WORKSHOP_BENCHMARK_PROFILES){
    const fixture=workshopBenchmarkFixture(profile);
    const machineCount=fixture.tiles.filter(Boolean).length;
    const page=await context.newPage();
    await page.setViewportSize({width:1440,height:900});
    await page.addInitScript(saved=>{
      localStorage.setItem('monster-apartment:workshop-v2-lab',saved);
    },JSON.stringify(fixture));
    try{
      await page.goto('/workshop/');
      await expect(page.locator('#root')).toHaveAttribute(
        'data-runtime-ready','true',{timeout:45_000});
      const stage=page.getByTestId('v2-stage');
      await expect(stage).toHaveAttribute('data-scene-plot-container-count','15');
      await expect(stage).toHaveAttribute('data-pixi-ticker','stopped');
      const cdp=await context.newCDPSession(page);
      await cdp.send('Performance.enable');
      const heapAfterGC=async():Promise<number|null>=>{
        try{await cdp.send('HeapProfiler.collectGarbage');}catch{return null;}
        const {metrics}=await cdp.send('Performance.getMetrics');
        return metrics.find(entry=>entry.name==='JSHeapUsedSize')?.value??null;
      };
      await page.getByTestId('workshop-view-grid').click();
      await expect(stage).toHaveAttribute('data-pixi-ticker','running');
      // 32 published samples = ~128 Pixi frames. Never compare CI p95
      // against a hard-coded target: CPU/GPU contention varies by runner.
      await expect.poll(async()=>Number(
        await stage.getAttribute('data-frame-samples')),{timeout:40_000})
        .toBeGreaterThanOrEqual(32);
      const reading=await stage.evaluate(element=>{
        const n=(key:string)=>Number(element.dataset[key]);
        return {
          sceneObjects:n('sceneObjectCount'),
          sceneEffects:n('sceneEffectCount'),
          sceneAnimations:n('sceneAnimatedCount'),
          frameIntervalP50Ms:n('frameIntervalP50Ms'),
          frameIntervalP95Ms:n('frameIntervalP95Ms'),
          workshopUpdateP95Ms:n('frameUpdateP95Ms'),
          workshopUpdateMaxMs:n('frameUpdateMaxMs'),
          sampleCount:n('frameSamples'),
          sceneRefreshes:n('sceneRefreshes'),
        };
      });
      expect(reading.sceneObjects).toBeGreaterThan(15);
      expect(reading.frameIntervalP95Ms).toBeGreaterThanOrEqual(
        reading.frameIntervalP50Ms);
      expect(reading.workshopUpdateMaxMs).toBeGreaterThanOrEqual(
        reading.workshopUpdateP95Ms);
      const heapBefore=await heapAfterGC();
      const index=profile==='starter'?5:profile==='dense'?14:-1;
      const objectsBefore=reading.sceneObjects;
      if(index>=0){
        // 12 single-plot swaps (six level-2 / level-1 cycles), each awaited
        // via the revision counter so updates cannot silently be skipped.
        for(let turn=0;turn<12;turn++){
          const oldRevisions=(await stage.getAttribute('data-plot-revisions'))!
            .split(',').map(Number);
          await page.evaluate(({index,upgraded})=>{
            const key='monster-apartment:workshop-v2-lab';
            const value=JSON.parse(localStorage.getItem(key)!);
            if(upgraded)value.tiles[index].level=2;
            else delete value.tiles[index].level;
            localStorage.setItem(key,JSON.stringify(value));
            window.dispatchEvent(new Event('moonwork:v2-update'));
          },{index,upgraded:turn%2===0});
          await expect.poll(async()=>{
            const revisions=(await stage.getAttribute('data-plot-revisions'))!
              .split(',').map(Number);
            return revisions[index];
          },{timeout:10_000}).toBe(oldRevisions[index]+1);
        }
        await expect(stage).toHaveAttribute('data-scene-plot-container-count','15');
        expect(Number(await stage.getAttribute('data-scene-object-count')))
          .toBe(objectsBefore);
      }
      const heapAfter=await heapAfterGC();
      const objectsAfter=Number(await stage.getAttribute('data-scene-object-count'));
      const sceneRefreshesAfter=Number(await stage.getAttribute('data-scene-refreshes'));
      const record:PerfRecord={
        profile,machineCount,
        sceneObjects:reading.sceneObjects,
        sceneEffects:reading.sceneEffects,
        sceneAnimations:reading.sceneAnimations,
        frameIntervalP50Ms:reading.frameIntervalP50Ms,
        frameIntervalP95Ms:reading.frameIntervalP95Ms,
        workshopUpdateP95Ms:reading.workshopUpdateP95Ms,
        workshopUpdateMaxMs:reading.workshopUpdateMaxMs,
        sampleCount:reading.sampleCount,
        jsHeapBeforeBytes:heapBefore,
        jsHeapAfterBytes:heapAfter,
        jsHeapDeltaBytes:heapBefore===null||heapAfter===null?null:Math.round(heapAfter-heapBefore),
        sceneObjectsAfterCycles:objectsAfter,
        sceneRefreshesDuringCycles:sceneRefreshesAfter-reading.sceneRefreshes,
      };
      records.push(record);
      console.log('R09_PERF_RECORD '+JSON.stringify(record));
      await cdp.detach();
    }finally{await page.close();}
  }
  expect(records.map(row=>row.machineCount)).toEqual([0,2,15]);
  const dir='visual-evidence/performance';
  await mkdir(dir,{recursive:true});
  const report={schema:1,measuredAt:new Date().toISOString(),
    browser:browser.version(),viewport:{width:1440,height:900},
    methodology:'32 sampled ticker updates per fixture, one in four frames; GC around cycle measurement when CDP supports it. No GPU memory or draw-call measurement.',
    cases:records};
  await writeFile(dir+'/workshop-r09-baseline.json',
    JSON.stringify(report,null,2)+'\n','utf8');
  const table=[
    '# Workshop R09 performance comparison',
    '',
    'CI data is comparative only; readings are not a device-level FPS or GPU benchmark.',
    '',
    '| Machines | Objects | Effects | Actors | Frame p95 (ms) | Workshop update p95 (ms) | JS heap delta (MiB) |',
    '| ---: | ---: | ---: | ---: | ---: | ---: | ---: |',
    ...records.map(x=>`| ${x.machineCount} | ${x.sceneObjects} | ${x.sceneEffects} | ${x.sceneAnimations} | ${x.frameIntervalP95Ms} | ${x.workshopUpdateP95Ms} | ${x.jsHeapDeltaBytes===null?'n/a':(x.jsHeapDeltaBytes/1024/1024).toFixed(2)} |`),
    '',
    'Heap delta is Chromium page JS heap after optional GC around repeated plot refreshes, not GPU memory or a controlled leak test.',
  ].join('\n');
  await writeFile(dir+'/workshop-r09-baseline.md',table+'\n','utf8');
  console.log('R09_PERF_SUMMARY '+JSON.stringify(records.map(
    ({profile,machineCount,sceneObjects,frameIntervalP95Ms,workshopUpdateP95Ms,jsHeapDeltaBytes})=>
      ({profile,machineCount,sceneObjects,frameIntervalP95Ms,workshopUpdateP95Ms,jsHeapDeltaBytes})
  )));
});
