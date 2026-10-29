import type {Metadata} from 'next';
import {CharactersSceneRouter} from '@/components/moonwork/characters-scene-router';
export const metadata:Metadata={title:'角色收藏与图鉴 | 怪物公寓'};
export default function Page(){return <CharactersSceneRouter/>;}
