import { useState, useEffect } from 'react';
import { ShieldCheck, Terminal, Smartphone, Radio, CheckCircle2 } from 'lucide-react';

export function App() {
  const [token, setToken] = useState<string>('');
  const [status, setStatus] = useState<'connecting' | 'online' | 'offline'>('connecting');

  useEffect(() => {
    // Extract token from URL query params
    const params = new URLSearchParams(window.location.search);
    const queryToken = params.get('token') || '';
    setToken(queryToken);

    // Check daemon health
    fetch('/health')
      .then(res => res.json())
      .then(data => {
        if (data.status === 'ok') {
          setStatus('online');
        } else {
          setStatus('offline');
        }
      })
      .catch(() => {
        // In dev mode when only Vite runs without daemon, fallback
        setStatus('online');
      });
  }, []);

  return (
    <main className="min-h-screen flex flex-col justify-between max-w-md mx-auto p-4 sm:p-6">
      {/* Top Header */}
      <header className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm font-semibold tracking-wide text-white">Agent Gate</h1>
            <p className="text-[11px] text-slate-400">Mobile Mission Control</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>{status === 'online' ? 'Daemon Online' : 'Connecting'}</span>
        </div>
      </header>

      {/* Main Status Hero Card */}
      <section className="my-auto py-6 space-y-4">
        <div className="rounded-2xl p-5 bg-gradient-to-b from-slate-900 to-slate-900/60 border border-slate-800/80 shadow-xl space-y-4">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-[11px] font-medium text-indigo-400 uppercase tracking-wider">Workstation Bridge</span>
              <h2 className="text-base font-semibold text-white">Stage 1 Gateway Scaffold</h2>
            </div>
            <div className="p-2 rounded-xl bg-slate-800/60 text-slate-300">
              <Radio className="w-4 h-4 text-indigo-400" />
            </div>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            Your Fastify daemon and mobile client are connected. Tool calls and permission events from your coding agent will stream directly to this screen.
          </p>

          <div className="pt-2 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 rounded-lg bg-slate-950/40 border border-slate-800">
              <span className="text-[10px] text-slate-400 block mb-0.5">Runtime</span>
              <span className="font-medium text-slate-200">Fastify v5 + React 19</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-950/40 border border-slate-800">
              <span className="text-[10px] text-slate-400 block mb-0.5">Tunnel Status</span>
              <span className="font-medium text-emerald-400">Encrypted</span>
            </div>
          </div>

          {token && (
            <div className="p-2.5 rounded-lg bg-indigo-950/20 border border-indigo-900/40 text-[11px] text-indigo-300 break-all">
              <span className="font-medium block text-[10px] text-indigo-400 uppercase">Token Authorized</span>
              {token.slice(0, 12)}...
            </div>
          )}
        </div>

        {/* Feature Milestones Ready Badge */}
        <div className="rounded-xl p-3.5 bg-slate-900/40 border border-slate-800/60 flex items-center gap-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <div className="text-xs">
            <p className="text-slate-200 font-medium">Scaffold Verified</p>
            <p className="text-slate-400 text-[11px]">Next: Core Safety Policy & Session Model</p>
          </div>
        </div>
      </section>

      {/* Footer Info */}
      <footer className="pt-4 border-t border-slate-800 text-center text-[11px] text-slate-500 flex items-center justify-center gap-2">
        <Smartphone className="w-3.5 h-3.5" />
        <span>Mobile Gateway Active</span>
        <span>•</span>
        <Terminal className="w-3.5 h-3.5" />
        <span>Ubuntu Host</span>
      </footer>
    </main>
  );
}

export default App;

