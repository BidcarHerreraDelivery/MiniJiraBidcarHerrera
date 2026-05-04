import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ticketSchema, type TicketFormValues } from '../schemas/ticketSchema';
import type { Ticket } from '../../../types';
import { useUpdateTicket, useCreateTicket } from '../hooks/useMutateTicket';

interface Props {
  ticket?: Ticket;
  onSuccess?: () => void;
}

export function TicketForm({ ticket, onSuccess }: Props) {
  const { register, handleSubmit, watch, formState: { errors } } = useForm<TicketFormValues>({
    resolver: zodResolver(ticketSchema),
    defaultValues: {
      title: ticket?.title ?? '',
      priority: ticket?.priority ?? 'media',
      description: ticket?.description ?? '',
      assignedTo: ticket?.assignedTo?.id ?? null,
    },
  });

  const createTicket = useCreateTicket();
  const updateTicket = useUpdateTicket(ticket?.id ?? '');
  const titleValue = watch('title');

  const onSubmit = (data: TicketFormValues) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const payload = data as any;
    if (ticket) {
      updateTicket.mutate({ ...payload, updatedAt: ticket.updatedAt }, { onSuccess });
    } else {
      createTicket.mutate(payload, { onSuccess });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Título</label>
        <input
          {...register('title')}
          maxLength={120}
          className="w-full border rounded px-3 py-2 text-sm"
        />
        <div className="flex justify-between">
          {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
          <span className="text-xs text-gray-400 ml-auto">{titleValue?.length ?? 0}/120</span>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Prioridad</label>
        <select {...register('priority')} className="w-full border rounded px-3 py-2 text-sm">
          <option value="baja">Baja</option>
          <option value="media">Media</option>
          <option value="alta">Alta</option>
        </select>
        {errors.priority && <p className="text-red-500 text-xs mt-1">{errors.priority.message}</p>}
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Descripción</label>
        <textarea
          {...register('description')}
          rows={4}
          className="w-full border rounded px-3 py-2 text-sm"
        />
      </div>
      <button
        type="submit"
        disabled={createTicket.isPending || updateTicket.isPending}
        className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50"
      >
        {ticket ? 'Guardar cambios' : 'Crear ticket'}
      </button>
    </form>
  );
}
