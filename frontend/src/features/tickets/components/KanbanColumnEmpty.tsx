export function KanbanColumnEmpty() {
  return (
    <div className="flex items-center justify-center min-h-[200px]">
      <p
        className="text-[13px] italic"
        style={{ color: 'var(--on-surface-variant)' }}
      >
        No hay tickets aquí
      </p>
    </div>
  );
}
