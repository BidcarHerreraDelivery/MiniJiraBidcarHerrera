import { useFilterStore } from '../store/filterStore';
import type { TicketStatus, TicketPriority } from '../../../types';

const fieldClass =
  'border border-outline-variant rounded bg-surface-container-lowest px-3 py-1.5 text-[13px] ' +
  'text-on-surface placeholder:text-outline ' +
  'focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors';

export function TicketFilters() {
  const { filters, setFilters } = useFilterStore();

  return (
    <div className="flex flex-wrap gap-3 px-4 py-3 bg-surface-container-low rounded-lg border border-outline-variant">
      <input
        type="text"
        placeholder="Buscar por título o descripción…"
        value={filters.search ?? ''}
        onChange={(e) => setFilters({ ...filters, search: e.target.value || undefined })}
        className={`${fieldClass} w-56`}
      />
      <select
        value={filters.priority?.[0] ?? ''}
        onChange={(e) =>
          setFilters({ ...filters, priority: e.target.value ? [e.target.value as TicketPriority] : undefined })
        }
        className={fieldClass}
      >
        <option value="">Prioridad</option>
        <option value="alta">Alta</option>
        <option value="media">Media</option>
        <option value="baja">Baja</option>
      </select>
      <select
        value={filters.status?.[0] ?? ''}
        onChange={(e) =>
          setFilters({ ...filters, status: e.target.value ? [e.target.value as TicketStatus] : undefined })
        }
        className={fieldClass}
      >
        <option value="">Estado</option>
        <option value="por_hacer">Por hacer</option>
        <option value="en_progreso">En progreso</option>
        <option value="review">Review</option>
        <option value="bloqueado">Bloqueado</option>
        <option value="listo">Listo</option>
      </select>
    </div>
  );
}
