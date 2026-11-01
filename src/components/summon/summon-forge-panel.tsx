'use client';

import {FORGE_RECIPES,type CollectionState} from '@/core/character-collection';
import type {CharacterId} from '@/core/character-life';
import {commitCollection,type CollectionStatus} from '@/lib/game/character-collection-store';

/** Forge/equip UI uses one existing collection store and its guarded actions. */
export function SummonForgePanel({
  collection,collectionStatus,ownedEquipmentCharacters,selectedEquipTarget,
  onSelectEquipTarget,forgeNotice,onForgeNotice
}:{
  collection:CollectionState;collectionStatus:CollectionStatus;
  ownedEquipmentCharacters:CharacterId[];selectedEquipTarget:CharacterId|null;
  onSelectEquipTarget:(id:CharacterId)=>void;forgeNotice:string;onForgeNotice:(text:string)=>void;
}){
  return (
              <div className="border-t border-[#7a543855] pt-3">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                  <h4 className="font-bold text-[#ffdca8]">首饰与装备打造</h4>
                  <label className="flex items-center gap-2 text-[11px] text-[#e9ceaf]">
                    装备人物
                    <select data-testid="collection-equip-target"
                      value={selectedEquipTarget??''}
                      disabled={ownedEquipmentCharacters.length===0||collectionStatus!=='ok'}
                      onChange={e=>onSelectEquipTarget(e.target.value as CharacterId)}
                      className="min-h-9 rounded border border-[#b58d62] bg-[#241222] px-3 text-[#ffe3bd]">
                      {ownedEquipmentCharacters.length===0&&<option value="">先召唤人物</option>}
                      {ownedEquipmentCharacters.map(id=><option value={id} key={id}>
                        {id==='yuesha'?'月纱':id==='brook'?'泉泡':id==='fern'?'青枝':'炽角'}
                      </option>)}
                    </select>
                  </label>
                </div>
                {collectionStatus!=='ok'&&<p role="alert" className="mb-2 text-xs text-red-200">人物收藏存档不可读取，装备操作已暂停。</p>}
                {forgeNotice&&<p data-testid="collection-forge-feedback" role="status" className="mb-2 text-xs text-[#f3cf9d]">{forgeNotice}</p>}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {FORGE_RECIPES.map((recipe) => (
                    <div
                      key={recipe.id}
                      className="flex items-center justify-between rounded-lg border border-[#7a5438] bg-[#221321] p-2.5"
                    >
                      <div>
                        <strong className="block text-xs text-[#ffe5be]">{recipe.name}</strong>
                        <span className="text-[10px] text-[#cca583]">{recipe.description}</span>
                      </div>
                      <div className="ml-2 flex shrink-0 flex-col gap-1.5">
                        <button type="button" data-testid={'collection-gear-' + recipe.id}
                          disabled={collectionStatus!=='ok'||collection.inventory.includes(recipe.id)||collection.shards<recipe.cost}
                          onClick={()=>{
                            const result=commitCollection({type:'forge',id:recipe.id});
                            onForgeNotice(result.status==='applied'?recipe.name+'已打造，可以选择人物穿戴。':'打造未完成，请检查碎片或存档。');
                          }}
                          className="min-h-9 rounded border border-[#c49a62] bg-[#3f1f33] px-2 py-1 text-[11px] text-[#ffe2be] hover:bg-[#522542] disabled:cursor-not-allowed disabled:opacity-50">
                          {collection.inventory.includes(recipe.id)?'已打造':'打造 ('+recipe.cost+' 碎片)'}
                        </button>
                        {collection.inventory.includes(recipe.id)&&<button
                          type="button" data-testid={'collection-equip-'+recipe.id}
                          disabled={!selectedEquipTarget||collectionStatus!=='ok'}
                          onClick={()=>{
                            if(!selectedEquipTarget)return;
                            const result=commitCollection({type:'equip',character:selectedEquipTarget,id:recipe.id});
                            onForgeNotice(result.status==='applied'?'装备已穿戴，人物属性已更新。':'穿戴未完成，请检查人物是否已收录。');
                          }}
                          className="min-h-9 rounded border border-[#d8ab78] bg-[#722844] px-2 py-1 text-[11px] text-[#ffe4c1] hover:brightness-110 disabled:opacity-50">
                          {selectedEquipTarget&&collection.equipped[selectedEquipTarget]?.[recipe.slot]===recipe.id?'已穿戴':'穿戴'}
                        </button>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
  );
}
