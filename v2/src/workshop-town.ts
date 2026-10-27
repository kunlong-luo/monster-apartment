/** Pure one-trade-per-day town economy. All resource changes use
 * real machine tanks or the shared workshop warehouse. */
import {TOWN_MARKET,TOWN_RESIDENTS,residentForDay} from './workshop-model';
import type {WorkshopState,TownSupply} from './workshop-model';

/** A town decision with a tangible economic effect, one choice per game day.
 * Inputs must exist: no machine means no place to unload water or fiber.
 * These are stocked goods, not free daily rewards or an abstract bonus.
 * The least-stocked eligible device receives the shipment. */
export function buyTownSupply(s:WorkshopState,kind:TownSupply):WorkshopState {
  if(!Object.hasOwn(TOWN_MARKET,kind))return s;
  const offer=TOWN_MARKET[kind];
  if(s.market?.day===s.day||s.coins<offer.cost)return s;
  if(kind==='core'){
    if(!Number.isSafeInteger(s.warehouse.core+offer.amount))return s;
    return {...s,coins:s.coins-offer.cost,market:{day:s.day,kind},
      warehouse:{core:s.warehouse.core+offer.amount}};
  }
  const craft=kind==='water'?'well':'garden';
  const index=s.tiles.reduce((best,i,j)=>{
    if(i?.craft!==craft||!Number.isSafeInteger(i.stored+offer.amount))return best;
    return best===-1||i.stored<s.tiles[best]!.stored?j:best;
  },-1);
  if(index<0)return s;
  const tiles=s.tiles.slice();
  tiles[index]={...tiles[index]!,stored:tiles[index]!.stored+offer.amount};
  return {...s,coins:s.coins-offer.cost,market:{day:s.day,kind},tiles};
}
export function townMarketAvailable(s:WorkshopState,kind:TownSupply):boolean {
  if(!Object.hasOwn(TOWN_MARKET,kind)||s.market?.day===s.day
    ||s.coins<TOWN_MARKET[kind].cost)return false;
  if(kind==='core')return Number.isSafeInteger(s.warehouse.core+TOWN_MARKET.core.amount);
  const craft=kind==='water'?'well':'garden';
  return s.tiles.some(t=>t?.craft===craft&&
    Number.isSafeInteger(t.stored+TOWN_MARKET[kind].amount));
}

/** Same daily slot as buying town supplies: help a resident OR import goods.
 * A resident only pays if the required material is truly in stock. */
export function deliverResidentRequest(s:WorkshopState):WorkshopState {
  if(s.market?.day===s.day||!Number.isSafeInteger(s.residentsHelped??0)
    ||(s.residentsHelped??0)>=Number.MAX_SAFE_INTEGER)return s;
  const kind=residentForDay(s.day);
  const request=TOWN_RESIDENTS[kind];
  if(!Number.isSafeInteger(s.coins+request.reward))return s;
  if(kind==='residentCore'){
    if(s.warehouse.core<request.amount)return s;
    return {...s,coins:s.coins+request.reward,
      warehouse:{core:s.warehouse.core-request.amount},
      market:{day:s.day,kind},residentsHelped:(s.residentsHelped??0)+1};
  }
  const craft=kind==='residentWater'?'well':'garden';
  const index=s.tiles.reduce((best,t,i)=>{
    if(t?.craft!==craft||t.stored<request.amount)return best;
    return best===-1||t.stored>s.tiles[best]!.stored?i:best;
  },-1);
  if(index===-1)return s;
  const tiles=s.tiles.slice();
  tiles[index]={...tiles[index]!,stored:tiles[index]!.stored-request.amount};
  return {...s,coins:s.coins+request.reward,tiles,
    market:{day:s.day,kind},residentsHelped:(s.residentsHelped??0)+1};
}
/** Shows the actual resource constraint behind the visitor choice. */
export function residentRequestStock(s:WorkshopState):number {
  const kind=residentForDay(s.day);
  if(kind==='residentCore')return s.warehouse.core;
  const craft=kind==='residentWater'?'well':'garden';
  return Math.max(0,...s.tiles.filter(t=>t?.craft===craft).map(t=>t!.stored));
}
export function residentRequestAvailable(s:WorkshopState):boolean {
  const request=TOWN_RESIDENTS[residentForDay(s.day)];
  return s.market?.day!==s.day&&residentRequestStock(s)>=request.amount
    &&(s.residentsHelped??0)<Number.MAX_SAFE_INTEGER
    &&Number.isSafeInteger(s.coins+request.reward);
}

