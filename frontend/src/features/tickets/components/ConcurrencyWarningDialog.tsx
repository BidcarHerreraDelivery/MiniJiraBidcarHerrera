import type { Ticket } from '../../../types';

interface Props {
  serverTicket: Ticket;
  onOverwrite: () => void;
  onDiscard: () => void;
}

export function ConcurrencyWarningDialog({ serverTicket, onOverwrite, onDiscard }: Props) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl space-y-4">
        <h2 className="text-lg font-semibold">Conflicto de edición</h2>
        <p className="text-sm text-gray-600">
          Este ticket fue modificado en <strong>{serverTicket.updatedAt}</strong>. ¿Qué deseas hacer?
        </p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onDiscard}
            className="px-4 py-2 text-sm border rounded hover:bg-gray-50"
          >
            Descartar y ver versión actual
          </button>
          <button
            onClick={onOverwrite}
            className="px-4 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700"
          >
            Sobreescribir mis cambios
          </button>
        </div>
      </div>
    </div>
  );
}
