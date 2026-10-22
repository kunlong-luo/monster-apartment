'use client';
import dynamic from 'next/dynamic';
const ClientSanctuary=dynamic(() => import('./living-apartment').then(m=>m.LivingApartment), {
  ssr:false,loading:()=> <main className="living-loading-screen">✧ 正在唤醒公寓…</main>,
});
export function LivingClient(){return <ClientSanctuary/>;}
