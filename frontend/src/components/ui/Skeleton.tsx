import type { CSSProperties } from 'react';
import { cn } from '@/lib/cn';

export function Skeleton({
  className,
  style,
}: {
  className?: string;
  style?: CSSProperties;
}) {
  return <div className={cn('skeleton', className)} style={style} aria-hidden="true" />;
}

/** Full-card loading placeholder used while an analysis is in flight. */
export function ChartSkeleton({ height = 320 }: { height?: number }) {
  return (
    <div className="space-y-3" role="status" aria-label="Loading chart">
      <Skeleton className="h-4 w-40" />
      <Skeleton className="w-full" style={{ height }} />
      <div className="flex gap-3">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-20" />
      </div>
      <span className="sr-only">Loading…</span>
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="card p-5">
      <Skeleton className="h-3 w-24" />
      <Skeleton className="mt-3 h-7 w-32" />
      <Skeleton className="mt-2 h-3 w-16" />
    </div>
  );
}
