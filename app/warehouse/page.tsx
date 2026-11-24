import {Suspense} from 'react';
import type {Metadata} from 'next';
import {MoonworkWorld} from '@/components/moonwork/world-ui';
export const metadata:Metadata={title:'魔法仓库 | 月光工坊'};
// R12 research query is now live App Router state; Suspense retains static export.
export default function Page(){
  return <Suspense fallback={<main className="grid h-dvh place-items-center bg-gothic-night text-gothic-ivory"
    aria-label="正在开启魔法仓库">☾ 正在开启魔法仓库…</main>}>
    <MoonworkWorld area="warehouse"/>
  </Suspense>;
}
