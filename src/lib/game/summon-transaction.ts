/**
 * Recoverable, two-key summon settlement for browsers using localStorage.
 *
 * localStorage.setItem is atomic PER KEY, not across two keys. A small
 * write-ahead journal lets the next game read resolve interrupted writes.
 * Never silently overwrite a third state that does not match the journal.
 *
 * This is not a cross-tab mutex. Conflicting writes are detected and blocked
 * conservatively rather than promising impossible multi-key atomicity.
 */
export const SUMMON_GACHA_KEY='monster-apartment:gacha-v2';
export const SUMMON_COLLECTION_KEY='monster-apartment:character-collection:v1';
export const PENDING_SUMMON_KEY='monster-apartment:summon-settlement:v1';

export type SummonStoragePair={gacha:string|null;collection:string|null};
type StoredSettlement={
  version:1;
  before:SummonStoragePair;
  after:{gacha:string;collection:string};
};
export type SettlementOutcome='applied'|'failed'|'pending';

function rawOrNull(value:unknown):value is string|null{
  return value===null||typeof value==='string';
}
function validSettlement(value:unknown):value is StoredSettlement{
  if(value===null||typeof value!=='object')return false;
  const s=value as Partial<StoredSettlement>;
  if(s.version!==1||!s.before||!s.after)return false;
  return rawOrNull(s.before.gacha)&&rawOrNull(s.before.collection)&&
    typeof s.after.gacha==='string'&&typeof s.after.collection==='string';
}
function readPair():SummonStoragePair{
  return {
    gacha:window.localStorage.getItem(SUMMON_GACHA_KEY),
    collection:window.localStorage.getItem(SUMMON_COLLECTION_KEY),
  };
}
function equals(a:SummonStoragePair,b:SummonStoragePair):boolean{
  return a.gacha===b.gacha&&a.collection===b.collection;
}
function restore(key:string,raw:string|null){
  if(raw===null)window.localStorage.removeItem(key);
  else window.localStorage.setItem(key,raw);
}

/**
 * Roll back an interrupted partial write. If BOTH target keys were saved,
 * finalize the committed operation instead; its draw must not be rerolled.
 * When restoration or journal cleanup fails, return false so all writers
 * refuse to modify existing player saves.
 */
export function recoverPendingSummon():boolean{
  if(typeof window==='undefined')return false;
  try{
    const raw=window.localStorage.getItem(PENDING_SUMMON_KEY);
    if(raw===null)return true;
    const value:unknown=JSON.parse(raw);
    if(!validSettlement(value))return false;
    const actual=readPair();
    const {before,after}=value;
    // Other game actions, including a competing browser tab, may have
    // changed one store. Do not clobber values outside this settlement.
    if(![before.gacha,after.gacha].includes(actual.gacha)||
       ![before.collection,after.collection].includes(actual.collection))return false;
    if(!equals(actual,after)&&!equals(actual,before)){
      if(actual.collection!==before.collection)restore(SUMMON_COLLECTION_KEY,before.collection);
      if(actual.gacha!==before.gacha)restore(SUMMON_GACHA_KEY,before.gacha);
      if(!equals(readPair(),before))return false;
    }
    window.localStorage.removeItem(PENDING_SUMMON_KEY);
    return true;
  }catch{return false;}
}

/**
 * A failed write is safe to retry only after journal recovery succeeds.
 * The 'pending' state means we cannot prove rollback/commit completion:
 * callers MUST NOT award another card or start another transaction.
 */
export function commitSummonTransaction(
  before:SummonStoragePair,after:{gacha:string;collection:string},
):SettlementOutcome{
  if(typeof window==='undefined'||!recoverPendingSummon())return 'pending';
  try{
    if(!equals(readPair(),before))return 'failed'; // stale state, retry with fresh state
    const pending:StoredSettlement={version:1,before,after};
    window.localStorage.setItem(PENDING_SUMMON_KEY,JSON.stringify(pending));
    window.localStorage.setItem(SUMMON_COLLECTION_KEY,after.collection);
    window.localStorage.setItem(SUMMON_GACHA_KEY,after.gacha);
    window.localStorage.removeItem(PENDING_SUMMON_KEY);
    return 'applied';
  }catch{
    // Marker removal can fail AFTER both keys were committed. Preserve that
    // result rather than reporting a false failure and risking a duplicate draw.
    let committed=false;
    try{committed=equals(readPair(),after);}catch{/* recovery will block */}
    if(!recoverPendingSummon())return 'pending';
    return committed?'applied':'failed';
  }
}
