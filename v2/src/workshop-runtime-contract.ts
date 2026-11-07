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

/** Purely transient: never saved to V2 workshop JSON. */
export type WorkshopPresentationMode='cinematic'|'grid';
export type WorkshopSelectionListener=
  (selection:WorkshopSelectionSnapshot)=>void;
/** Exhaustive React → game command protocol. The Pixi stage retains
 * pointer-based plot selection and calls the same runtime state machine.
 * Saved WorkshopState and all current DOM test IDs remain unchanged. */
export type WorkshopAction=
  |{type:'choose-worker';worker:WorkerId}
  |{type:'auto-assign'}
  |{type:'choose-machine';machine:Craft}
  |{type:'select-plot';index:number}
  |{type:'toggle-move'}
  |{type:'salvage'}
  |{type:'upgrade'}
  |{type:'shift'}
  |{type:'reset'}
  |{type:'accept-patron'}
  |{type:'import-patron-core'};

export type WorkshopRuntimeController=Readonly<{
  dispatch:(action:WorkshopAction)=>void;
  setPresentationMode:(mode:WorkshopPresentationMode)=>void;
  destroy:()=>void;
}>;
