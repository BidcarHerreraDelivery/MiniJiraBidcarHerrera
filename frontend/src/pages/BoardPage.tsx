import { useState } from 'react';
import { KanbanBoard } from '../features/tickets/components/KanbanBoard';
import { TicketFilters } from '../features/tickets/components/TicketFilters';
import { TicketForm } from '../features/tickets/components/TicketForm';

const TEAM_INITIALS = ['AM', 'JR', 'LD'];

export function BoardPage() {
  const [showCreate,  setShowCreate]  = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  return (
    <section className="flex-1 flex flex-col overflow-hidden p-6 bg-background">
      {/* Board header */}
      <div className="flex items-center justify-between mb-6 shrink-0">
        <div>
          <nav className="flex items-center gap-1.5 text-[11px] text-on-surface-variant mb-1">
            <span>Proyectos</span>
            <span className="material-symbols-outlined" style={{ fontSize: 14 }}>chevron_right</span>
            <span className="text-on-surface font-medium">CicloVida</span>
          </nav>
          <h1 className="text-[24px] font-semibold tracking-tight text-on-surface">Tablero Kanban</h1>
        </div>

        <div className="flex items-center gap-3">
          {/* Stacked team avatars */}
          <div className="flex -space-x-2 mr-2">
            {TEAM_INITIALS.map((init) => (
              <div
                key={init}
                className="w-8 h-8 rounded-full border-2 flex items-center justify-center text-[10px] font-bold shrink-0"
                style={{
                  borderColor:     'var(--surface-container-lowest)',
                  backgroundColor: 'var(--secondary-container)',
                  color:           'var(--on-secondary-container)',
                }}
              >
                {init}
              </div>
            ))}
            <div
              className="w-8 h-8 rounded-full border-2 flex items-center justify-center text-[10px] font-bold shrink-0"
              style={{
                borderColor:     'var(--surface-container-lowest)',
                backgroundColor: 'var(--surface-container-high)',
                color:           'var(--on-surface-variant)',
              }}
            >
              +4
            </div>
          </div>

          {/* Filtros toggle */}
          <button
            onClick={() => setShowFilters((v) => !v)}
            className="flex items-center gap-2 px-3 py-1.5 bg-surface-container-lowest border border-outline-variant rounded text-[13px] text-on-surface-variant hover:bg-surface-container transition-all"
          >
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>filter_list</span>
            Filtros
          </button>
        </div>
      </div>

      {/* Collapsible filter bar */}
      {showFilters && (
        <div className="mb-4 shrink-0">
          <TicketFilters />
        </div>
      )}

      {/* Kanban canvas — scrolls horizontally, fills remaining height */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden min-h-0">
        <KanbanBoard />
      </div>

      {/* FAB */}
      <button
        onClick={() => setShowCreate(true)}
        className="fixed bottom-8 right-8 w-14 h-14 bg-primary text-on-primary rounded-full shadow-lg flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-50"
        title="Crear ticket"
      >
        <span className="material-symbols-outlined" style={{ fontSize: 28, fontVariationSettings: "'wght' 600" }}>add</span>
      </button>

      {/* Modal — Nuevo ticket */}
      {showCreate && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-[4px]"
          style={{ backgroundColor: 'rgba(24,28,35,0.45)' }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowCreate(false); }}
        >
          <div className="bg-surface-container-lowest rounded-xl p-6 w-full max-w-lg shadow-xl border border-outline-variant">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-[18px] font-semibold text-on-surface">Nuevo ticket</h2>
              <button
                onClick={() => setShowCreate(false)}
                className="text-[20px] leading-none text-on-surface-variant hover:text-on-surface transition-colors"
                aria-label="Cerrar"
              >
                ×
              </button>
            </div>
            <TicketForm onSuccess={() => setShowCreate(false)} />
          </div>
        </div>
      )}
    </section>
  );
}
