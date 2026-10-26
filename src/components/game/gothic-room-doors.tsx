'use client';

import {COZY_RESIDENTS,ROOM_DETAILS,COZY_INCIDENTS} from '@/core/cozy-engine';
import type {CozyState,HomeType} from '@/core/cozy-engine';

export const ROOM_RUNES:Record<HomeType,string>={
  nest:'⌂',bath:'◈',workshop:'⚒',greenhouse:'❀'
};

/** Visual/interaction component only: all mutations live in the owning game scene. */
export function GothicRoomDoors({
  world,selected,onChoose
}:{
  world:CozyState;
  selected:number|null;
  onChoose:(index:number)=>void;
}){
  return <aside className="ga-room-list" aria-label="可交互的公寓房间">
    <div className="ga-list-title">RESIDENCE · 六扇房门</div>
    <div className="ga-doors">
      {world.rooms.map((place,index)=>{
        const resident=place?.resident
          ?COZY_RESIDENTS.find(person=>person.id===place.resident)
          :null;
        return <button key={index} type="button" onClick={()=>onChoose(index)}
          data-testid={'ga-room-'+index}
          aria-label={String(index+1)+'号房 '+(place?ROOM_DETAILS[place.type].zh:'待建造')}
          aria-pressed={selected===index}
          className={'ga-door'+(selected===index?' is-active':'')+(resident?' is-occupied':'')}>
          <span className="ga-door-icon" aria-hidden="true">{place?ROOM_RUNES[place.type]:'✧'}</span>
          <span className="ga-door-copy">
            <strong>{String(index+1).padStart(2,'0')} · {place?ROOM_DETAILS[place.type].zh:'待建造'}</strong>
            <small>{resident?'住客 · '+resident.zh:place?'房间空置':'点击修建'}</small>
          </span>
        </button>;
      })}
    </div>
    {world.incident&&<span className="ga-incident">
      ✧ {COZY_INCIDENTS[world.incident.kind].zh}
    </span>}
  </aside>;
}
