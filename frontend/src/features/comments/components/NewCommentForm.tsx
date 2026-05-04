import { useState } from 'react';
import { useCreateComment } from '../hooks/useMutateComment';

interface Props { ticketId: string; disabled?: boolean }

export function NewCommentForm({ ticketId, disabled }: Props) {
  const [content, setContent] = useState('');
  const create = useCreateComment(ticketId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    create.mutate(content, { onSuccess: () => setContent('') });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        disabled={disabled}
        rows={3}
        placeholder={disabled ? 'No se puede comentar en tickets archivados' : 'Escribe un comentario…'}
        className="w-full border rounded px-3 py-2 text-sm disabled:bg-gray-50 disabled:text-gray-400"
      />
      <button
        type="submit"
        disabled={disabled || create.isPending || !content.trim()}
        className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50"
      >
        Comentar
      </button>
    </form>
  );
}
