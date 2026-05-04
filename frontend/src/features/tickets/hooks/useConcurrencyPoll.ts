import { useEffect, useRef } from 'react';
import { ticketsApi } from '../api/ticketsApi';
import type { Ticket } from '../../../types';

export function useConcurrencyPoll(
  ticket: Ticket | undefined,
  onConflict: (serverTicket: Ticket) => void
) {
  const intervalRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

  useEffect(() => {
    if (!ticket) return;
    intervalRef.current = setInterval(async () => {
      try {
        const res = await ticketsApi.get(ticket.id);
        if (res.data.updatedAt !== ticket.updatedAt) {
          onConflict(res.data);
        }
      } catch {
        // silence errors during polling
      }
    }, 30_000);

    return () => clearInterval(intervalRef.current);
  }, [ticket, onConflict]);
}
