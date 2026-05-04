import { useState } from 'react';
import type { Comment } from '../../../types';
import { useUpdateComment } from '../hooks/useMutateComment';

interface Props { comment: Comment; onClose: () => void }

export function EditCommentForm({ comment, onClose }: Props) {
  const [content, setContent] = useState(comment.content);
  const update = useUpdateComment(comment.ticketId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    update.mutate({ commentId: comment.id, content }, { onSuccess: onClose });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={3}
        className="w-full border rounded px-3 py-2 text-sm"
      />
      <div className="flex gap-2">
        <button type="submit" disabled={update.isPending} className="px-3 py-1 bg-blue-600 text-white rounded text-sm disabled:opacity-50">
          Guardar
        </button>
        <button type="button" onClick={onClose} className="px-3 py-1 border rounded text-sm">
          Cancelar
        </button>
      </div>
    </form>
  );
}
