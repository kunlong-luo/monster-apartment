import {Suspense} from 'react';
import type {Metadata} from 'next';
import {MoonworkWorld} from '@/components/moonwork/world-ui';
export const metadata:Metadata={title:'委托大厅 | 月光工坊'};
// R12 research query is now live App Router state; Suspense retains static export.
export default function Page(){
  return <Suspense fallback={<main className="grid h-dvh place-items-center bg-gothic-night text-gothic-ivory"
    aria-label="正在整理委托大厅">☾ 正在整理委托大厅…</main>}>
    <MoonworkWorld area="orders"/>
  </Suspense>;
}
