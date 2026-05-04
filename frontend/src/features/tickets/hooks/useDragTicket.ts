import { ticketsApi } from '../api/ticketsApi';
import { useQueryClient } from '@tanstack/react-query';
import type { DropResult } from '@hello-pangea/dnd';
import type { Ticket, TicketStatus } from '../../../types';

export function useDragTicket(tickets: Ticket[]) {
  const qc = useQueryClient();

  const handleDragEnd = (result: DropResult) => {
    const { draggableId, destination } = result;
    if (!destination) return;

    const ticket = tickets.find((t) => t.id === draggableId);
    const newStatus = destination.droppableId as TicketStatus;
    if (!ticket || ticket.status === newStatus) return;

    qc.setQueryData<{ data: Ticket[] }>(['tickets', {}], (old) => {
      if (!old) return old;
      return {
        ...old,
        data: old.data.map((t) => t.id === draggableId ? { ...t, status: newStatus } : t),
      };
    });

    ticketsApi.update(ticket.id, { status: newStatus, updatedAt: ticket.updatedAt });
  };

  return { handleDragEnd };
}
