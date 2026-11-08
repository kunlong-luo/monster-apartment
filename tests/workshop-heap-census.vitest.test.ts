import {describe,it,expect} from 'vitest';
import {summarizeWorkshopHeap,workshopHeapGrowth} from '../e2e/helpers/workshop-heap-census';

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
