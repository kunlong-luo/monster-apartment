import type {Metadata} from 'next';
import {Suspense} from 'react';
import {CharactersSceneRouter} from '@/components/moonwork/characters-scene-router';
export const metadata:Metadata={title:'角色收藏与图鉴 | 怪物公寓'};
export default function Page(){
  return <Suspense fallback={<main className="h-dvh bg-[#100910]" aria-label="加载人物收藏"/>}>
    <CharactersSceneRouter/>
  </Suspense>;
}
