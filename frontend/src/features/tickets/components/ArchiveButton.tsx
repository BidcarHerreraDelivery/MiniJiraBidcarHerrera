import { useAuthStore } from '../../auth/store/authStore';
import { useArchiveTicket } from '../hooks/useMutateTicket';
import type { Ticket } from '../../../types';

interface Props { ticket: Ticket }

export function ArchiveButton({ ticket }: Props) {
  const user = useAuthStore((s) => s.user);
  const archive = useArchiveTicket();

  const canArchive = user && (user.role === 'admin' || user.id === ticket.createdBy.id);
  if (!canArchive || ticket.archivedAt) return null;

  return (
    <button
      onClick={() => archive.mutate(ticket.id)}
      disabled={archive.isPending}
      className="px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
    >
      {archive.isPending ? 'Archivando…' : 'Archivar ticket'}
    </button>
  );
}
