type ProgressBarProps = {
  value: number;
  max: number;
  label: string;
};

export function ProgressBar({ value, max, label }: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, Math.round((value / max) * 100)));

  return (
    <div className="w-full" role="progressbar" aria-valuenow={clamped} aria-valuemin={0} aria-valuemax={100} aria-label={label}>
      <div className="flex justify-between text-xs text-mist-500 mb-1">
        <span>{label}</span>
        <span>{value} / {max}</span>
      </div>
      <div className="h-2.5 bg-[#17162a] rounded-full overflow-hidden border border-[#6c5b6d]">
        <div
          className="h-full bg-gradient-to-r from-[#d2a5dd] via-[#eab48a] to-[#ffde9f] transition-all duration-200"
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}