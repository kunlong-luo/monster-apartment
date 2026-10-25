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
export function commitWorldAction(store:SaveStorage,action:WorldAction):ActionStatus {
  let raw:string|null;
  try{raw=store.getItem(SAVE_KEY);}catch{return 'error';}
  const world=parseSavedWorld(raw);
  if(!world)return 'missing';
  const next=action==='accept'?acceptPatronCommission(world):
    action==='premium'?acceptPremiumOrder(world):
    action==='marketWater'?buyTownSupply(world,'water'):
    action==='marketFiber'?buyTownSupply(world,'fiber'):
    action==='marketCore'?buyTownSupply(world,'core'):
    action==='resident'?deliverResidentRequest(world):
    importPatronCore(world);
  if(next===world)return 'unavailable';
  try{store.setItem(SAVE_KEY,JSON.stringify(next));return 'applied';}
  catch{return 'error';}
}
