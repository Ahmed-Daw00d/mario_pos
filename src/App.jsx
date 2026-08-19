// src/App.jsx — Italian primary language homepage and routing
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { CustomerApp }       from './pages/customer/CustomerApp';
import { KDSPage }           from './pages/kitchen/KDSPage';
import { CashierDashboard }  from './pages/cashier/CashierDashboard';
import { ProtectedRoute }    from './components/ProtectedRoute';
import { AuthProvider }      from './contexts/AuthContext';

function HomePage() {
  return (
    <div className="min-h-screen bg-brand-dark flex flex-col items-center justify-center p-8 text-center">
      <div className="max-w-lg w-full">
        {/* Logo */}
        <div className="mb-10">
          <h1 className="font-display italic text-6xl font-bold text-white mb-2 drop-shadow-lg">
            🍕 <span className="text-brand-gold">Pizzaria da</span> Mario
          </h1>
          <h2 className="text-2xl font-display italic text-white/80">Pizza & Kebab</h2>
          <p className="text-sm text-brand-red font-semibold tracking-widest uppercase mt-1">POS System</p>
          <div className="mt-3 text-xs text-white/60 space-y-1">
            <p>Via Aldo Moro 164, 00010 Gallicano nel Lazio (RM)</p>
            <p>Tel: +39 327 086 4751 | Fisso: 06 9435 5249</p>
          </div>
        </div>

        {/* Navigation Cards */}
        <div className="grid grid-cols-1 gap-4 mb-8">
          <Link to="/cashier"
            className="card-hover p-6 flex items-center gap-4 group border border-brand-gold/10">
            <span className="text-4xl group-hover:scale-110 transition-transform">💰</span>
            <div className="text-left flex-1">
              <h3 className="font-bold text-white text-lg">Cassa</h3>
              <p className="text-sm text-white/50 italic">Gestione tavoli, inventario e QR codes</p>
            </div>
            <span className="text-white/30 group-hover:text-brand-gold transition-colors text-lg">→</span>
          </Link>

          <Link to="/kitchen"
            className="card-hover p-6 flex items-center gap-4 group border border-orange-500/10">
            <span className="text-4xl group-hover:scale-110 transition-transform">🔥</span>
            <div className="text-left flex-1">
              <h3 className="font-bold text-white text-lg">Cucina — KDS</h3>
              <p className="text-sm text-white/50 italic">Kitchen Display System — Schermo ordini</p>
            </div>
            <span className="text-white/30 group-hover:text-orange-400 transition-colors text-lg">→</span>
          </Link>

          <Link to="/table/table_1"
            className="card-hover p-6 flex items-center gap-4 group border border-brand-red/20">
            <span className="text-4xl group-hover:scale-110 transition-transform">🍕</span>
            <div className="text-left flex-1">
              <h3 className="font-bold text-white text-lg">Demo Cliente</h3>
              <p className="text-sm text-white/50 italic">Anteprima app cliente — Tavolo 1</p>
            </div>
            <span className="text-white/30 group-hover:text-brand-red transition-colors text-lg">→</span>
          </Link>
        </div>

        {/* Setup info */}
        <div className="glass p-4 text-center space-y-1.5">
          <p className="text-xs text-brand-gold font-semibold">⚠️ Prima configurazione</p>
          <p className="text-xs text-white/50">
            Se il database è vuoto, esegui il seed:
          </p>
          <code className="text-xs text-brand-green bg-black/30 px-3 py-1.5 rounded-lg block mt-2 font-mono">
            npm run seed
          </code>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/"               element={<HomePage />} />
          <Route path="/table/:tableId" element={<CustomerApp />} />
          <Route path="/kitchen"        element={<ProtectedRoute><KDSPage /></ProtectedRoute>} />
          <Route path="/cashier"        element={<ProtectedRoute><CashierDashboard /></ProtectedRoute>} />
          <Route path="*"               element={<HomePage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
