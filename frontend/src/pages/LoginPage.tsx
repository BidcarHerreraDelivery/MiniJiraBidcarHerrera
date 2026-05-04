import { LoginForm } from '../features/auth/components/LoginForm';

export function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white rounded-lg shadow p-8 w-full max-w-sm">
        <h1 className="text-2xl font-bold mb-6 text-center">Mini Jira</h1>
        <LoginForm />
      </div>
    </div>
  );
}
