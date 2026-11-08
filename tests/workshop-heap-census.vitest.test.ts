import {describe,it,expect} from 'vitest';
import {summarizeWorkshopHeap,workshopHeapGrowth,workshopHeapClassIds,traceWorkshopHeapRetainers} from '../e2e/helpers/workshop-heap-census';

const types=['hidden','object','array','native','string'];
const strings=['Text','Graphics','Window','private-snapshot-content'];
const fixture=(rows:Array<[number,number,number]>)=>({
  snapshot:{meta:{
    node_fields:['type','name','id','self_size','edge_count'],
    node_types:[types,'string','number','number','number'],
  }},
  nodes:rows.flatMap(([type,name,bytes],id)=>[type,name,id+1,bytes,0]),
  strings,
});

describe('R09 heap snapshot class census',()=>{
  it('sums Pixi classes and hides raw string contents',()=>{
    const census=summarizeWorkshopHeap(fixture([
      [1,0,32],[1,0,48],[1,1,64],[4,3,24],
    ]));
    expect(census.totalNodes).toBe(4);
    expect(census.totalShallowBytes).toBe(168);
    expect(census.classes.find(x=>x.key==='object:Text')).toMatchObject({
      count:2,shallowBytes:80,
    });
    expect(census.classes.find(x=>x.type==='string')?.name).toBe('<string>');
    expect(JSON.stringify(census)).not.toContain('private-snapshot-content');
  });
  it('diffs growth and removals by class rather than heap total',()=>{
    const prior=summarizeWorkshopHeap(fixture([
      [1,0,40],[1,1,20],
    ]));
    const after=summarizeWorkshopHeap(fixture([
      [1,0,40],[1,0,40],[3,2,30],
    ]));
    const diff=workshopHeapGrowth(prior,after);
    expect(diff.find(x=>x.key==='object:Text')).toMatchObject({
      beforeCount:1,afterCount:2,countDelta:1,shallowBytesDelta:40,
    });
    expect(diff.find(x=>x.key==='object:Graphics')).toMatchObject({
      countDelta:-1,shallowBytesDelta:-20,
    });
    expect(diff.find(x=>x.key==='native:Window')?.shallowBytesDelta).toBe(30);
  });
  it('rejects malformed snapshots instead of silently producing empty data',()=>{
    const broken=fixture([[1,0,32]]);
    broken.nodes.pop();
    expect(()=>summarizeWorkshopHeap(broken)).toThrow(/schema/);
  });
});

describe('R09.4 V8 strong-root retaining paths',()=>{
  const graph=()=>{
    const edgeTypes=['property','internal','weak'];
    const nodeTypes=['synthetic','object','array','native'];
    const names=[
      '(GC roots)','Window','Array','(object elements)',
      'system / JSArrayBufferData','window','children','private-secret',
    ];
    // Root has one real property and one weak-only reference. Window owns
    // a live Array, whose backing store is reachable through an internal edge.
    return {
      snapshot:{meta:{
        node_fields:['type','name','id','self_size','edge_count'],
        node_types:[nodeTypes,'string','number','number','number'],
        edge_fields:['type','name_or_index','to_node'],
        edge_types:[edgeTypes,'string_or_number','node'],
      }},
      nodes:[
        0,0,1,0,2, // root
        1,1,2,32,1, // Window
        2,2,3,16,1, // Array
        2,3,4,96,0, // strong backing store
        2,3,5,96,0, // weak-only backing store
      ],
      edges:[
        0,5,5, // root --window--> Window
        2,7,20, // root --weak--> weak-only
        0,6,10, // Window --children--> Array
        1,0,15, // Array --internal--> backing store
      ],
      strings:names,
    };
  };
  it('traces strong GC root chains without treating weak-only edges as owners',()=>{
    const input=graph();
    const previous=new Map([['array:(object elements)',new Set([5])]]);
    const paths=traceWorkshopHeapRetainers(input,previous,
      ['array:(object elements)']);
    expect(paths).toHaveLength(1);
    expect(paths[0]).toMatchObject({
      objectCount:2,newlyPresentCount:1,
    });
    expect(paths[0].samples[0]).toMatchObject({
      newlyPresentId:true,rootReachable:true,depth:3,shallowBytes:96,
    });
    expect(paths[0].samples[0].path.map(s=>s.classKey)).toEqual([
      'synthetic:(GC roots)','object:Window','array:Array',
      'array:(object elements)',
    ]);
    expect(paths[0].samples[0].path.map(s=>s.via))
      .toEqual(['root','property','.children','internal']);
    expect(JSON.stringify(paths)).not.toContain('private-secret');
  });
  it('tracks object IDs within one process and reports unreachable targets',()=>{
    const input=graph();
    expect(workshopHeapClassIds(input,['array:(object elements)'])
      .get('array:(object elements)')).toEqual(new Set([4,5]));
    // Existing strong target ID 4; the new object is weak-only.
    const prior=new Map([['array:(object elements)',new Set([4])]]);
    const report=traceWorkshopHeapRetainers(input,prior,
      ['array:(object elements)']);
    expect(report[0].samples[0]).toMatchObject({
      newlyPresentId:true,rootReachable:false,depth:null,path:[],
    });
  });
  it('rejects malformed edge tables and invalid sampling limits',()=>{
    const input=graph();
    input.edges.pop();
    expect(()=>traceWorkshopHeapRetainers(input,new Map()))
      .toThrow(/schema|count mismatch/);
    expect(()=>traceWorkshopHeapRetainers(graph(),new Map(),[],0))
      .toThrow(RangeError);
  });
});
