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

/** R09.4: Follow strong, shortest root-reachable reference paths in a V8
 * snapshot. These are illustrative *reachability* chains, NOT dominators,
 * retained sizes or proof of a leak. The input is a synthetic CI save only. */
export type WorkshopHeapRetainerStep={
  classKey:string;
  via:string;
};
export type WorkshopHeapRetainerSample={
  shallowBytes:number;
  newlyPresentId:boolean;
  rootReachable:boolean;
  depth:number|null;
  path:WorkshopHeapRetainerStep[];
};
export type WorkshopHeapRetainer={
  classKey:string;
  objectCount:number;
  newlyPresentCount:number;
  samples:WorkshopHeapRetainerSample[];
};
type SnapshotGraph=SnapshotLike&{
  snapshot:{meta:{
    node_fields:string[];node_types:unknown[];
    edge_fields:string[];edge_types:unknown[];
  }};
  edges:number[];
};
export const WORKSHOP_RETAINER_CLASSES=[
  'array:(object elements)',
  'code:system / InstructionStream',
  'native:system / JSArrayBufferData',
  'object:Text','object:Graphics','object:Texture',
  'object:TextureSource','object:Container','object:Array',
] as const;

/** IDs are compared only across snapshots of one Chromium process. */
export function workshopHeapClassIds(
  snapshot:SnapshotLike,classKeys:readonly string[]
):Map<string,Set<number>>{
  const meta=snapshot.snapshot.meta;
  const width=meta.node_fields.length;
  const ids=meta.node_fields.indexOf('id');
  const nameIndex=meta.node_fields.indexOf('name');
  const typeIndex=meta.node_fields.indexOf('type');
  const nodeTypes=meta.node_types[typeIndex];
  if(width===0||ids<0||nameIndex<0||typeIndex<0||
    !Array.isArray(nodeTypes)||snapshot.nodes.length%width!==0)
    throw Error('Unexpected heap node ID schema');
  const wanted=new Set(classKeys);
  const result=new Map<string,Set<number>>();
  for(const key of wanted)result.set(key,new Set());
  for(let at=0;at<snapshot.nodes.length;at+=width){
    const type=String(nodeTypes[snapshot.nodes[at+typeIndex]]??'unknown');
    const name=snapshot.strings[snapshot.nodes[at+nameIndex]]??'';
    const key=type+':'+(type.includes('string')?'<string>':name);
    if(!wanted.has(key))continue;
    const id=snapshot.nodes[at+ids];
    if(!Number.isSafeInteger(id))throw Error('Invalid V8 object ID');
    result.get(key)!.add(id);
  }
  return result;
}

const RETAINER_EDGE_NAMES=new Set([
  'children','parent','stage','renderer','texture','source','textures',
  'cache','_cache','_texture','_textures','_source','_renderer',
  'event','events','_events','callbacks','items','data','nodes',
  'buffer','array','state','value','graphics','context','displayObject',
  'style','_style','text','_text','frames','listeners','_listeners',
  'current','currentTarget','target','root','_root',
]);
const heapLabel=(type:string,name:string)=>{
  if(type.includes('string'))return type+':<string>';
  // Never echo arbitrary snapshot string values or generated user labels.
  const publicName=/^[\w ./$()\[\]<>-]{1,78}$/.test(name)?name:'<dynamic>';
  return type+':'+publicName;
};

/** Multi-source shortest path starts at V8's synthetic node zero, following
 * all strong edges including internal/shortcut edges, but never weak edges.
 * A shortest path is not a unique or necessarily dominant retainer. */
