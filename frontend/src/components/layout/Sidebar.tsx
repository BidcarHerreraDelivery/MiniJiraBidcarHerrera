import { NavLink } from 'react-router';
import { useAuthStore } from '../../features/auth/store/authStore';
import { cn } from '../../lib/utils';

const NAV_ITEMS = [
  { to: '/board',     label: 'Board',      icon: 'view_kanban' },
  { to: '/dashboard', label: 'Dashboard',  icon: 'analytics'   },
];

export function Sidebar() {
  const user = useAuthStore((s) => s.user);

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      'flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer select-none',
      isActive
        ? 'bg-primary-fixed text-on-primary-fixed-variant'
        : 'text-on-surface-variant hover:bg-surface-container'
    );

  return (
    <aside className="w-64 shrink-0 h-full flex flex-col p-4 bg-surface-container-low border-r border-outline-variant">
      {/* Logo */}
      <div className="flex items-center gap-3 mb-8 px-2">
        <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center shrink-0">
          <span className="material-symbols-outlined text-on-primary" style={{ fontSize: 20 }}>task_alt</span>
        </div>
        <div>
          <h2 className="text-[18px] font-semibold text-on-surface leading-tight">CicloVida</h2>
          <p className="text-[11px] text-on-surface-variant">Product Dev</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1">
        {NAV_ITEMS.map(({ to, label, icon }) => (
          <NavLink key={to} to={to} className={linkClass}>
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>{icon}</span>
            <span>{label}</span>
          </NavLink>
        ))}
        {user?.role === 'admin' && (
          <NavLink to="/admin/users" className={linkClass}>
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>group</span>
            <span>Usuarios</span>
          </NavLink>
        )}
      </nav>

      {/* Bottom section */}
      <div className="space-y-1 pt-4 border-t border-outline-variant">
        <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-surface-container-lowest border border-outline-variant text-on-surface-variant rounded-lg hover:bg-surface-container text-sm font-medium transition-all">
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>person_add</span>
          Invitar miembro
        </button>
        <div className="space-y-0.5 pt-1">
          {[{ label: 'Ayuda', icon: 'help_outline' }, { label: 'Ajustes', icon: 'settings' }].map(({ label, icon }) => (
            <button
              key={label}
              className="w-full flex items-center gap-3 px-4 py-2 text-on-surface-variant hover:bg-surface-container rounded-lg transition-all text-sm font-medium"
            >
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>{icon}</span>
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}
