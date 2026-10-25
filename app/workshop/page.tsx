import type {Metadata} from 'next';
import {readFileSync} from 'node:fs';
import {join} from 'node:path';
import {WorkshopClient} from '@/components/moonwork/workshop-client';

export const metadata:Metadata={
  title:'生产工坊 | 月光工坊 V2.3',
  description:'在可交互的 PixiJS 工坊经营晶核生产线、派工与月纱委托。',
};

// The tracked standalone HTML is the single source of truth for controls.
// The Next page owns its lifecycle; the legacy app still uses the same DOM.
const document=readFileSync(join(process.cwd(),'v2/index.html'),'utf8');
const gameMarkup=document.match(/<main id="root"[\s\S]*?<\/main>/)?.[0];
if(!gameMarkup)throw Error('V2 gameplay markup was not found.');
export default function WorkshopPage(){
  return <WorkshopClient markup={gameMarkup}/>;
}
