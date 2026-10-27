import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import './globals.css';
import {GothicRouteTransition} from '@/components/game/gothic-route-transition';

export const metadata: Metadata = {
  title: '灵核公寓 · Spirit Core Residence',
  description: '在月光街亲手建造三层小公寓，迎接奇幻灵核住户，布置家具，经营房租，发现邻居间的小故事。',
  applicationName: 'Spirit Core Residence',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#181629',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>{children}<GothicRouteTransition/></body>
    </html>
  );
}
