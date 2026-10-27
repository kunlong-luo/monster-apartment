import type {ReactNode} from 'react';
import '@/styles/legacy-game.css';

/** Historical save compatibility route; does not load on modern game pages. */
export default function LegacyGameLayout({children}:{children:ReactNode}){
  return <>{children}</>;
}
