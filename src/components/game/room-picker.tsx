import { Button } from '@/components/ui/button';
import { Panel } from '@/components/ui/panel';
import { SectionHeading } from '@/components/ui/section-heading';
import { cn } from '@/components/ui/cn';
import type { RoomSlot } from '@/core/engine';

type RoomPickerProps = {
  rooms: RoomSlot[];
  selected: number | null;
  moveSource: number | null;
  disabled: boolean;
  onPick: (index: number) => void;
};

export function RoomPicker({ rooms, selected, moveSource, disabled, onPick }: RoomPickerProps) {
  return (
    <Panel>
      <SectionHeading title="选择房间" />
      <div
        role="group"
        aria-label="选择房间"
        className="grid grid-cols-6 gap-1.5"
      >
        {rooms.map((room, index) => {
          const isSelected = selected === index;
          const isMoving = moveSource === index;
          const isOccupied = room !== null;

          return (
            <Button
              key={index}
              variant={isSelected ? 'primary' : isMoving ? 'danger' : 'secondary'}
              size="sm"
              fullWidth
              disabled={disabled}
              onClick={() => onPick(index)}
              aria-label={`${index + 1} 号房${isOccupied ? '（已入住）' : '（空房）'}`}
              aria-pressed={isSelected}
              className={cn(
                'py-2 text-sm font-bold',
                isSelected && 'bg-gradient-to-r from-mint-400 to-mint-500 text-mint-900',
                isMoving && 'border-danger-300',
              )}
            >
              {index + 1} 号房
            </Button>
          );
        })}
      </div>
      <p className="hint text-mist-500 text-xs mt-2 leading-relaxed">
        {moveSource !== null
          ? '点击另一间房完成搬家/交换'
          : '点击选择房间，再招募租客'}
      </p>
    </Panel>
  );
}