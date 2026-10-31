import {describe,expect,it} from 'vitest';
import {compositeDrawingBox,roomCompositionReadiness,roomPropPlacement}
  from '../src/core/room-art-prop-composition';
const anchors={seal:[.42,.5],tea:[.58,.5],ledger:[.5,.77]} as const;
const art={
  seal:{url:'blob:seal',name:'seal.png',width:200,height:200},
  tea:{url:'blob:tea',name:'tea.webp',width:300,height:400},
  ledger:{url:'blob:ledger',name:'ledger.png',width:500,height:300},
};
describe('Gothic salon layered artwork QA',()=>{
  it('rejects a missing background or even one missing independently illustrated prop',()=>{
    expect(roomCompositionReadiness(anchors,art,false).ready).toBe(false);
    expect(roomCompositionReadiness(anchors,{seal:art.seal,tea:art.tea},true).ready).toBe(false);
    expect(roomCompositionReadiness(anchors,art,true).ready).toBe(true);
  });
  it('keeps artistic objects at the same source position in desktop and mobile crops',()=>{
    const desktop=roomPropPlacement([.5,.5],{width:1920,height:1080},.10);
    const mobile=roomPropPlacement([.5,.5],{width:390,height:315},.10);
    expect(desktop).toEqual({left:'50%',top:'50%',width:192});
    expect(mobile.left).toBe('50%');
    expect(mobile.top).toBe('50%');
    expect(mobile.width).toBeGreaterThan(39);
  });
  it('renders a true native-2K composite with transparent prop aspect ratio preserved',()=>{
    const box=compositeDrawingBox([.5,.5],'tea',art.tea);
    expect(box.width).toBeCloseTo(1920*.093);
    expect(box.height/box.width).toBeCloseTo(4/3);
    expect(box.x+box.width/2).toBeCloseTo(960);
    expect(box.y+box.height/2).toBeCloseTo(540);
  });
  it('never declares completion for geometrically overlapping phone touch markers',()=>{
    const bad={seal:[.5,.5],tea:[.505,.5],ledger:[.6,.7]} as const;
    expect(roomCompositionReadiness(bad,art,true).ready).toBe(false);
  });
});
