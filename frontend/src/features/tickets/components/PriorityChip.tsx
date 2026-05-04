import type { TicketPriority } from '../../../types';

interface Config { label: string; bg: string; color: string }

const PRIORITY_CONFIG: Record<TicketPriority, Config> = {
  alta:  { label: 'Alta',  bg: 'var(--error-container)',  color: 'var(--on-error-container)' },
  media: { label: 'Media', bg: 'var(--tertiary-fixed)',   color: 'var(--on-tertiary-fixed)'  },
  baja:  { label: 'Baja',  bg: 'var(--primary-fixed)',    color: 'var(--on-primary-fixed)'   },
};

interface PriorityChipProps {
  priority: TicketPriority;
}

export function PriorityChip({ priority }: PriorityChipProps) {
  const { label, bg, color } = PRIORITY_CONFIG[priority];
  return (
    <span
      className="inline-block shrink-0 text-[12px] font-semibold tracking-wide px-2 py-0.5 rounded-sm leading-5"
      style={{ backgroundColor: bg, color }}
    >
      {label}
    </span>
  );
}
