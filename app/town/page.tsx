import type {Metadata} from 'next';
import {MoonworkWorld} from '@/components/moonwork/world-ui';
export const metadata:Metadata={title:'月光街 | 月光工坊'};
export default function Page(){return <MoonworkWorld area="town"/>;}
