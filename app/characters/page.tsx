import type {Metadata} from 'next';
import {MoonworkWorld} from '@/components/moonwork/world-ui';
export const metadata:Metadata={title:'角色收藏与图鉴 | 怪物公寓'};
export default function Page(){return <MoonworkWorld area="characters"/>;}
