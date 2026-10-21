import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import './globals.css';

export const metadata: Metadata = {
  title: '怪物租客公寓 · Monster Apartment',
  description: '六房五日经营原型：招募怪物租客，经营相邻组合，撑过五个夜晚。',
  applicationName: 'Monster Apartment',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0b1420',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
