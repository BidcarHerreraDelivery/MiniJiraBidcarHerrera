export function TaskCardSkeleton() {
  return (
    <div
      className="rounded border shadow-sm animate-pulse"
      style={{
        backgroundColor: 'var(--surface-container-lowest)',
        borderColor: 'var(--outline-variant)',
      }}
    >
      <div className="px-4 pt-4 pb-2 space-y-2">
        <div
          className="h-3.5 rounded w-full"
          style={{ backgroundColor: 'var(--surface-container-high)' }}
        />
        <div
          className="h-3.5 rounded w-3/5"
          style={{ backgroundColor: 'var(--surface-container-high)' }}
        />
      </div>
      <div className="px-4 pb-3 flex items-center gap-2">
        <div
          className="h-5 w-12 rounded-sm"
          style={{ backgroundColor: 'var(--surface-container-high)' }}
        />
      </div>
    </div>
  );
}
