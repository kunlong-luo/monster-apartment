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
  /** Post-GC JS heap after the first 12 display-tree mutations. */
  jsHeapAfterBytes:number|null;
  jsHeapDeltaBytes:number|null;
  /** Post-GC JS heap after all 48 mutations (plateau vs growth check). */
  jsHeapAfter48Bytes:number|null;
  jsHeapDelta48Bytes:number|null;
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
      let heapAfter12:number|null=null;
      if(index>=0){
        // 48 single-plot swaps (24 level-2 / level-1 cycles); collect a
        // post-GC checkpoint at 12 to distinguish warmup from steady growth.
        // Each revision is awaited so updates cannot silently be skipped.
        for(let turn=0;turn<48;turn++){
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
          if(turn===11)heapAfter12=await heapAfterGC();
        }
        await expect(stage).toHaveAttribute('data-scene-plot-container-count','15');
        expect(Number(await stage.getAttribute('data-scene-object-count')))
          .toBe(objectsBefore);
      }
      if(index<0)heapAfter12=await heapAfterGC();
      const heapAfter48=await heapAfterGC();
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
        jsHeapAfterBytes:heapAfter12,
        jsHeapDeltaBytes:heapBefore===null||heapAfter12===null?null:Math.round(heapAfter12-heapBefore),
        jsHeapAfter48Bytes:heapAfter48,
        jsHeapDelta48Bytes:heapBefore===null||heapAfter48===null?null:Math.round(heapAfter48-heapBefore),
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
  const report={schema:2,measuredAt:new Date().toISOString(),
    browser:browser.version(),viewport:{width:1440,height:900},
    methodology:'32 sampled uncapped Pixi ticker.elapsedMS values per fixture, one in four frames; post-GC JS heap checkpoints at 0/12/48 plot mutations. No GPU memory or draw-call measurement.',
    cases:records};
  await writeFile(dir+'/workshop-r09-baseline.json',
    JSON.stringify(report,null,2)+'\n','utf8');
  const table=[
    '# Workshop R09 performance comparison',
    '',
    'CI data is comparative only; readings are not a device-level FPS or GPU benchmark.',
    '',
    '| Machines | Objects | Effects | Actors | Raw frame interval p95 (ms) | Workshop update p95 (ms) | JS heap Δ12 (MiB) | JS heap Δ48 (MiB) |',
    '| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |',
    ...records.map(x=>`| ${x.machineCount} | ${x.sceneObjects} | ${x.sceneEffects} | ${x.sceneAnimations} | ${x.frameIntervalP95Ms} | ${x.workshopUpdateP95Ms} | ${x.jsHeapDeltaBytes===null?'n/a':(x.jsHeapDeltaBytes/1024/1024).toFixed(2)} | ${x.jsHeapDelta48Bytes===null?'n/a':(x.jsHeapDelta48Bytes/1024/1024).toFixed(2)} |`),
    '',
    'Heap deltas are Chromium page JS heap after optional GC around 12 and 48 repeated plot refreshes, not GPU memory or conclusive leak detection.',
  ].join('\n');
  await writeFile(dir+'/workshop-r09-baseline.md',table+'\n','utf8');
  console.log('R09_PERF_SUMMARY '+JSON.stringify(records.map(
    ({profile,machineCount,sceneObjects,frameIntervalP95Ms,workshopUpdateP95Ms,jsHeapDeltaBytes,jsHeapDelta48Bytes})=>
      ({profile,machineCount,sceneObjects,frameIntervalP95Ms,workshopUpdateP95Ms,jsHeapDeltaBytes,jsHeapDelta48Bytes})
  )));
});
