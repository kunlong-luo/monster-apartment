/** Compact, comparable class census from a Chrome/V8 heap snapshot.
 * Self size is a shallow V8 heap size, NOT retained size or WebGL memory. */
export type HeapClass={
  key:string;type:string;name:string;count:number;shallowBytes:number;
};
export type WorkshopHeapCensus={
  totalNodes:number;totalShallowBytes:number;classes:HeapClass[];
};
export type HeapClassDelta={
  key:string;beforeCount:number;afterCount:number;
  countDelta:number;shallowBytesDelta:number;
};

type SnapshotLike={
  snapshot:{meta:{node_fields:string[];node_types:unknown[]}};
  nodes:number[];strings:string[];
};

export function summarizeWorkshopHeap(snapshot:SnapshotLike):WorkshopHeapCensus{
  const {node_fields,node_types}=snapshot.snapshot.meta;
  const width=node_fields.length;
  const typeOffset=node_fields.indexOf('type');
  const nameOffset=node_fields.indexOf('name');
  const sizeOffset=node_fields.indexOf('self_size');
  const types=node_types[typeOffset];
  if(!width||typeOffset<0||nameOffset<0||sizeOffset<0||
    !Array.isArray(types)||snapshot.nodes.length%width!==0)
    throw Error('Unexpected V8 heap snapshot node schema');
  const summary=new Map<string,HeapClass>();
  let totalBytes=0;
  for(let i=0;i<snapshot.nodes.length;i+=width){
    const type=String(types[snapshot.nodes[i+typeOffset]]??'unknown');
    const name=snapshot.strings[snapshot.nodes[i+nameOffset]]??'';
    const shallowBytes=snapshot.nodes[i+sizeOffset];
    if(!Number.isFinite(shallowBytes)||shallowBytes<0)
      throw Error('Invalid V8 heap snapshot node size');
    totalBytes+=shallowBytes;
    // Strings vary by content: one aggregated key avoids reporting player
    // strings or accidentally exposing any private text in class names.
    const publicName=type==='string'||type==='concatenated string'||
      type==='sliced string'?'<string>':name;
    const key=type+':'+publicName;
    const entry=summary.get(key);
    if(entry){
      entry.count++;
      entry.shallowBytes+=shallowBytes;
    }else summary.set(key,{
      key,type,name:publicName,count:1,shallowBytes,
    });
  }
  return {
    totalNodes:snapshot.nodes.length/width,
    totalShallowBytes:totalBytes,
    classes:[...summary.values()].sort((a,b)=>
      b.shallowBytes-a.shallowBytes||a.key.localeCompare(b.key)),
  };
}

export function workshopHeapGrowth(
  before:WorkshopHeapCensus,after:WorkshopHeapCensus
):HeapClassDelta[]{
  const prior=new Map(before.classes.map(entry=>[entry.key,entry]));
  return after.classes.map(entry=>{
    const start=prior.get(entry.key);
    prior.delete(entry.key);
    return {
      key:entry.key,
      beforeCount:start?.count??0,
      afterCount:entry.count,
      countDelta:entry.count-(start?.count??0),
      shallowBytesDelta:entry.shallowBytes-(start?.shallowBytes??0),
    };
  }).concat([...prior.values()].map(entry=>({
    key:entry.key,beforeCount:entry.count,afterCount:0,
    countDelta:-entry.count,shallowBytesDelta:-entry.shallowBytes,
  }))).filter(entry=>entry.countDelta!==0||entry.shallowBytesDelta!==0)
    .sort((a,b)=>b.shallowBytesDelta-a.shallowBytesDelta||
      b.countDelta-a.countDelta);
}
