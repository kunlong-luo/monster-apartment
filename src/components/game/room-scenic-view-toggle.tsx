'use client';
import {PanelRightClose,PanelRightOpen} from 'lucide-react';

/** Reuse one viewing action in each resident room; existing story mechanics and
 * hotspots remain mounted and accessible whenever story view is restored.
 * This is a layout choice, not a player-save or gameplay state. */
export function RoomScenicViewToggle({scenic,onToggle,blocked=false}:{scenic:boolean;onToggle:()=>void;blocked?:boolean}){
  return <button type="button" data-testid="room-scenic-toggle"
    aria-pressed={scenic} disabled={blocked} aria-label={scenic?'返回故事视图':'放大观赏房间'}
    title={blocked?'请先完成当前交谈':scenic?'返回故事视图':'放大观赏房间'}
    onClick={onToggle}
    className="absolute right-3 top-3 z-[8] hidden min-h-11 items-center gap-2 rounded-md
      border border-gothic-brass/70 bg-gothic-panel/90 px-3 py-2
      text-xs text-gothic-ivory shadow-[0_8px_24px_#0008] backdrop-blur-sm
      hover:border-gothic-glow hover:bg-gothic-wine disabled:cursor-not-allowed disabled:opacity-45
      focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gothic-glow
      lg:inline-flex">
    {scenic?<PanelRightOpen aria-hidden="true" size={16} strokeWidth={1.6}/>:
      <PanelRightClose aria-hidden="true" size={16} strokeWidth={1.6}/>}
    <span>{scenic?'返回故事':'观赏场景'}</span>
  </button>;
}
