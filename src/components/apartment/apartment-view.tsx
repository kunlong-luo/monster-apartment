'use client';

import dynamic from 'next/dynamic';
import type { GameState } from '@/core/engine';
import type { Locale } from '@/lib/i18n';
import { ApartmentSkeleton } from './apartment-skeleton';

// Phaser is ~1 MB of canvas engine. Next keeps it out of the first payload and
// only ever evaluates it in the browser (`ssr: false`), never on the server.
const ApartmentCanvas = dynamic(
  () => import('./apartment-canvas').then((module) => module.ApartmentCanvas),
  { ssr: false, loading: () => <ApartmentSkeleton /> },
);

type ApartmentViewProps = {
  state: GameState;
  locale: Locale;
  selected: number | null;
  moveSource: number | null;
  onPick: (index: number) => void;
};

export function ApartmentView(props: ApartmentViewProps) {
  return <ApartmentCanvas {...props} />;
}
