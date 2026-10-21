type ApartmentSkeletonProps = {
  message?: string;
  className?: string;
};

export function ApartmentSkeleton({
  message = '正在加载公寓地图…',
  className = '',
}: ApartmentSkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={`grid min-h-[22.5rem] animate-pulse place-items-center rounded-2xl border border-line-strong bg-ink-900 text-[13px] text-mist-500 ${className}`}
    >
      {message}
    </div>
  );
}
