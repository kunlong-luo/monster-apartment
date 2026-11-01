'use client';

import Link from 'next/link';
import {BookOpen,ChevronRight} from 'lucide-react';
import {ReliableImage as Image} from './reliable-image';
import {siteAssetUrl} from '@/lib/game/site-asset-url';
import moonveilBust from '../../../public/art/yuesha-bust-v3.webp';
import lobbyHero from '../../../public/art/lobby-hero-v3.webp';
import lobbyHeroBackup from '../../../public/art/lobby-hero-v2.webp';

/** Right-side illustrated destinations: no new routes or placeholder actions. */
export function GothicLobbyDestinations({onOpenMemories}:{onOpenMemories:()=>void}){
  return (
    <aside className="gothic-lobby__reference-right" data-testid="gothic-design-right"
      aria-label="公寓世界场景入口">
      <Link href="/workshop/" data-testid="gothic-reference-workshop"
        className="gothic-lobby__reference-postcard">
        <Image src={siteAssetUrl('/art/feature-postcards/gothic-workshop.webp')}
          fallbackSrc={lobbyHero} fill unoptimized alt="" sizes="320px"
          data-testid="gothic-postcard-workshop-art"
          className="gothic-lobby__reference-postcard-img gothic-lobby__reference-postcard-img--workshop"/>
        <span><strong>工坊</strong><small>打造专属装备</small></span>
        <ChevronRight aria-hidden="true" size={18}/>
      </Link>
      <Link href="/town/" data-testid="gothic-reference-town"
        className="gothic-lobby__reference-postcard">
        <Image src={siteAssetUrl('/art/feature-postcards/moonlit-street.webp')}
          fallbackSrc={lobbyHeroBackup} fill unoptimized alt="" sizes="320px"
          data-testid="gothic-postcard-town-art"
          className="gothic-lobby__reference-postcard-img gothic-lobby__reference-postcard-img--town"/>
        <span><strong>月光街</strong><small>探索夜色街区</small></span>
        <ChevronRight aria-hidden="true" size={18}/>
      </Link>
      <button type="button" className="gothic-lobby__reference-postcard"
        onClick={onOpenMemories} data-testid="gothic-right-memories"
        aria-label="剧情回顾">
        <Image src={moonveilBust} fill alt="" sizes="320px" className="gothic-lobby__reference-postcard-img gothic-lobby__reference-postcard-img--gallery"/>
        <span><strong>剧情回顾</strong><small>重温她们的故事</small></span>
        <BookOpen aria-hidden="true" size={18}/>
      </button>
    </aside>
  );
}
