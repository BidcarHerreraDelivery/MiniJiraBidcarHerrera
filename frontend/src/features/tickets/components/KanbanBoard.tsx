import { DragDropContext, type DropResult } from '@hello-pangea/dnd';
import { useState, useCallback } from 'react';
import { useTickets } from '../hooks/useTickets';
import { KanbanColumn, type ColumnConfig } from './KanbanColumn';
import { TaskCardSkeleton } from './TaskCardSkeleton';
import type { TicketStatus } from '../../../types';
import { ticketsApi } from '../api/ticketsApi';
import { useQueryClient } from '@tanstack/react-query';

const COLUMN_CONFIG: ColumnConfig[] = [
  { status: 'por_hacer',   label: 'Por hacer',   collapsible: false },
  { status: 'en_progreso', label: 'En progreso', collapsible: false },
  { status: 'review',      label: 'Review',      collapsible: false },
  { status: 'listo',       label: 'Listo',       collapsible: false },
  { status: 'bloqueado',   label: 'Bloqueado',   collapsible: true  },
];

function BoardSkeleton() {
  return (
    <div className="flex gap-5 h-full pb-4">
      {[0, 1, 2].map((i) => (
        <div key={i} className="flex flex-col shrink-0 w-80 gap-3">
          <div className="h-7 w-32 rounded animate-pulse" style={{ backgroundColor: 'var(--surface-container-high)' }} />
          <div className="flex flex-col gap-3">
            <TaskCardSkeleton />
            <TaskCardSkeleton />
          </div>
        </div>
      ))}
    </div>
  );
}

export function KanbanBoard() {
  const { data, isLoading } = useTickets();
  const [collapsedCols, setCollapsedCols] = useState<Set<TicketStatus>>(new Set());
  const qc = useQueryClient();

  const toggleCollapse = useCallback((status: TicketStatus) => {
    setCollapsedCols((prev) => {
      const next = new Set(prev);
      next.has(status) ? next.delete(status) : next.add(status);
      return next;
    });
  }, []);

  const handleDragEnd = useCallback(async (result: DropResult) => {
    const { draggableId, destination } = result;
    if (!destination) return;

    const newStatus = destination.droppableId as TicketStatus;
    const ticket = data?.data.find((t) => t.id === draggableId);
    if (!ticket || ticket.status === newStatus) return;

    qc.setQueryData<{ data: typeof ticket[] }>(['tickets', {}], (old: any) => {
      if (!old) return old;
      return {
        ...old,
        data: old.data.map((t: typeof ticket) =>
          t.id === draggableId ? { ...t, status: newStatus } : t
        ),
      };
    });

    try {
      await ticketsApi.update(ticket.id, { status: newStatus, updatedAt: ticket.updatedAt });
      qc.invalidateQueries({ queryKey: ['tickets'] });
    } catch {
      qc.invalidateQueries({ queryKey: ['tickets'] });
    }
  }, [data, qc]);

  if (isLoading) return <BoardSkeleton />;

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="flex gap-5 h-full pb-4">
        {COLUMN_CONFIG.map((col) => (
          <KanbanColumn
            key={col.status}
            config={col}
            tickets={data?.data.filter((t) => t.status === col.status) ?? []}
            collapsed={col.collapsible ? collapsedCols.has(col.status) : undefined}
            onToggleCollapse={col.collapsible ? () => toggleCollapse(col.status) : undefined}
          />
        ))}

        {/* Nueva columna placeholder */}
        <div className="flex flex-col shrink-0 w-80 pt-8">
          <button
            className="w-full h-12 border-2 border-dashed rounded-xl flex items-center justify-center gap-2 text-sm font-medium transition-all"
            style={{
              borderColor: 'var(--outline-variant)',
              color:       'var(--outline)',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--primary)';
              (e.currentTarget as HTMLButtonElement).style.color = 'var(--primary)';
              (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--surface-container)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--outline-variant)';
              (e.currentTarget as HTMLButtonElement).style.color = 'var(--outline)';
              (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent';
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>add</span>
            Nueva columna
          </button>
        </div>
      </div>
    </DragDropContext>
  );
}
