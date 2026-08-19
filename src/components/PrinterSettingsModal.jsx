// src/components/PrinterSettingsModal.jsx — Dynamic printer IP configuration
import { useState, useEffect } from 'react';
import { X, Printer, Wifi, Check, AlertCircle, Loader } from 'lucide-react';
import { getPrinterIP, setPrinterIP } from '../utils/printerHelper';

export function PrinterSettingsModal({ onClose }) {
  const [ip, setIp]           = useState('');
  const [testing, setTesting] = useState(false);
  const [result, setResult]   = useState(null); // 'ok' | 'error' | null
  const [saved, setSaved]     = useState(false);

  useEffect(() => {
    setIp(getPrinterIP());
  }, []);

  function handleSave() {
    const trimmed = ip.trim();
    if (!trimmed) return;
    setPrinterIP(trimmed);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  async function handleTest() {
    const trimmed = ip.trim();
    if (!trimmed) return;
    setTesting(true);
    setResult(null);
    try {
      // Test by calling /api/print with empty test payload
      const res = await fetch('/api/print', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ test: true, ip: trimmed }),
      });
      setResult(res.ok ? 'ok' : 'error');
    } catch {
      setResult('error');
    } finally {
      setTesting(false);
    }
  }

  // IP validation (basic)
  const isValidIp = /^(\d{1,3}\.){3}\d{1,3}$/.test(ip.trim());

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)' }}
    >
      <div className="bg-brand-card w-full max-w-sm rounded-3xl border border-white/10 shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-brand-red/20 rounded-xl flex items-center justify-center">
              <Printer size={18} className="text-brand-red" />
            </div>
            <div>
              <h2 className="font-bold text-white">Stampante Termica</h2>
              <p className="text-xs text-white/40">Impostazioni connessione</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/10 transition-colors">
            <X size={18} className="text-white/60" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Current IP display */}
          <div className="bg-white/5 rounded-2xl p-4 flex items-center gap-3">
            <Wifi size={16} className="text-brand-gold flex-shrink-0" />
            <div>
              <p className="text-xs text-white/40">IP Corrente Salvato</p>
              <p className="text-sm font-mono font-bold text-brand-gold">{getPrinterIP()}</p>
            </div>
          </div>

          {/* IP Input */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-white/50 uppercase tracking-wide">
              Nuovo indirizzo IP stampante
            </label>
            <input
              type="text"
              value={ip}
              onChange={e => { setIp(e.target.value); setResult(null); }}
              placeholder="192.168.1.6"
              className={`input-field w-full font-mono text-center text-lg tracking-wider
                ${!isValidIp && ip ? 'border-red-500/50' : ''}`}
            />
            {!isValidIp && ip && (
              <p className="text-xs text-red-400">
                Formato non valido. Es: 192.168.1.6
              </p>
            )}
          </div>

          {/* Test result */}
          {result === 'ok' && (
            <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/30 rounded-xl px-4 py-3">
              <Check size={16} className="text-green-400 flex-shrink-0" />
              <p className="text-green-400 text-sm">Stampante raggiungibile!</p>
            </div>
          )}
          {result === 'error' && (
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3">
              <AlertCircle size={16} className="text-red-400 flex-shrink-0" />
              <p className="text-red-400 text-sm">Stampante non raggiungibile. Verifica IP e rete.</p>
            </div>
          )}

          {/* Port info */}
          <p className="text-xs text-white/30 text-center">
            Porta: <span className="font-mono text-white/50">9100</span> (ESC/POS standard)
          </p>
        </div>

        {/* Actions */}
        <div className="px-6 pb-6 grid grid-cols-2 gap-3">
          <button
            onClick={handleTest}
            disabled={!isValidIp || testing}
            className="btn-ghost flex items-center justify-center gap-2 disabled:opacity-40"
          >
            {testing ? <Loader size={14} className="animate-spin" /> : <Wifi size={14} />}
            {testing ? 'Test...' : 'Testa'}
          </button>
          <button
            onClick={handleSave}
            disabled={!isValidIp}
            className="btn-primary flex items-center justify-center gap-2 disabled:opacity-40"
          >
            {saved ? (
              <><Check size={14} /> Salvato!</>
            ) : (
              <><Printer size={14} /> Salva</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
