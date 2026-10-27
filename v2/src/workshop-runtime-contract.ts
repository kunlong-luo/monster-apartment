import type {Craft,WorkerId} from './workshop-model';

/** The Pixi runtime publishes immutable UI-selection snapshots to React.
 * No DOM dataset serialization, parsing or mirrored mutable toolbar.
 * Bundled IIFE and React use this type-only contract independently. */
export type WorkshopSelectionSnapshot=Readonly<{
  worker:WorkerId|null;
  machine:Craft|null;
  movingFrom:number|null;
  selectedPlot:number|null;
}>;

export type WorkshopSelectionListener=
  (selection:WorkshopSelectionSnapshot)=>void;
