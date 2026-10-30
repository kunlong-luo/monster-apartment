import {describe,expect,it} from 'vitest';
import {
  projectCoverAnchor,roomHotspotPlacements,roomSpotIsReachable,
} from '../src/core/room-stage-layout';

describe('V3.15 room hotspot visual collision fallback',()=>{
  it('keeps non-overlapping accessible markers in their true scene positions',()=>{
    const stage={width:390,height:315};
    const markers=roomHotspotPlacements([
      {id:'left',position:{left:'20%',top:'30%'}},
      {id:'right',position:{left:'75%',top:'75%'}},
    ],stage);
    expect(markers.map(m=>m.visibility)).toEqual(['visible','visible']);
  });

  it('uses square 44px hit boxes, not just radial distance',()=>{
    const stage={width:390,height:315};
    const markers=roomHotspotPlacements([
      {id:'seal',position:projectCoverAnchor([.6,.815],stage)},
      {id:'tea',position:projectCoverAnchor([.535,.72],stage)},
      {id:'ledger',position:projectCoverAnchor([.77,.815],stage)},
    ],stage);
    // These two centers are >44px apart, but their square hit boxes overlap.
    const seal=markers[0].position,tea=markers[1].position;
    const dx=Math.abs((parseFloat(seal.left)-parseFloat(tea.left))*stage.width/100);
    const dy=Math.abs((parseFloat(seal.top)-parseFloat(tea.top))*stage.height/100);
    expect(Math.hypot(dx,dy)).toBeGreaterThan(44);
    expect(dx).toBeLessThan(44);
    expect(dy).toBeLessThan(44);
    expect(markers.map(m=>m.visibility)).toEqual(['visible','overlap','visible']);
    expect(markers[1].position).toEqual(tea); // Do not falsify physical anchors.
  });

  it('offers a fallback when a 44px marker clips at the narrow crop edge',()=>{
    const stage={width:320,height:315};
    const marker=projectCoverAnchor([.77,.815],stage);
    expect(roomSpotIsReachable(marker,stage)).toBe(false);
    expect(roomHotspotPlacements([{id:'ledger',position:marker}],stage)[0].visibility)
      .toBe('offscreen');
  });

  it('does not reserve space for an offscreen marker when placing others',()=>{
    const stage={width:320,height:315};
    const markers=roomHotspotPlacements([
      {id:'hidden',position:{left:'2%',top:'50%'}},
      {id:'shown',position:{left:'12%',top:'50%'}},
    ],stage);
    expect(markers.map(m=>m.visibility)).toEqual(['offscreen','visible']);
  });

  it('checks intersections in source order without changing ids or saves',()=>{
    const stage={width:320,height:315};
    const markers=roomHotspotPlacements([
      {id:'a',position:{left:'50%',top:'50%'}},
      {id:'b',position:{left:'55%',top:'50%'}},
      {id:'c',position:{left:'60%',top:'50%'}},
    ],stage);
    expect(markers.map(m=>m.id)).toEqual(['a','b','c']);
    expect(markers.map(m=>m.visibility)).toEqual(['visible','overlap','visible']);
  });

  it('renders initial markers while layout measurements are unavailable',()=>{
    const markers=roomHotspotPlacements([{id:'a',position:{left:'50%',top:'50%'}}],null);
    expect(markers).toEqual([{id:'a',position:{left:'50%',top:'50%'},visibility:'visible'}]);
  });
});
