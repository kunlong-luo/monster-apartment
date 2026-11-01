'use client';
import {ReliableImage as Image} from '@/components/game/reliable-image';
import {HEROINE_FACE_ART} from './heroine-portrait-assets';
import {GACHA_POOLS} from '@/lib/summon/gacha-engine';

export type FeaturedWorker='brook'|'fern'|'cinder';
/** Visual pool selection, not a second gacha engine. */
export function SummonPoolRail({activePoolId,featuredWorkers,disabled,onSelectPool}:{
  activePoolId:string;featuredWorkers:Partial<Record<string,FeaturedWorker>>;
  disabled:boolean;onSelectPool:(id:string)=>void;
}){
  return (
        <aside className="summon-cinematic-pools relative flex w-full shrink-0 flex-row gap-2 overflow-x-auto py-1 lg:w-56 lg:flex-col lg:justify-center lg:gap-2 lg:overflow-visible lg:py-4 xl:w-64 z-20">
          {GACHA_POOLS.map((pool) => {
            const isActive = pool.id === activePoolId;
            const workerPreview = featuredWorkers[pool.id] ?? null;
            return (
              <button
                key={pool.id}
                type="button"
                data-testid="summon-pool-item" data-pool-id={pool.id}
                aria-pressed={isActive}
                disabled={disabled}
                onClick={() => onSelectPool(pool.id)}
                className={`summon-pool-item group relative flex min-h-14 w-44 shrink-0 items-center gap-2.5 rounded-md border p-2 text-left transition-colors duration-200 lg:h-20 lg:w-full ${
                  isActive
                    ? 'border-[#ffcf7a] bg-gradient-to-r from-[#4d1629dd] via-[#2f1124dd] to-[#1a0a19bb] shadow-[0_0_14px_#cc204644]'
                    : 'border-[#734f3788] bg-[#1a0c18a8] hover:border-[#d9a86a] hover:bg-[#281324cc]'
                }`}
              >
                {/* Same real character identity on pool tile and main spotlight. */}
                <div className="relative size-12 shrink-0 overflow-hidden rounded-lg border border-[#e2b57855]">
                  <Image src={HEROINE_FACE_ART[workerPreview??'yuesha']}
                    alt={pool.subname} fill sizes="48px"
                    className="object-cover object-top"/>
                </div>

                {/* Pool copy */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-bold truncate ${
                        isActive ? 'text-[#ffe7c9]' : 'text-[#dbc0a6]'
                      }`}
                    >
                      {pool.name}
                    </span>
                  </div>
                  <span className="block text-[10px] text-[#bda088] truncate">{pool.subname}</span>
                  <span className="mt-0.5 inline-block rounded bg-[#691428] px-1.5 py-0.2 text-[9px] text-[#ffbacb]">
                    {pool.badge}
                  </span>
                </div>

              </button>
            );
          })}


        </aside>
  );
}
