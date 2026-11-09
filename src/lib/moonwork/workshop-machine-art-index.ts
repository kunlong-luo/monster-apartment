import type {Craft} from '../../../v2/src/workshop-model';

type Level='1'|'2'|'3';
export type ApprovedMachineUrls=Partial<Record<Craft,Partial<Record<Level,string>>>>;
const CRAFTS=['well','garden','kiln'] as const;
const LEVELS=['1','2','3'] as const;

function record(value:unknown):value is Record<string,unknown>{
  return value!==null&&typeof value==='object'&&!Array.isArray(value);
}

/** Only the explicit READY build index may supply the public PC panoramic
 * machines. Unapproved candidates are never silently activated. Strict exact
 * paths reject traversal, unexpected origin, and obsolete machine variants.
 * The Pixi 15-grid stage has its own decoder and shares this build index.
 */
export function approvedMachineUrls(index:unknown,assetRoot:string):ApprovedMachineUrls{
  if(!record(index)||index.schemaVersion!==1||!record(index.machines))return {};
  let base:URL;
  try{
    base=new URL(assetRoot);
    if(base.protocol!=='http:'&&base.protocol!=='https:')return {};
  }catch{return {};}
  const machines=index.machines;
  const result:ApprovedMachineUrls={};
  for(const craft of CRAFTS){
    const byLevel=machines[craft];
    if(!record(byLevel))continue;
    for(const level of LEVELS){
      const path=byLevel[level];
      const expected='production/machines/'+craft+'/lv'+level+'.webp';
      if(path!==expected)continue;
      (result[craft]??={})[level]=new URL('assets/'+expected,base).href;
    }
  }
  return result;
}
