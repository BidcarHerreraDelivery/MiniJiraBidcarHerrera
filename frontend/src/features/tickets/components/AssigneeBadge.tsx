import type { User } from '../../../types';

function getInitials(name: string) {
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
}

interface AssigneeBadgeProps {
  assignee: Pick<User, 'name'> | null;
}

export function AssigneeBadge({ assignee }: AssigneeBadgeProps) {
  if (!assignee) return null;
  return (
    <div
      className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-semibold shrink-0"
      style={{
        backgroundColor: 'var(--secondary-container)',
        color:           'var(--on-secondary-container)',
      }}
      title={assignee.name}
    >
      {getInitials(assignee.name)}
    </div>
  );
}
