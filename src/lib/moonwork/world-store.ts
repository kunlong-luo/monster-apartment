import {acceptPatronCommission,importPatronCore,acceptPremiumOrder,buyTownSupply,deliverResidentRequest} from '../../../v2/src/workshop-engine';
import {WORKSHOP_SAVE_KEY,WORKSHOP_CHANGE_EVENT,parseWorkshopSnapshot,transactWorkshopSave} from '../../../v2/src/workshop-save-transaction';
import type {WorkshopState} from '../../../v2/src/workshop-engine';

export const SAVE_KEY=WORKSHOP_SAVE_KEY;
export const CHANGE_EVENT=WORKSHOP_CHANGE_EVENT;
export const parseSavedWorld=parseWorkshopSnapshot;
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
/** All market and contract actions use the same exclusive V2 save lock. */
export async function commitWorldAction(
  store:SaveStorage,action:WorldAction,locks:LockManager|null|undefined,
  onApplied?:()=>void
):Promise<ActionStatus>{
  const status=await transactWorkshopSave(
    store,locks,world=>reduceWorldAction(world,action),onApplied
  );
  return status==='unchanged'?'unavailable':
    status==='applied'||status==='missing'||status==='unavailable'?status:'error';
}
