// src/components/ProtectedRoute.jsx — Auth-based route protection with RBAC
import { useAuth } from '../contexts/AuthContext';
import { Login } from './Login';
import { LoadingScreen } from './ui/SharedUI';
import { ShieldX } from 'lucide-react';

/**
 * @param {React.ReactNode} children
 * @param {'admin'|'cashier'|undefined} requiredRole
 *   - undefined / 'cashier' → any authenticated user
 *   - 'admin'               → only admin role
 */
export function ProtectedRoute({ children, requiredRole }) {
  const { user, role, loading, logout, isAdmin } = useAuth();

  if (loading) return <LoadingScreen message="Verifica accesso..." />;

  // Not logged in → show login page
  if (!user) return <Login />;

  // Logged in but insufficient role
  if (requiredRole === 'admin' && !isAdmin) {
    return (
      <div className="min-h-screen bg-brand-dark flex flex-col items-center justify-center p-8 text-center gap-6">
        <div className="w-20 h-20 bg-red-500/10 rounded-3xl flex items-center justify-center mx-auto">
          <ShieldX size={40} className="text-red-400" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Accesso Negato</h2>
          <p className="text-white/50">
            Non hai i permessi per accedere a questa sezione.
          </p>
          <p className="text-white/30 text-sm mt-1">
            Ruolo richiesto: <span className="text-brand-gold font-semibold">Admin</span>
          </p>
        </div>
        <button
          onClick={logout}
          className="btn-ghost px-6 py-2"
        >
          ← Torna al login
        </button>
      </div>
    );
  }

  return children;
}
