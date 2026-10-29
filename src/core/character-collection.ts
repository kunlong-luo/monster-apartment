import {CHARACTER_PROFILES} from './character-life';
import type {Abilities,AbilityKey,CharacterId} from './character-life';

/** The original four adult story characters stay available in their rooms.
 * Cards collect alternate contracts; no gacha roll removes story access. */
export const CHARACTER_CARDS=[
  {key:'brook-tide',character:'brook',title:'泉泡 · 潮汐来信',rarity:'普通',tier:1,weight:46},
  {key:'fern-spring',character:'fern',title:'青枝 · 春芽誓约',rarity:'稀有',tier:2,weight:31},
  {key:'cinder-ember',character:'cinder',title:'炽角 · 炉火余烬',rarity:'史诗',tier:3,weight:17},
  {key:'yuesha-vow',character:'yuesha',title:'月纱 · 月下誓约',rarity:'传说',tier:4,weight:5},
  {key:'yuesha-eclipse',character:'yuesha',title:'月纱 · 神话·月蚀',rarity:'神话·月蚀',tier:5,weight:1},
] as const;
export type CardKey=(typeof CHARACTER_CARDS)[number]['key'];
export const CARD_ODDS=CHARACTER_CARDS.map(card=>({...card,percent:card.weight}));
export const BASE_CONTRACTS=3;
export type GearSlot='jewelry'|'equipment';
export const FORGE_RECIPES=[
  {id:'moon-pendant',name:'月纹吊坠',slot:'jewelry',cost:2,bonus:{spirit:6,wisdom:4},description:'灵能 +6 · 智慧 +4'},
  {id:'silver-ring',name:'银辉指环',slot:'jewelry',cost:3,bonus:{perception:6,affinity:4},description:'感知 +6 · 亲和 +4'},
  {id:'warden-coat',name:'守夜外套',slot:'equipment',cost:3,bonus:{physique:6,endurance:4},description:'体魄 +6 · 耐力 +4'},
  {id:'swift-boots',name:'月行短靴',slot:'equipment',cost:2,bonus:{speed:6,dexterity:4},description:'速度 +6 · 手巧 +4'},
] as const satisfies readonly {id:string;name:string;slot:GearSlot;cost:number;bonus:Partial<Record<AbilityKey,number>>;description:string}[];
export type GearId=(typeof FORGE_RECIPES)[number]['id'];
export type CollectionState={
  version:1;
  draws:CardKey[];
  shards:number;
  inventory:GearId[];
  equipped:Partial<Record<CharacterId,Partial<Record<GearSlot,GearId>>>>;
};
export const newCharacterCollection=():CollectionState=>({
  version:1,draws:[],shards:0,inventory:[],equipped:{},
});
const CHAR_IDS:readonly string[]=Object.keys(CHARACTER_PROFILES);
const CARDS:readonly string[]=CHARACTER_CARDS.map(c=>c.key);
const GEAR:readonly string[]=FORGE_RECIPES.map(x=>x.id);
const slots:readonly string[]=['jewelry','equipment'];
const isRecord=(v:unknown):v is Record<string,unknown>=>!!v&&typeof v==='object'&&!Array.isArray(v);
export function validCharacterCollection(v:unknown):v is CollectionState{
  if(!isRecord(v)||v.version!==1||
    !Array.isArray(v.draws)||v.draws.length>100000||!v.draws.every(k=>CARDS.includes(k))||
    !Number.isSafeInteger(v.shards)||Number(v.shards)<0||
    !Array.isArray(v.inventory)||v.inventory.length>GEAR.length||
    !v.inventory.every(k=>GEAR.includes(k))||new Set(v.inventory).size!==v.inventory.length||
    !isRecord(v.equipped))return false;
  const items=v.inventory as string[];
  const used=new Set<string>();
  for(const [character,eq] of Object.entries(v.equipped)){
    if(!CHAR_IDS.includes(character)||!isRecord(eq))return false;
    if(!(v.draws as string[]).some(key=>CHARACTER_CARDS.find(card=>card.key===key)?.character===character))return false;
    for(const [slot,id] of Object.entries(eq)){
      if(!slots.includes(slot)||typeof id!=='string'||!items.includes(id)||used.has(id))return false;
      if(FORGE_RECIPES.find(item=>item.id===id)?.slot!==slot)return false;
      used.add(id);
    }
  }
  return true;
}
export function earnedContracts(completed:number,visited:number):number{
  if(!Number.isSafeInteger(completed)||completed<0||!Number.isSafeInteger(visited)||visited<0)return BASE_CONTRACTS;
  return BASE_CONTRACTS+Math.min(100000,completed)+Math.min(4,visited);
}
export function availableContracts(s:CollectionState,earned:number):number{
  return Math.max(0,earned-s.draws.length);
}
export function cardFromRoll(roll:number){
  if(!Number.isFinite(roll)||roll<0||roll>=1)throw new Error('Invalid summon roll');
  let remaining=roll*100;
  for(const card of CHARACTER_CARDS){
    remaining-=card.weight;
    if(remaining<0)return card;
  }
  return CHARACTER_CARDS[CHARACTER_CARDS.length-1];
}
export function summonCharacter(s:CollectionState,earned:number,roll:number):CollectionState{
  if(availableContracts(s,earned)<1)return s;
  const card=cardFromRoll(roll);
  const duplicate=s.draws.includes(card.key);
  return {...s,draws:[...s.draws,card.key],shards:s.shards+1+(duplicate?card.tier:0)};
}
export function forgeEquipment(s:CollectionState,id:GearId):CollectionState{
  const item=FORGE_RECIPES.find(item=>item.id===id);
  if(!item||s.inventory.includes(id)||s.shards<item.cost)return s;
  return {...s,shards:s.shards-item.cost,inventory:[...s.inventory,id]};
}
export function equipEquipment(s:CollectionState,character:CharacterId,id:GearId):CollectionState{
  if(!s.inventory.includes(id)||!s.draws.some(k=>CHARACTER_CARDS.find(c=>c.key===k)?.character===character))return s;
  const recipe=FORGE_RECIPES.find(item=>item.id===id)!;
  if(s.equipped[character]?.[recipe.slot]===id)return s;
  // Each crafted item is unique and can be on only one actor at once.
  const equipped:CollectionState['equipped']={};
  for(const [who,loadout] of Object.entries(s.equipped)){
    const next={...loadout};
    if(next[recipe.slot]===id)delete next[recipe.slot];
    equipped[who as CharacterId]=next;
  }
  equipped[character]={...equipped[character],[recipe.slot]:id};
  return {...s,equipped};
}
export function characterAbilities(id:CharacterId,s:CollectionState):Abilities{
  const base=CHARACTER_PROFILES[id].abilities;
  const result={...base};
  for(const gearId of Object.values(s.equipped[id]??{})){
    const recipe=FORGE_RECIPES.find(x=>x.id===gearId);
    if(recipe)for(const [ability,amount] of Object.entries(recipe.bonus)){
      const key=ability as AbilityKey;
      result[key]=Math.min(100,base[key]+(result[key]-base[key])+Number(amount));
    }
  }
  return result;
}
