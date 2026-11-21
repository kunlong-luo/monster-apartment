/** Shared R12 source and published-image sampling budget.
 * A native-pixel minimum alone cannot prevent upsampling at retina DPR.
 * These targets match the supported browser screenshot profiles.
 */
export const R12_REFERENCE_VIEWPORTS=Object.freeze([
  {id:'pc-1440-dpr1',width:1440,height:900,dpr:1,kind:'desktop'},
  {id:'pc-1648-dpr2',width:1648,height:928,dpr:2,kind:'desktop'},
  {id:'phone-390x844-dpr2',width:390,height:844,dpr:2,kind:'mobile'},
  {id:'phone-390x550-dpr2',width:390,height:550,dpr:2,kind:'mobile'},
].map(profile=>Object.freeze(profile)));

/** CSS background-size:cover / object-fit:cover, in actual device pixels. */
export function effectiveCoverScale(w,h,viewport){
  if(!(w>0&&h>0&&viewport.width>0&&viewport.height>0&&viewport.dpr>0))
    throw new Error('Invalid positive image or viewport dimensions');
  return Math.max(viewport.width*viewport.dpr/w,viewport.height*viewport.dpr/h);
}

/** > 1 means upsampling, not a human sharpness rating. Allow tiny float error. */
export function coverUpsampleProfiles(w,h,kind){
  return R12_REFERENCE_VIEWPORTS.filter(p=>p.kind===kind)
    .map(p=>({id:p.id,scale:effectiveCoverScale(w,h,p)}))
    .filter(x=>x.scale>1.001);
}
