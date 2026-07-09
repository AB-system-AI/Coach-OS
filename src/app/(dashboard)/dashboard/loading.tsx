export default function DashboardLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Header skeleton */}
      <div className="space-y-2">
        <div className="h-8 bg-muted rounded-md w-48" />
        <div className="h-4 bg-muted rounded-md w-80" />
      </div>

      {/* Stats row skeleton */}
      <div className="grid gap-4 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-xl border bg-card p-6 space-y-2">
            <div className="h-3 bg-muted rounded w-16" />
            <div className="h-7 bg-muted rounded w-12" />
          </div>
        ))}
      </div>

      {/* Content skeleton */}
      <div className="rounded-xl border bg-card p-6 space-y-4">
        <div className="h-5 bg-muted rounded w-32" />
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex justify-between py-3 border-b last:border-0">
            <div className="space-y-2">
              <div className="h-4 bg-muted rounded w-40" />
              <div className="h-3 bg-muted rounded w-24" />
            </div>
            <div className="h-6 bg-muted rounded w-16" />
          </div>
        ))}
      </div>
    </div>
  );
}
