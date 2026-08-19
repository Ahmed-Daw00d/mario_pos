// src/components/Login.jsx — Secure login page using Firebase Auth
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Lock, Mail, Eye, EyeOff, Loader } from 'lucide-react';

export function Login() {
  const { login } = useAuth();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    setError('');
    try {
      await login(email, password);
    } catch (err) {
      const messages = {
        'auth/invalid-credential':    'البريد الإلكتروني أو كلمة المرور غير صحيحة.',
        'auth/user-not-found':        'المستخدم غير موجود.',
        'auth/wrong-password':        'كلمة المرور غير صحيحة.',
        'auth/invalid-email':         'البريد الإلكتروني غير صالح.',
        'auth/too-many-requests':     'عدد محاولات كثيرة. حاول لاحقاً.',
        'auth/network-request-failed':'خطأ في الشبكة. تحقق من الاتصال.',
      };
      setError(messages[err.code] || 'حدث خطأ. حاول مجدداً.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-brand-dark flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-8">

        {/* Logo */}
        <div className="text-center">
          <div className="text-6xl mb-4">🍕</div>
          <h1 className="font-display italic text-3xl font-bold text-white">
            <span className="text-brand-gold">Pizzaria da</span> Mario
          </h1>
          <p className="text-white/40 text-sm mt-1">& Kebab — Sistema POS</p>
        </div>

        {/* Login Card */}
        <div className="card border border-white/10 p-8 space-y-6">
          <div className="text-center">
            <div className="w-14 h-14 bg-brand-red/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Lock size={24} className="text-brand-red" />
            </div>
            <h2 className="text-xl font-bold text-white">Area Riservata</h2>
            <p className="text-white/40 text-sm mt-1">Accesso operatori</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-white/50 uppercase tracking-wide">
                Email
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="input-field w-full pl-9"
                  placeholder="admin@pizzaria.com"
                  autoComplete="email"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-white/50 uppercase tracking-wide">
                Password
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="input-field w-full pl-9 pr-10"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3">
                <p className="text-red-400 text-sm text-center">{error}</p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || !email || !password}
              className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader size={16} className="animate-spin" />
                  <span>Accesso in corso...</span>
                </>
              ) : (
                'Accedi'
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-white/20">
          Sistema POS — Pizzaria da Mario © 2026
        </p>
      </div>
    </div>
  );
}