export function traceWorkshopHeapRetainers(
  snapshot:SnapshotGraph,
  priorIds:ReadonlyMap<string,ReadonlySet<number>>,
  classKeys:readonly string[]=WORKSHOP_RETAINER_CLASSES,
  samplesPerClass=2
):WorkshopHeapRetainer[]{
  if(!Number.isSafeInteger(samplesPerClass)||samplesPerClass<1||
    samplesPerClass>8)throw RangeError('Invalid retainer sample limit');
  const meta=snapshot.snapshot.meta;
  const nf=meta.node_fields,ef=meta.edge_fields;
  const nw=nf.length,ew=ef.length;
  const ni=nf.indexOf('name'),ti=nf.indexOf('type');
  const ii=nf.indexOf('id'),si=nf.indexOf('self_size'),ci=nf.indexOf('edge_count');
  const et=ef.indexOf('type'),en=ef.indexOf('name_or_index'),dest=ef.indexOf('to_node');
  const nodeTypes=meta.node_types[ti],edgeTypes=meta.edge_types[et];
  if(!nw||!ew||[ni,ti,ii,si,ci,et,en,dest].some(i=>i<0)||
    !Array.isArray(nodeTypes)||!Array.isArray(edgeTypes)||
    snapshot.nodes.length%nw!==0||snapshot.edges.length%ew!==0)
    throw Error('Unexpected V8 heap graph schema');
  const n=snapshot.nodes.length/nw;
  // Chrome stores to_node as an offset in the flat node array, not ordinal.
  const starts=new Uint32Array(n);
  let pos=0;
  for(let i=0;i<n;i++){
    starts[i]=pos;
    const count=snapshot.nodes[i*nw+ci];
    if(!Number.isSafeInteger(count)||count<0)throw Error('Bad heap edge count');
    pos+=count*ew;
  }
  if(pos!==snapshot.edges.length)throw Error('V8 heap edge count mismatch');
  const parent=new Int32Array(n);parent.fill(-1);
  const incoming=new Int32Array(n);incoming.fill(-1);
  const edgeToken=new Int32Array(n);edgeToken.fill(-1);
  const queue=new Uint32Array(n);
  let read=0,write=1;
  parent[0]=0;queue[0]=0;
  while(read<write){
    const node=queue[read++];
    const start=starts[node],end=node+1<n?starts[node+1]:pos;
    for(let at=start;at<end;at+=ew){
      const type=String(edgeTypes[snapshot.edges[at+et]]??'unknown');
      if(type==='weak')continue;
      const offset=snapshot.edges[at+dest];
      if(!Number.isSafeInteger(offset)||offset<0||
        offset>=snapshot.nodes.length||offset%nw!==0)
        throw Error('Invalid heap reference');
      const target=offset/nw;
      if(parent[target]!==-1)continue;
      parent[target]=node;
      incoming[target]=snapshot.edges[at+et];
      edgeToken[target]=snapshot.edges[at+en];
      queue[write++]=target;
    }
  }
  const label=(ordinal:number)=>{
    const offset=ordinal*nw;
    return heapLabel(
      String(nodeTypes[snapshot.nodes[offset+ti]]??'unknown'),
      snapshot.strings[snapshot.nodes[offset+ni]]??''
    );
  };
  const via=(ordinal:number)=>{
    const type=String(edgeTypes[incoming[ordinal]]??'unknown');
    if(type!=='property')return type;
    const name=snapshot.strings[edgeToken[ordinal]];
    return RETAINER_EDGE_NAMES.has(name)?'.'+name:'property';
  };
  const pathFor=(ordinal:number):Pick<WorkshopHeapRetainerSample,
    'rootReachable'|'depth'|'path'>=>{
    if(parent[ordinal]===-1)return {rootReachable:false,depth:null,path:[]};
    const chain:number[]=[];
    let current=ordinal;
    while(chain.length<=n){
      chain.push(current);
      if(current===0)break;
      current=parent[current];
    }
    if(chain[chain.length-1]!==0)
      throw Error('Malformed heap retaining chain');
    chain.reverse();
    // Keep both GC root and target even for long paths.
    const sliced=chain.length<=16?chain:[
      ...chain.slice(0,6),-1,...chain.slice(-8),
    ];
    return {
      rootReachable:true,depth:chain.length-1,
      path:sliced.map((id,i)=>id===-1
        ?{classKey:'<omitted>',via:'…'}
        :{classKey:label(id),via:i===0?'root':via(id)}),
    };
  };
  const wanted=new Set(classKeys);
  const found=new Map<string,{count:number;fresh:number;
    recent:Array<{ordinal:number;bytes:number}>;
    fallback:Array<{ordinal:number;bytes:number}>}>();
  for(const key of wanted)found.set(key,{
    count:0,fresh:0,recent:[],fallback:[],
  });
  const add=(arr:Array<{ordinal:number;bytes:number}>,
    item:{ordinal:number;bytes:number})=>{
    arr.push(item);
    arr.sort((a,b)=>b.bytes-a.bytes||a.ordinal-b.ordinal);
    if(arr.length>samplesPerClass)arr.pop();
  };
  for(let node=0;node<n;node++){
    const off=node*nw;
    const type=String(nodeTypes[snapshot.nodes[off+ti]]??'unknown');
    const name=snapshot.strings[snapshot.nodes[off+ni]]??'';
    const key=type+':'+(type.includes('string')?'<string>':name);
    if(!wanted.has(key))continue;
    const record=found.get(key)!;
    record.count++;
    const id=snapshot.nodes[off+ii];
    if(!Number.isSafeInteger(id))throw Error('Invalid V8 object ID');
    const bytes=snapshot.nodes[off+si];
    const item={ordinal:node,bytes};
    if(!(priorIds.get(key)?.has(id))){
      record.fresh++;
      add(record.recent,item);
    }else add(record.fallback,item);
  }
  return [...found].map(([classKey,record])=>({
    classKey,objectCount:record.count,newlyPresentCount:record.fresh,
    samples:(record.recent.length?record.recent:record.fallback).map(item=>({
      shallowBytes:item.bytes,
      newlyPresentId:record.recent.length>0,
      ...pathFor(item.ordinal),
    })),
  }));
}
