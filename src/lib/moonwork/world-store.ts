import {acceptPatronCommission,importPatronCore,acceptPremiumOrder,buyTownSupply,deliverResidentRequest,validWorkshop} from '../../../v2/src/workshop-engine';
import type {WorkshopState} from '../../../v2/src/workshop-engine';

export const SAVE_KEY='monster-apartment:workshop-v2-lab';
export const CHANGE_EVENT='moonwork:v2-update';

export function parseSavedWorld(raw:string|null):WorkshopState|null {
  if(!raw)return null;
  try{const data:unknown=JSON.parse(raw);return validWorkshop(data)?data:null;}
  catch{return null;}
}
type SaveStorage=Pick<Storage,'getItem'|'setItem'>;
export type WorldAction='accept'|'import'|'premium'|'marketWater'|'marketFiber'|'marketCore'|'resident';
export type ActionStatus='applied'|'missing'|'unavailable'|'error';
/** One authoritative domain reducer shared by town, orders and warehouse. */
export function reduceWorldAction(world:WorkshopState,action:WorldAction):WorkshopState {
  return action==='accept'?acceptPatronCommission(world):
    action==='premium'?acceptPremiumOrder(world):
    action==='marketWater'?buyTownSupply(world,'water'):
    action==='marketFiber'?buyTownSupply(world,'fiber'):
    action==='marketCore'?buyTownSupply(world,'core'):
    action==='resident'?deliverResidentRequest(world):importPatronCore(world);
}
export function commitWorldAction(store:SaveStorage,action:WorldAction):ActionStatus {
  let raw:string|null;
  try{raw=store.getItem(SAVE_KEY);}catch{return 'error';}
  const world=parseSavedWorld(raw);
  if(!world)return 'missing';
  const next=reduceWorldAction(world,action);
  if(next===world)return 'unavailable';
  try{store.setItem(SAVE_KEY,JSON.stringify(next));return 'applied';}
  catch{return 'error';}
}
