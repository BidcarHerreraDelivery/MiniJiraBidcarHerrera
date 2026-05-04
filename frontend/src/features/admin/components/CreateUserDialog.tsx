import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { userSchema, type UserFormValues } from '../schemas/userSchema';
import { useCreateUser } from '../hooks/useMutateUser';

export function CreateUserDialog() {
  const [open, setOpen] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
  });
  const createUser = useCreateUser();

  const onSubmit = (data: UserFormValues) => {
    createUser.mutate(data, { onSuccess: () => { reset(); setOpen(false); } });
  };

  return (
    <>
      <button onClick={() => setOpen(true)} className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">
        Crear usuario
      </button>
      {open && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl space-y-4">
            <h2 className="text-lg font-semibold">Nuevo usuario</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">Nombre</label>
                <input {...register('name')} className="w-full border rounded px-3 py-2 text-sm" />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input {...register('email')} type="email" className="w-full border rounded px-3 py-2 text-sm" />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Rol</label>
                <select {...register('role')} className="w-full border rounded px-3 py-2 text-sm">
                  <option value="usuario">Usuario</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="flex gap-3 justify-end">
                <button type="button" onClick={() => setOpen(false)} className="px-4 py-2 border rounded text-sm">
                  Cancelar
                </button>
                <button type="submit" disabled={createUser.isPending} className="px-4 py-2 bg-blue-600 text-white rounded text-sm disabled:opacity-50">
                  Crear
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
