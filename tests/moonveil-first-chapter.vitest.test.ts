import {describe,expect,it} from 'vitest';
import {newWorkshop} from '../engine/src/workshop-engine';
import {moonveilFirstChapter} from '../engine/src/workshop-guidance';
import type {PatronStatus,WorkshopState} from '../engine/src/workshop-model';

describe('Moonveil first chapter guidance',()=>{
  const starter=newWorkshop();
  const withPatron=(status:PatronStatus):WorkshopState=>({
    ...starter,completed:1,patron:{status,due:6,cores:7,reward:120},
  });
  it('points a new player to actual production, then to the order when stock is ready',()=>{
    const empty={...starter,warehouse:{core:0}};
    expect(moonveilFirstChapter(empty)).toMatchObject({href:'/workshop/'});
    expect(moonveilFirstChapter({...empty,warehouse:{core:empty.order.cores}})).toMatchObject({href:'/orders/'});
  });
  it('acknowledges first delivery, prioritises offered and active special commissions',()=>{
    expect(moonveilFirstChapter({...starter,completed:1,patron:null}).href).toBe('/apartment/?visit=yuesha');
    expect(moonveilFirstChapter(withPatron('offered')).text).toContain('已经完成了普通委托');
    expect(moonveilFirstChapter({...withPatron('active'),warehouse:{core:2}})).toMatchObject({
      href:'/orders/',text:expect.stringContaining('库存还有 2 枚'),
    });
  });
  it('acknowledges completed and missed outcomes without inventing new rewards or modifying state',()=>{
    const completed=withPatron('completed');
    const before=JSON.stringify(completed);
    expect(moonveilFirstChapter(completed)).toMatchObject({href:'/apartment/?visit=yuesha',text:expect.stringContaining('特别委托已经完成')});
    expect(JSON.stringify(completed)).toBe(before);
    for(const status of ['missed','expired'] as const){
      expect(moonveilFirstChapter(withPatron(status))).toMatchObject({href:'/apartment/?visit=yuesha',text:expect.stringContaining('没能如约完成')});
    }
  });
});
