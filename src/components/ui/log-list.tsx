import { cn } from './cn';

type LogListProps = {
  entries: string[];
  empty: string;
};

export function LogList({ entries, empty }: LogListProps) {
  return (
    <div
      className={cn(
        'max-h-[253px] overflow-y-auto space-y-1.5',
        'text-xs text-mist-400 font-mono',
        'scrollbar-thin scrollbar-thumb-line-strong scrollbar-track-ink-800',
      )}
      aria-live="polite"
      aria-atomic="false"
    >
      {entries.length === 0 ? (
        <p className="text-mist-500 text-center py-4">{empty}</p>
      ) : (
        entries.map((entry, index) => (
          <p key={index} className="whitespace-pre-wrap break-words">
            {entry}
          </p>
        ))
      )}
    </div>
  );
}