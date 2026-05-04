import type { Ticket } from '../../../types';
import { cn, formatDate } from '../../../lib/utils';

const priorityColor: Record<string, string> = {
  baja: 'bg-green-100 text-green-800',
  media: 'bg-yellow-100 text-yellow-800',
  alta: 'bg-red-100 text-red-800',
};

const statusLabel: Record<string, string> = {
  por_hacer: 'Por hacer',
  en_progreso: 'En progreso',
  review: 'Review',
  bloqueado: 'Bloqueado',
  listo: 'Listo',
};

interface Props { ticket: Ticket }

export function TicketHeader({ ticket }: Props) {
  return (
    <div className="space-y-2">
      <h1 className="text-xl font-bold">{ticket.title}</h1>
      <div className="flex flex-wrap gap-2 items-center text-sm text-gray-500">
        <span className="border rounded px-2 py-0.5">{statusLabel[ticket.status]}</span>
        <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium', priorityColor[ticket.priority])}>
          {ticket.priority}
        </span>
        <span>Creado por {ticket.createdBy.name}</span>
        <span>{formatDate(ticket.createdAt)}</span>
        {ticket.archivedAt && (
          <span className="bg-gray-200 text-gray-600 rounded px-2 py-0.5">Archivado</span>
        )}
      </div>
    </div>
  );
}
