import { Link } from 'react-router';

export function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center">
      <h1 className="text-6xl font-bold text-gray-300">404</h1>
      <p className="text-gray-500 mt-2">Página no encontrada</p>
      <Link to="/board" className="mt-4 text-blue-600 hover:underline text-sm">
        Volver al tablero
      </Link>
    </div>
  );
}
