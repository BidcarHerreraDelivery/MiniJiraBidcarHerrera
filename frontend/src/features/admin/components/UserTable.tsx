import { useUsers } from '../hooks/useUsers';
import { UserRow } from './UserRow';

export function UserTable() {
  const { data: users, isLoading } = useUsers();

  if (isLoading) return <p className="text-sm text-gray-500">Cargando usuarios…</p>;

  return (
    <table className="w-full text-left">
      <thead>
        <tr className="border-b text-xs text-gray-500 uppercase tracking-wide">
          <th className="px-4 py-2">Nombre</th>
          <th className="px-4 py-2">Email</th>
          <th className="px-4 py-2">Rol</th>
          <th className="px-4 py-2">Estado</th>
          <th className="px-4 py-2">Acciones</th>
        </tr>
      </thead>
      <tbody>
        {(users ?? []).map((u) => <UserRow key={u.id} user={u} />)}
      </tbody>
    </table>
  );
}
