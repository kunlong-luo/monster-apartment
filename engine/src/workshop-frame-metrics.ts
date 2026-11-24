/** Bounded, non-visual diagnostics for the workshop's Pixi ticker.
 * Supply raw, uncapped Ticker.elapsedMS, never clamped Ticker.deltaMS.
 * Frame interval includes browser scheduling; callback time measures only
 * this workshop update callback, not rendering or GPU cost. */
export type WorkshopFrameReport=Readonly<{
  totalSamples:number;
  windowSamples:number;
  intervalP50Ms:number;
  intervalP95Ms:number;
  updateP95Ms:number;
  updateMaxMs:number;
}>;

/** Collect at most `capacity` samples, emitting every `reportEvery` accepts.
 * Callers should sample only every fourth ticker frame to limit overhead.
 * Invalid/negative readings are ignored; retained arrays never grow. */
export function createWorkshopFrameMeter(capacity=128,reportEvery=32){
  if(!Number.isSafeInteger(capacity)||capacity<1||
     !Number.isSafeInteger(reportEvery)||reportEvery<1)
    throw new RangeError('Frame meter sizes must be positive integers');
  const intervals:number[]=[];
  const updates:number[]=[];
  let total=0;
  let next=0;
  const percentile=(sorted:readonly number[],fraction:number)=>
    sorted[Math.max(0,Math.ceil(sorted.length*fraction)-1)];
  const round=(value:number)=>Math.round(value*100)/100;
  const sample=(intervalMs:number,updateMs:number):WorkshopFrameReport|null=>{
    if(!Number.isFinite(intervalMs)||!Number.isFinite(updateMs)||
       intervalMs<0||updateMs<0)return null;
    if(intervals.length<capacity){
      intervals.push(intervalMs);updates.push(updateMs);
    }else{
      intervals[next]=intervalMs;updates[next]=updateMs;
    }
    next=(next+1)%capacity;
    total++;
    if(total%reportEvery!==0)return null;
    const time=intervals.slice().sort((a,b)=>a-b);
    const work=updates.slice().sort((a,b)=>a-b);
    return {
      totalSamples:total,
      windowSamples:time.length,
      intervalP50Ms:round(percentile(time,.50)),
      intervalP95Ms:round(percentile(time,.95)),
      updateP95Ms:round(percentile(work,.95)),
      updateMaxMs:round(work[work.length-1]),
    };
  };
  return {sample};
}
