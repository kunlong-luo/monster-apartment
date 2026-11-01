'use client';

import Link from 'next/link';
import {ChevronRight} from 'lucide-react';
import {ReliableImage as Image} from './reliable-image';
import {HEROINE_FACE_ART} from '@/components/summon/heroine-portrait-assets';

/**
 * Reference-design left rail: links to the four existing resident rooms.
 * Visual content only; no duplicate resident/store state.
 */
export function GothicLobbyResidents(){
  return (
    <aside className="gothic-lobby__reference-roster" data-testid="gothic-design-roster"
      aria-label="公寓住客">
      <span className="gothic-lobby__reference-roster-title">公寓住客 <small>RESIDENTS</small></span>
      {([
        {id:'yuesha',name:'月纱',detail:'契约会客室'},
        {id:'brook',name:'泉泡',detail:'潮汐之室'},
        {id:'fern',name:'青枝',detail:'春芽之室'},
        {id:'cinder',name:'炽角',detail:'余烬之室'},
      ] as const).map(({id,name,detail})=>
        <Link href={id==='yuesha'?'/apartment/?visit=yuesha':'/characters/?visit='+id} key={id}
          className={'gothic-lobby__reference-resident'+(id==='yuesha'?' gothic-lobby__reference-resident--active':'')}
          data-testid={'gothic-resident-'+id}
          aria-label={'拜访'+name+'的私人房间'}>
          <Image src={HEROINE_FACE_ART[id]} alt="" width={52} height={52}
            sizes="52px" loading="eager" className="gothic-lobby__reference-avatar"/>
          <span><strong>{name}</strong><small>{detail}</small></span>
          <ChevronRight aria-hidden="true" size={15} strokeWidth={1.5}/>
        </Link>)}
    </aside>
  );
}
