import type {GachaRarity} from './gacha-engine';

/** Presentation durations only. Do not import the roll engine or mutate a save. */
export const TEN_PULL_FIRST_REVEAL_MS=380;
export const TEN_PULL_HOLD_MS:Readonly<Record<GachaRarity,number>>={
  N:460,
  R:540,
  SR:790,
  'SSR-Legend':1700,
  'SSR-Mythic':2450,
};
export function getTenPullHoldMs(rarity:GachaRarity):number{
  return TEN_PULL_HOLD_MS[rarity];
}
export function getNextUnrevealedIndex(count:number,revealed:readonly number[]):number{
  for(let i=0;i<count;i++)if(!revealed.includes(i))return i;
  return -1;
}
export function isFeaturedTenPullRarity(rarity:GachaRarity):boolean{
  return rarity==='SSR-Legend'||rarity==='SSR-Mythic';
}

/** UI-only playback reducer. The draw snapshot is immutable and already saved. */
export type TenPullPlaybackState={
  revealedIndices:number[];
  selectedIndex:number;
  playback:'playing'|'paused'|'complete';
};
export type TenPullPlaybackEvent=
  |{type:'advance';count:number}
  |{type:'select';count:number;index:number}
  |{type:'pause'}
  |{type:'resume';count:number}
  |{type:'complete';bestIndex:number;count:number}
  |{type:'reveal-all';bestIndex:number;count:number}
  |{type:'replay'};

export function initialTenPullPlayback(count:number,still:boolean,bestIndex:number):TenPullPlaybackState{
  const instant=count<=1||still;
  return {revealedIndices:instant?Array.from({length:count},(_,i)=>i):[],
    selectedIndex:count>1&&still?bestIndex:0,playback:instant?'complete':'playing'};
}

export function reduceTenPullPlayback(
  state:TenPullPlaybackState,event:TenPullPlaybackEvent
):TenPullPlaybackState{
  switch(event.type){
    case 'pause':
      return state.playback==='playing'?{...state,playback:'paused'}:state;
    case 'resume':
      return state.playback==='paused'&&state.revealedIndices.length<event.count
        ?{...state,playback:'playing'}:state;
    case 'replay':
      return {revealedIndices:[],selectedIndex:0,playback:'playing'};
    case 'advance':{
      if(state.playback!=='playing')return state;
      const next=getNextUnrevealedIndex(event.count,state.revealedIndices);
      if(next===-1)return state;
      return {...state,selectedIndex:next,revealedIndices:[...state.revealedIndices,next]};
    }
    case 'select':{
      if(event.index<0||event.index>=event.count)return state;
      const revealed=state.revealedIndices.includes(event.index)
        ?state.revealedIndices:[...state.revealedIndices,event.index];
      return {selectedIndex:event.index,revealedIndices:revealed,
        playback:revealed.length===event.count?'complete':'paused'};
    }
    case 'complete':
      return state.playback==='playing'&&state.revealedIndices.length===event.count
        ?{...state,playback:'complete',selectedIndex:event.bestIndex}:state;
    case 'reveal-all':
      return {revealedIndices:Array.from({length:event.count},(_,i)=>i),
        selectedIndex:event.bestIndex,playback:'complete'};
  }
}
