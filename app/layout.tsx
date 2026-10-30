import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import './globals.css';
import '@/components/game/gothic-red-gold.css';
import '@/components/game/gothic-desktop-ui.css';
import {GothicRouteTransition} from '@/components/game/gothic-route-transition';
import {GameReleaseNotice} from '@/components/game/game-release-notice';

export const metadata: Metadata = {
  title: '怪物公寓 · Monster Apartment',
  description: '走进月光街的怪物公寓，拜访独立角色房间、探索隐藏线索、经营晶核工坊，逐步揭开月纱与住客的故事。',
  applicationName: 'Monster Apartment',
  openGraph: {
    title: '怪物公寓 · Monster Apartment',
    description: '经营晶核工坊、探索月光街、拜访怪物公寓住客的独立房间，收集记忆与故事。',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#160a17',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>{children}<GothicRouteTransition/><GameReleaseNotice/></body>
    </html>
  );
}
