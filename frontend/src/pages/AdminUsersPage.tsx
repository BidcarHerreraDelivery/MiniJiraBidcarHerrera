import { UserTable } from '../features/admin/components/UserTable';
import { CreateUserDialog } from '../features/admin/components/CreateUserDialog';

export function AdminUsersPage() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Gestión de usuarios</h1>
        <CreateUserDialog />
      </div>
      <div className="bg-white rounded-lg border overflow-hidden">
        <UserTable />
      </div>
    </div>
  );
}
