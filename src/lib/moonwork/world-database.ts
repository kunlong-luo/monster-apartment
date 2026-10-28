import Dexie from 'dexie';
import {validWorkshop} from '../../../v2/src/workshop-engine';
import type {WorkshopState} from '../../../v2/src/workshop-engine';
import {SAVE_KEY} from './world-store';

/** Local-first backup. The existing synchronous V2 save remains the runtime
 * source of truth while Dexie provides a durable, indexed recovery copy. */
type SaveRecord={key:string;day:number;updatedAt:number;payload:WorkshopState};
let database:Dexie|null=null;
let writes:Promise<void>=Promise.resolve();

function openDatabase():Dexie|null{
  if(typeof window==='undefined'||!('indexedDB' in window))return null;
  if(!database){
    database=new Dexie('moonwork-local-v1');
    database.version(1).stores({saves:'key,day,updatedAt'});
  }
  return database;
}

export async function readWorkshopBackup():Promise<WorkshopState|null>{
  const db=openDatabase();
  if(!db)return null;
  try{
    const entry=await db.table<SaveRecord,string>('saves').get(SAVE_KEY);
    return entry&&validWorkshop(entry.payload)?entry.payload:null;
  }catch{
    // Private browsing and storage quota restrictions must not block the game.
    return null;
  }
}

/** Serialized writes prevent a slow IndexedDB request from restoring an older
 * snapshot over a newer day. No unbounded per-shift history is accumulated. */
export function mirrorWorkshopSave(world:WorkshopState):void{
  const db=openDatabase();
  if(!db)return;
  const payload=world;
  writes=writes.catch(()=>undefined).then(async()=>{
    await db.table<SaveRecord,string>('saves').put({
      key:SAVE_KEY,day:payload.day,updatedAt:Date.now(),payload,
    });
  });
  void writes.catch(()=>undefined);
}
