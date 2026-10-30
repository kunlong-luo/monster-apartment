/** Independent, unapproved geometry for candidate room paintings.
 * Never mutates manifest or player saves until an approved background is promoted. */
export const ROOM_OBJECT_IDS=Object.freeze({
  yuesha:['seal','tea','ledger'],
  brook:['toolbox','gauge','nightbell'],
  fern:['herbarium','moonflower','watermap'],
  cinder:['hammer','blueprint','keepsake'],
});

export function coverProjection(anchor,width,height){
  if(!(width>0&&height>0))throw new Error('Invalid stage geometry');
  const scale=Math.max(width/16,height/9);
  const drawnWidth=16*scale,drawnHeight=9*scale;
  const x=(width-drawnWidth)/2+anchor[0]*drawnWidth;
  const y=(height-drawnHeight)/2+anchor[1]*drawnHeight;
  const visible=x>=22&&x<=width-22&&y>=22&&y<=height-22;
  return {x,y,visible};
}

/** All three object ids must be bound to actual painted props, not invented.
 * This checks geometry only: final prop alignment is a human review task.
 * Desktop, narrow 390px and 320px preview all remain visible in review.html;
 * 320px out-of-frame props are handled by the game's accessible fallback. */
export function validateRoomAnchors(room,anchors){
  const expected=ROOM_OBJECT_IDS[room];
  if(!expected)throw new Error('Unknown room for artwork anchors: '+room);
  if(!anchors||typeof anchors!=='object'||Array.isArray(anchors)||
    JSON.stringify(Object.keys(anchors).sort())!==JSON.stringify([...expected].sort()))
    throw new Error('Exactly three named object anchors required for '+room);
  const seen=[];
  for(const id of expected){
    const point=anchors[id];
    if(!Array.isArray(point)||point.length!==2||
      point.some(n=>typeof n!=='number'||!Number.isFinite(n)||n<=0||n>=1))
      throw new Error('Invalid normalized object anchor '+room+'/'+id);
    const projected=coverProjection(point,390,315);
    if(!projected.visible)
      throw new Error('390px phone marker unreachable: '+room+'/'+id);
    for(const other of seen){
      // Markers are 44px squares: diagonal Euclidean distance can exceed 44px
      // while both X and Y hit-box extents still intersect.
      if(Math.abs(projected.x-other.point.x)<44&&
        Math.abs(projected.y-other.point.y)<44)
        throw new Error('390px phone markers overlap: '+room+'/'+id+' and '+other.id);
    }
    seen.push({id,point:projected});
  }
  return anchors;
}
