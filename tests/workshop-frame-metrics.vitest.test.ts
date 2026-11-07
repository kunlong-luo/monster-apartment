import {describe,it,expect} from 'vitest';
import {createWorkshopFrameMeter} from '../v2/src/workshop-frame-metrics';

describe('R09 bounded Pixi ticker diagnostics',()=>{
  it('publishes only after enough accepted samples and rounds percentiles',()=>{
    const meter=createWorkshopFrameMeter(4,4);
    expect(meter.sample(16,2)).toBeNull();
    expect(meter.sample(17,3)).toBeNull();
    expect(meter.sample(18,4)).toBeNull();
    expect(meter.sample(30,8)).toEqual({
      totalSamples:4,windowSamples:4,
      intervalP50Ms:17,intervalP95Ms:30,
      updateP95Ms:8,updateMaxMs:8,
    });
  });
  it('retains only the last window, never accumulates readings indefinitely',()=>{
    const meter=createWorkshopFrameMeter(4,2);
    for(let i=0;i<98;i++)meter.sample(120,20);
    expect(meter.sample(8,1)).toBeNull();
    const report=meter.sample(10,2);
    expect(report).toMatchObject({
      totalSamples:100,windowSamples:4,
      intervalP95Ms:120,updateP95Ms:20,
    });
    expect(meter.sample(8,1)).toBeNull();
    expect(meter.sample(9,1)).toMatchObject({totalSamples:102,windowSamples:4});
    expect(meter.sample(10,1)).toBeNull();
    expect(meter.sample(11,1)).toMatchObject({
      totalSamples:104,windowSamples:4,
      intervalP95Ms:11,updateP95Ms:1,updateMaxMs:1,
    });
  });
  it('rejects invalid readings without consuming a slot',()=>{
    const meter=createWorkshopFrameMeter(2,2);
    expect(meter.sample(Number.NaN,1)).toBeNull();
    expect(meter.sample(16,-1)).toBeNull();
    expect(meter.sample(Infinity,3)).toBeNull();
    expect(meter.sample(12,1)).toBeNull();
    expect(meter.sample(14,2)).toMatchObject({
      totalSamples:2,windowSamples:2,intervalP95Ms:14,updateP95Ms:2,
    });
    expect(()=>createWorkshopFrameMeter(0,2)).toThrow(RangeError);
    expect(()=>createWorkshopFrameMeter(2,0)).toThrow(RangeError);
  });
});
