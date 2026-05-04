import { useState } from 'react';
import type { Comment } from '../../../types';
import { useAuthStore } from '../../auth/store/authStore';
import { useDeleteComment } from '../hooks/useMutateComment';
import { EditCommentForm } from './EditCommentForm';
import { formatDate } from '../../../lib/utils';

interface Props { comment: Comment; ticketArchived: boolean }

export function CommentItem({ comment, ticketArchived }: Props) {
  const user = useAuthStore((s) => s.user);
  const [editing, setEditing] = useState(false);
  const deleteComment = useDeleteComment(comment.ticketId);

  const canModify = user && (user.role === 'admin' || user.id === comment.user.id);

  return (
    <div className="border-b pb-3 space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{comment.user.name}</span>
        <span className="text-xs text-gray-400">{formatDate(comment.createdAt)}</span>
      </div>
      {editing ? (
        <EditCommentForm
          comment={comment}
          onClose={() => setEditing(false)}
        />
      ) : (
        <p className="text-sm text-gray-700" dangerouslySetInnerHTML={{ __html: comment.content }} />
      )}
      {canModify && !ticketArchived && !editing && (
        <div className="flex gap-2">
          <button onClick={() => setEditing(true)} className="text-xs text-blue-600 hover:underline">Editar</button>
          <button
            onClick={() => deleteComment.mutate(comment.id)}
            className="text-xs text-red-600 hover:underline"
          >
            Eliminar
          </button>
        </div>
      )}
    </div>
  );
}
