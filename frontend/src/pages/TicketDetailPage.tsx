import { useState } from 'react';
import { useParams } from 'react-router';
import { useTicketDetail } from '../features/tickets/hooks/useTicketDetail';
import { TicketHeader } from '../features/tickets/components/TicketHeader';
import { TicketForm } from '../features/tickets/components/TicketForm';
import { ArchiveButton } from '../features/tickets/components/ArchiveButton';
import { ConcurrencyWarningDialog } from '../features/tickets/components/ConcurrencyWarningDialog';
import { CommentSection } from '../features/comments/components/CommentSection';
import { useConcurrencyPoll } from '../features/tickets/hooks/useConcurrencyPoll';
import type { Ticket } from '../types';
import { useUpdateTicket } from '../features/tickets/hooks/useMutateTicket';

export function TicketDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: ticket, isLoading, refetch } = useTicketDetail(id!);
  const [conflictTicket, setConflictTicket] = useState<Ticket | null>(null);
  const [editing, setEditing] = useState(false);
  const updateTicket = useUpdateTicket(id!);

  useConcurrencyPoll(editing ? ticket : undefined, (serverTicket) => {
    setConflictTicket(serverTicket);
  });

  if (isLoading) return <p className="text-sm text-gray-500">Cargando ticket…</p>;
  if (!ticket) return <p className="text-sm text-red-500">Ticket no encontrado</p>;

  const handleOverwrite = () => {
    if (!conflictTicket) return;
    updateTicket.mutate({ ...ticket, updatedAt: conflictTicket.updatedAt, force: true });
    setConflictTicket(null);
  };

  const handleDiscard = () => {
    refetch();
    setConflictTicket(null);
    setEditing(false);
  };

  return (
    <div className="max-w-3xl space-y-6">
      <TicketHeader ticket={ticket} />
      <div className="flex gap-3">
        <button
          onClick={() => setEditing((v) => !v)}
          className="px-3 py-1.5 border rounded text-sm hover:bg-gray-50"
        >
          {editing ? 'Cancelar edición' : 'Editar'}
        </button>
        <ArchiveButton ticket={ticket} />
      </div>
      {editing && <TicketForm ticket={ticket} onSuccess={() => setEditing(false)} />}
      <CommentSection ticketId={ticket.id} ticketArchived={!!ticket.archivedAt} />
      {conflictTicket && (
        <ConcurrencyWarningDialog
          serverTicket={conflictTicket}
          onOverwrite={handleOverwrite}
          onDiscard={handleDiscard}
        />
      )}
    </div>
  );
}
