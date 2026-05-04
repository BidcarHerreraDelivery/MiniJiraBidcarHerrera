import type { User } from '../../../types';
import { useDeactivateUser, usePromoteUser } from '../hooks/useMutateUser';

interface Props { user: User }

export function UserRow({ user }: Props) {
  const deactivate = useDeactivateUser();
  const promote = usePromoteUser();

  return (
    <tr className="border-b">
      <td className="px-4 py-3 text-sm">{user.name}</td>
      <td className="px-4 py-3 text-sm text-gray-500">{user.email}</td>
      <td className="px-4 py-3">
        <span className={`text-xs px-2 py-0.5 rounded-full ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'}`}>
          {user.role}
        </span>
      </td>
      <td className="px-4 py-3">
        <span className={`text-xs px-2 py-0.5 rounded-full ${user.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {user.active ? 'Activo' : 'Inactivo'}
        </span>
      </td>
      <td className="px-4 py-3">
        <div className="flex gap-2">
          {user.role !== 'admin' && (
            <button
              onClick={() => promote.mutate(user.id)}
              disabled={promote.isPending}
              className="text-xs text-purple-600 hover:underline disabled:opacity-50"
            >
              Promover
            </button>
          )}
          {user.active && (
            <button
              onClick={() => deactivate.mutate(user.id)}
              disabled={deactivate.isPending}
              className="text-xs text-red-600 hover:underline disabled:opacity-50"
            >
              Desactivar
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}
