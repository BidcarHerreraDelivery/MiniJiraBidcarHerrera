import { Draggable } from '@hello-pangea/dnd';
import { useNavigate } from 'react-router';
import type { Ticket } from '../../../types';
import { TaskCardDisplay } from './TaskCardDisplay';

interface TaskCardProps {
  ticket: Ticket;
  index:  number;
}

export function TaskCard({ ticket, index }: TaskCardProps) {
  const navigate = useNavigate();

  return (
    <Draggable draggableId={ticket.id} index={index}>
      {(provided, snapshot) => (
        <TaskCardDisplay
          ref={provided.innerRef}
          ticket={ticket}
          isDragging={snapshot.isDragging}
          dragHandle={provided.dragHandleProps as React.HTMLAttributes<HTMLDivElement>}
          onClick={() => navigate(`/tickets/${ticket.id}`)}
          {...provided.draggableProps}
        />
      )}
    </Draggable>
  );
}
