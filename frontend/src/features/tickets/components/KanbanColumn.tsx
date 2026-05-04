import { Droppable } from '@hello-pangea/dnd';
import type { Ticket, TicketStatus } from '../../../types';
import { cn } from '../../../lib/utils';
import { TaskCard } from './TaskCard';
import { KanbanColumnEmpty } from './KanbanColumnEmpty';

export interface ColumnConfig {
  status:      TicketStatus;
  label:       string;
  collapsible: boolean;
}

const STATUS_BADGE: Record<TicketStatus, { bg: string; color: string }> = {
  por_hacer:   { bg: 'var(--surface-container-high)',  color: 'var(--on-surface-variant)'         },
  en_progreso: { bg: 'var(--primary-fixed)',           color: 'var(--on-primary-fixed-variant)'   },
  review:      { bg: 'var(--tertiary-fixed)',          color: 'var(--on-tertiary-fixed-variant)'  },
  listo:       { bg: 'var(--secondary-fixed-dim)',     color: 'var(--on-secondary-fixed)'         },
  bloqueado:   { bg: 'var(--error-container)',         color: 'var(--on-error-container)'         },
};

interface KanbanColumnProps {
  config:            ColumnConfig;
  tickets:           Ticket[];
  collapsed?:        boolean;
  onToggleCollapse?: () => void;
}

export function KanbanColumn({ config, tickets, collapsed, onToggleCollapse }: KanbanColumnProps) {
  const { status, label, collapsible } = config;
  const badge = STATUS_BADGE[status];

  return (
    <div className={cn('flex flex-col shrink-0 gap-3', collapsed ? 'w-12' : 'w-80')}>

      {/* Column header — no background, transparent */}
      <div
        className={cn(
          'flex items-center justify-between px-2 py-1 select-none',
          collapsible && 'cursor-pointer'
        )}
        onClick={collapsible ? onToggleCollapse : undefined}
      >
        {collapsed ? (
          <span className="text-[11px] mx-auto" style={{ color: 'var(--on-surface-variant)' }}>▶</span>
        ) : (
          <>
            <div className="flex items-center gap-2">
              <h3
                className="text-[12px] font-semibold tracking-wider uppercase"
                style={{ color: 'var(--on-surface-variant)' }}
              >
                {label}
              </h3>
              <span
                className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                style={{ backgroundColor: badge.bg, color: badge.color }}
              >
                {tickets.length}
              </span>
            </div>
            <button
              className="p-1 rounded transition-colors"
              style={{ color: 'var(--on-surface-variant)' }}
              onClick={(e) => e.stopPropagation()}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>more_horiz</span>
            </button>
          </>
        )}
      </div>

      {/* Drop zone */}
      {!collapsed && (
        <Droppable droppableId={status}>
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className="flex flex-col gap-3 min-h-[120px] rounded-lg transition-all"
              style={{
                backgroundColor: snapshot.isDraggingOver ? 'var(--surface-container)' : 'transparent',
                outline:         snapshot.isDraggingOver ? '2px solid var(--primary)' : 'none',
                outlineOffset:   '-2px',
                padding:         snapshot.isDraggingOver ? '8px' : '0',
              }}
            >
              {tickets.length === 0 && !snapshot.isDraggingOver
                ? <KanbanColumnEmpty />
                : tickets.map((t, i) => <TaskCard key={t.id} ticket={t} index={i} />)
              }
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      )}
    </div>
  );
}
