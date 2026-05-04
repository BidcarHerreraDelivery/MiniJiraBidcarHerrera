import { forwardRef } from 'react';
import type { Ticket, TicketPriority } from '../../../types';
import { cn } from '../../../lib/utils';
import { PriorityChip } from './PriorityChip';
import { AssigneeBadge } from './AssigneeBadge';

const PRIORITY_BORDER: Record<TicketPriority, string> = {
  alta:  'var(--error)',
  media: 'var(--tertiary)',
  baja:  'var(--primary)',
};

function formatTicketId(id: string): string {
  const suffix = id.split('-').slice(-1)[0].toUpperCase().slice(0, 4);
  return `CV-${suffix}`;
}

function formatRelativeDate(dateString: string): string {
  const diffMs   = Date.now() - new Date(dateString).getTime();
  const diffDays = Math.floor(diffMs / 86_400_000);
  if (diffDays === 0) {
    const h = Math.floor(diffMs / 3_600_000);
    return h === 0 ? 'ahora' : `${h}h`;
  }
  if (diffDays < 7) return `${diffDays}d`;
  return `${Math.floor(diffDays / 7)}sem`;
}

export interface TaskCardDisplayProps extends React.HTMLAttributes<HTMLDivElement> {
  ticket:      Ticket;
  isDragging?: boolean;
  isPending?:  boolean;
  /** Props del drag handle inyectadas por el wrapper DnD */
  dragHandle?: React.HTMLAttributes<HTMLDivElement> | null;
  onClick?:    () => void;
}

export const TaskCardDisplay = forwardRef<HTMLDivElement, TaskCardDisplayProps>(
  function TaskCardDisplay(
    { ticket, isDragging = false, isPending = false, dragHandle, onClick, style, className, ...rest },
    ref
  ) {
    const isDone = ticket.status === 'listo';

    return (
      <div
        ref={ref}
        {...rest}
        className={cn(
          'relative rounded-xl transition-shadow overflow-hidden border border-outline-variant border-l-4',
          isDragging  ? 'shadow-xl rotate-1 opacity-95' : 'shadow-sm hover:shadow-md',
          isDone      && 'opacity-75',
          className
        )}
        style={{
          ...style,
          backgroundColor:  'var(--surface-container-lowest)',
          borderLeftColor:  PRIORITY_BORDER[ticket.priority],
        }}
      >
        {/* Pending overlay */}
        {isPending && (
          <div
            className="absolute inset-0 rounded-xl pointer-events-none animate-pulse"
            style={{ backgroundColor: 'var(--primary)', opacity: 0.06 }}
          />
        )}

        {/* Drag handle zone */}
        <div {...(dragHandle ?? {})} className="px-4 pt-4 pb-0 cursor-grab active:cursor-grabbing">
          {/* Top row: priority chip + ticket ID */}
          <div className="flex justify-between items-start mb-2">
            <PriorityChip priority={ticket.priority} />
            <span className="text-[11px]" style={{ color: 'var(--on-surface-variant)' }}>
              {formatTicketId(ticket.id)}
            </span>
          </div>

          {/* Title */}
          <h4
            className={cn('text-[15px] font-semibold leading-snug mb-3 line-clamp-2', isDone && 'line-through')}
            style={{ color: 'var(--on-surface)' }}
          >
            {ticket.title}
          </h4>

          {/* Labels */}
          {ticket.labels.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {ticket.labels.map((label) => (
                <span
                  key={label.id}
                  className="text-[10px] font-medium px-2 py-0.5 rounded"
                  style={{
                    backgroundColor: 'var(--secondary-container)',
                    color:           'var(--on-secondary-container)',
                  }}
                >
                  {label.name}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Footer — click opens detail */}
        <div
          role="button"
          tabIndex={0}
          onClick={onClick}
          onKeyDown={(e) => e.key === 'Enter' && onClick?.()}
          className="px-4 py-3 flex items-center justify-between gap-2 cursor-pointer"
        >
          <span
            className="text-[12px] flex items-center gap-1"
            style={{ color: 'var(--on-surface-variant)' }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>schedule</span>
            {formatRelativeDate(ticket.createdAt)}
          </span>
          <AssigneeBadge assignee={ticket.assignedTo} />
        </div>
      </div>
    );
  }
);
