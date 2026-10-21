import { Button } from '@/components/ui/button';
import { Panel } from '@/components/ui/panel';
import { SectionHeading } from '@/components/ui/section-heading';
import { cn } from '@/components/ui/cn';
import type { RoomSlot } from '@/core/engine';
import { useGameStore } from '@/store/game-store';
import { t } from '@/lib/i18n';

type RoomPickerProps = {
  rooms: RoomSlot[];
  selected: number | null;
  moveSource: number | null;
  disabled: boolean;
  onPick: (index: number) => void;
};

export function RoomPicker({ rooms, selected, moveSource, disabled, onPick }: RoomPickerProps) {
  const locale = useGameStore((store) => store.locale);
  return (
    <Panel>
      <SectionHeading title={t(locale, 'pickRoom')} />
      <div
        role="group"
        aria-label={t(locale, 'pickRoom')}
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
              aria-label={locale === 'zh' ? String(index + 1) + ' 号房' + (isOccupied ? '（已入住）' : '（空房）') : 'Room ' + (index + 1) + ' (' + t(locale, isOccupied ? 'occupiedRoom' : 'vacantRoom') + ')'}
              aria-pressed={isSelected}
              className={cn(
                'py-2 text-sm font-bold',
                isSelected && 'bg-gradient-to-r from-mint-400 to-mint-500 text-mint-900',
                isMoving && 'border-danger-300',
              )}
            >
              {locale === 'zh' ? String(index + 1) + ' 号房' : 'Room ' + (index + 1)}
            </Button>
          );
        })}
      </div>
      <p className="hint text-mist-500 text-xs mt-2 leading-relaxed">
        {moveSource !== null
          ? t(locale, 'moveHint')
          : t(locale, 'pickHint')}
      </p>
    </Panel>
  );
}