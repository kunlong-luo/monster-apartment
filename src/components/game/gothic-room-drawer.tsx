'use client';
import type {Dispatch,SetStateAction} from 'react';
import {COZY_RESIDENTS,ROOM_DETAILS,FURNISHINGS,availableResidents,
  buildCozyRoom,moveInCozy,decorateCozy,careForCozyResident,
  cozyCareUsedToday,cozyRescuePreview,resolveCozyIncident,COZY_INCIDENTS} from '@/core/cozy-engine';
import type {CozyState,HomeType,Furnishing} from '@/core/cozy-engine';
import {GothicActionButton} from './gothic-hud';
import {ROOM_RUNES} from './gothic-room-doors';

const types:HomeType[]=['nest','bath','workshop','greenhouse'];
const decors:Furnishing[]=['plant','lamp','books'];
const furnishingRunes:Record<Furnishing,string>={plant:'❀',lamp:'✧',books:'☷'};

/** Context actions and incident rescue decisions, separate from the scene clock. */
export function GothicRoomDrawer({
  world,selected,moving,setMoving,onClose,onChange
}:{
  world:CozyState;
  selected:number;
  moving:number|null;
  setMoving:Dispatch<SetStateAction<number|null>>;
  onClose:()=>void;
  onChange:(next:CozyState)=>void;
}){
  const room=world.rooms[selected]??null;
  const incident=world.incident;
  const applicants=availableResidents(world);
  const guest=(id:typeof applicants[number])=>COZY_RESIDENTS.find(p=>p.id===id)!;
  const change=onChange;
  const roomRunes=ROOM_RUNES;
  return <div className="ga-room-drawer" data-testid="ga-room-drawer">
        <div className="ga-drawer-top"><div>
          <span className="ga-micro">ROOM {String(selected+1).padStart(2,'0')}</span>
          <h2>{room?ROOM_DETAILS[room.type].zh:'布置新房间'}</h2>
        </div><button type="button" className="ga-dismiss" aria-label="关闭房间操作"
          onClick={()=>{onClose();}}>×</button></div>
        {!room?<div className="grid grid-cols-2 gap-2 max-[600px]:gap-1.5">
          {types.map(type=><GothicActionButton key={type}
            testId={'ga-build-'+type} disabled={world.coins<ROOM_DETAILS[type].cost}
            onClick={()=>change(buildCozyRoom(world,selected,type))}
            rune={roomRunes[type]} label={ROOM_DETAILS[type].zh}
            detail={'✦ '+ROOM_DETAILS[type].cost}/>)}
        </div>:!room.resident?<div className="grid grid-cols-2 gap-2 max-[600px]:gap-1.5">
          {applicants.map(id=><GothicActionButton key={id}
            testId={'ga-welcome-'+id} onClick={()=>change(moveInCozy(world,selected,id))}
            rune="♟" label={'迎接 '+guest(id).zh} detail={guest(id).bioZh}/>)}
          {applicants.length===0&&<p className="col-span-2 text-xs leading-relaxed text-gothic-muted">
            住客已经入住其他房间，暂时没有新访客。
          </p>}
        </div>:<div className="grid grid-cols-2 gap-2 max-[600px]:gap-1.5">
          <GothicActionButton testId="ga-care" rune="♡"
            label={'照顾 '+guest(room.resident).zh}
            detail={cozyCareUsedToday(world)?'今日已照顾':'增进羁绊'}
            disabled={cozyCareUsedToday(world)}
            onClick={()=>change(careForCozyResident(world,room.resident!))}/>
          <GothicActionButton rune="↔" pressed={moving===selected}
            label={moving===selected?'取消搬迁':'搬迁 / 交换'}
            detail="然后点击另一扇已建房门"
            onClick={()=>setMoving(x=>x===selected?null:selected)}/>
          {decors.map(item=><GothicActionButton key={item}
            testId={'ga-decor-'+item}
            disabled={world.coins<FURNISHINGS[item].cost||room.decor===item}
            onClick={()=>change(decorateCozy(world,selected,item))}
            rune={furnishingRunes[item]} label={FURNISHINGS[item].zh}
            detail={room.decor===item?'已摆放':'✦ '+FURNISHINGS[item].cost}/>)}
        </div>}
        {incident&&<div className="ga-warning" aria-label="公寓突发事件">
          <strong>✧ {COZY_INCIDENTS[incident.kind].zh}</strong>
          <small>{COZY_INCIDENTS[incident.kind].hintZh} · 选择帮手会真实影响修缮收益</small>
          <div className="ga-rescue-helpers">
            {COZY_RESIDENTS.filter(person=>world.rooms.some(p=>p?.resident===person.id))
              .map(person=>{
                const forecast=cozyRescuePreview(world,person.id);
                return <button type="button" key={person.id}
                  onClick={()=>change(resolveCozyIncident(world,person.id))}>
                  <span>{person.zh}</span><small>{forecast?.expert?'擅长 · +12 星币':'修缮 · -6 星币'}</small>
                </button>;
              })}
          </div>
        </div>}
      </div>;
}
