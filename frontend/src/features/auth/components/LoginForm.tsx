import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginFormValues } from '../schemas/loginSchema';
import { useLogin } from '../hooks/useAuth';

export function LoginForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });
  const login = useLogin();

  return (
    <form onSubmit={handleSubmit((data) => login.mutate(data))} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Email</label>
        <input
          {...register('email')}
          type="email"
          className="w-full border rounded px-3 py-2 text-sm"
          placeholder="usuario@ejemplo.com"
        />
        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Contraseña</label>
        <input
          {...register('password')}
          type="password"
          className="w-full border rounded px-3 py-2 text-sm"
        />
        {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
      </div>
      {login.error && (
        <p className="text-red-500 text-sm">Credenciales incorrectas</p>
      )}
      <button
        type="submit"
        disabled={login.isPending}
        className="w-full bg-blue-600 text-white rounded px-4 py-2 text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
      >
        {login.isPending ? 'Iniciando sesión…' : 'Iniciar sesión'}
      </button>
    </form>
  );
}
