import type { RoomSlot } from '@/core/engine';

export type RoomMotionEvent = 'none' | 'arrival' | 'rearranged' | 'vacated';

/** Compare occupancy, not selection or language, so redraws never replay move effects.
 * The initial hydration render intentionally has no transient effects. */
export function roomMotionEvents(
  previous: readonly RoomSlot[] | null,
  current: readonly RoomSlot[],
): RoomMotionEvent[] {
  if (!previous) return current.map(() => 'none');
  return current.map((tenant, index) => {
    const before = previous[index] ?? null;
    if (before === tenant) return 'none';
    if (!tenant) return 'vacated';
    if (!before && !previous.includes(tenant)) return 'arrival';
    return 'rearranged';
  });
}
