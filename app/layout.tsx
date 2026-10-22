import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import './globals.css';

export const metadata: Metadata = {
  title: '灵核公寓 · Spirit Core Residence',
  description: '在同一座灵核公寓中调配住户、控制能源、种植食物并抵御入侵。一个可互动的实时经营生存原型。',
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
      <body>{children}</body>
    </html>
  );
}
