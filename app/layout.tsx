import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import './globals.css';

export const metadata: Metadata = {
  title: '灵核公寓 · Spirit Core Residence',
  description: '原创灵核收集、五品质召唤、养成进化与六房五夜公寓经营。',
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
