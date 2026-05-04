import { useComments } from '../hooks/useComments';
import { CommentItem } from './CommentItem';
import { NewCommentForm } from './NewCommentForm';

interface Props { ticketId: string; ticketArchived: boolean }

export function CommentSection({ ticketId, ticketArchived }: Props) {
  const { data: comments, isLoading } = useComments(ticketId);

  return (
    <div className="space-y-4">
      <h3 className="text-base font-semibold">Comentarios</h3>
      {isLoading ? (
        <p className="text-sm text-gray-500">Cargando…</p>
      ) : (
        <div className="space-y-3">
          {(comments ?? []).map((c) => (
            <CommentItem key={c.id} comment={c} ticketArchived={ticketArchived} />
          ))}
        </div>
      )}
      <NewCommentForm ticketId={ticketId} disabled={ticketArchived} />
    </div>
  );
}
