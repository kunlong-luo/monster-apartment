'use client';
import dynamic from 'next/dynamic';
const CozyClientGame=dynamic(()=>import('./cozy-apartment').then(m=>m.CozyApartment),{
  ssr:false,loading:()=> <main className="cozy-loading">☾ 月光街正在亮灯…</main>,
});
export function CozyClient(){return <CozyClientGame/>;}
