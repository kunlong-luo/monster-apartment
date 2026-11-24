import {Suspense} from 'react';
import {GothicApartment} from '@/components/game/gothic-apartment';

// The apartment's Moonveil deep link reads useSearchParams and must remain
// statically exportable under Next App Router.
export default function ApartmentPage(){
  return <Suspense fallback={<main className="grid min-h-dvh place-items-center bg-gothic-night text-gothic-ivory"
    aria-label="正在开启公寓房门">☾ 公寓正在点亮烛火…</main>}>
    <GothicApartment/>
  </Suspense>;
}
