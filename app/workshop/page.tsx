import type {Metadata} from 'next';
import {WorkshopClient} from '@/components/moonwork/workshop-client';

export const metadata: Metadata = {
  title: '生产工坊 | 月光工坊',
  description: '在可交互的 PixiJS 工坊经营晶核生产线、派工与月纱委托。',
};

export default function WorkshopPage() {
  return <WorkshopClient />;
}
