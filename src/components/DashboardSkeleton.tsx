export function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-background p-4 space-y-4 animate-pulse">
      <div className="flex justify-between items-center">
        <div className="h-6 w-40 rounded-md bg-muted" />
        <div className="h-9 w-24 rounded-md bg-muted" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-32 rounded-xl bg-muted" />
        ))}
      </div>

      <div className="space-y-3">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="h-48 rounded-xl bg-muted" />
        ))}
      </div>

      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-16 rounded-lg bg-muted" />
        ))}
      </div>
    </div>
  );
}
