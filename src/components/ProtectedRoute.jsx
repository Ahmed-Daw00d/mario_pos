import { useState } from 'react';
import { Lock } from 'lucide-react';

export function ProtectedRoute({ children }) {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(
    sessionStorage.getItem('casher_auth') === 'true'
  );
  const [error, setError] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password === 'Aa@132000') {
      sessionStorage.setItem('casher_auth', 'true');
      setIsAuthenticated(true);
      setError(false);
    } else {
      setError(true);
      setPassword('');
    }
  };

  if (isAuthenticated) {
    return children;
  }

  return (
    <div className="min-h-screen bg-brand-dark flex flex-col items-center justify-center p-4">
      <div className="card max-w-sm w-full p-8 space-y-6 text-center border-brand-red/20 border-2">
        <div className="w-16 h-16 bg-brand-red/20 rounded-full flex items-center justify-center mx-auto text-brand-red">
          <Lock size={32} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">Area Riservata</h2>
          <p className="text-white/50 text-sm mt-1">Inserisci la password per continuare</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={`input-field w-full text-center tracking-widest text-lg ${error ? 'border-red-500 bg-red-500/10' : ''}`}
            placeholder="•••••••••"
            autoFocus
          />
          {error && <p className="text-red-400 text-xs">Password errata. Riprova.</p>}
          <button type="submit" className="btn-primary w-full">
            Accedi
          </button>
        </form>
      </div>
    </div>
  );
}
