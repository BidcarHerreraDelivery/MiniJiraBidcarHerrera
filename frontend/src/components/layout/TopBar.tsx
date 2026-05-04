import { useAuthStore } from '../../features/auth/store/authStore';
import { useLogout } from '../../features/auth/hooks/useAuth';
import { useFilterStore } from '../../features/tickets/store/filterStore';

function getInitials(name: string) {
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
}

export function TopBar() {
  const user    = useAuthStore((s) => s.user);
  const logout  = useLogout();
  const { filters, setFilters } = useFilterStore();

  return (
    <header className="shrink-0 w-full flex justify-between items-center px-6 h-16 bg-surface-container-lowest border-b border-outline-variant shadow-sm z-40">
      {/* Search */}
      <div className="flex items-center flex-1">
        <div className="relative w-full max-w-md">
          <span
            className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline pointer-events-none"
            style={{ fontSize: 20 }}
          >
            search
          </span>
          <input
            type="text"
            placeholder="Buscar tickets, personas..."
            value={filters.search ?? ''}
            onChange={(e) => setFilters({ ...filters, search: e.target.value || undefined })}
            className="w-full bg-surface-container border-none rounded-lg py-2 pl-10 pr-4 text-[13px] text-on-surface placeholder:text-outline outline-none focus:ring-2 focus:ring-primary transition-all"
          />
        </div>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1">
          <button className="p-2 text-on-surface-variant hover:bg-surface-container rounded-full transition-colors">
            <span className="material-symbols-outlined" style={{ fontSize: 22 }}>notifications</span>
          </button>
          <button className="p-2 text-on-surface-variant hover:bg-surface-container rounded-full transition-colors">
            <span className="material-symbols-outlined" style={{ fontSize: 22 }}>settings</span>
          </button>
        </div>

        <div className="h-8 w-px bg-outline-variant mx-1" />

        {user && (
          <button
            onClick={() => logout.mutate()}
            title={`${user.name} — Cerrar sesión`}
            className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-on-primary text-[13px] font-semibold border border-outline-variant hover:opacity-80 transition-all shrink-0"
          >
            {getInitials(user.name)}
          </button>
        )}
      </div>
    </header>
  );
}
