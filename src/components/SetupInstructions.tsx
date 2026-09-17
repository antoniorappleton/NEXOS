import React, { useState } from 'react';
import { Terminal, Database, Key, Copy, Check } from 'lucide-react';
export const SetupInstructions: React.FC = () => {
  const [copiedEnv, setCopiedEnv] = useState(false);

  const envTemplate = `VITE_FIREBASE_API_KEY=AIzaSyCGWe9GweTIR54yJUMyxN9bElo82-Hq_qc\nVITE_FIREBASE_AUTH_DOMAIN=devclass-ensino-profissiona.firebaseapp.com\nVITE_FIREBASE_PROJECT_ID=devclass-ensino-profissiona\nVITE_FIREBASE_STORAGE_BUCKET=devclass-ensino-profissiona.firebasestorage.app\nVITE_FIREBASE_MESSAGING_SENDER_ID=849450041863\nVITE_FIREBASE_APP_ID=1:849450041863:web:2e760c5f7b741c720320a2`;

  const copyEnv = () => {
    navigator.clipboard.writeText(envTemplate);
    setCopiedEnv(true);
    setTimeout(() => setCopiedEnv(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] flex items-center justify-center p-6 text-slate-100 overflow-y-auto selection:bg-brand-500/30">
      <div className="max-w-3xl w-full glass rounded-3xl border border-slate-800 p-8 md:p-12 space-y-8 shadow-2xl relative overflow-hidden my-8">
        
        {/* Decorative background glow */}
        <div className="absolute -top-24 -left-24 w-72 h-72 bg-brand-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl" />

        {/* Brand / Header */}
        <div className="text-center relative z-10 space-y-3">
          <div className="inline-flex p-3.5 bg-brand-500/10 text-brand-400 rounded-2xl border border-brand-500/20 shadow-inner">
            <Terminal size={32} className="stroke-[2.5]" />
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
            Configurar o Firebase
          </h1>
          <p className="text-slate-400 max-w-lg mx-auto text-xs md:text-sm">
            Transforme o seu projeto numa ferramenta escolar real com o Firebase. Siga os passos rápidos abaixo para preparar o seu ambiente.
          </p>
        </div>

        {/* Steps */}
        <div className="space-y-6 relative z-10">
          
          {/* Step 1 */}
          <div className="flex gap-4 p-5 rounded-2xl bg-slate-900/40 border border-slate-850 hover:border-slate-800 transition">
            <div className="shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-brand-500/10 text-brand-400 text-xs font-bold border border-brand-500/20">
              1
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-white text-sm flex items-center gap-1.5">
                <Database size={16} className="text-brand-400" />
                Criar Projeto no Firebase
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Aceda a <a href="https://console.firebase.google.com" target="_blank" rel="noopener noreferrer" className="text-brand-400 hover:underline font-semibold">console.firebase.google.com</a>, crie um novo projeto gratuito. Ative o <strong>Authentication</strong> (com o fornecedor Email/Password) e o <strong>Cloud Firestore</strong> (em modo de teste ou de produção).
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex gap-4 p-5 rounded-2xl bg-slate-900/40 border border-slate-850 hover:border-slate-800 transition">
            <div className="shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold border border-emerald-500/20">
              2
            </div>
            <div className="space-y-3 w-full">
              <h3 className="font-bold text-white text-sm flex items-center gap-1.5">
                <Key size={16} className="text-emerald-400" />
                Configurar Variáveis de Ambiente
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Crie um ficheiro na raiz do projeto com o nome <code className="px-1.5 py-0.5 rounded bg-slate-800 text-emerald-400 font-mono text-3xs">.env</code> e adicione as suas credenciais. O template sugerido é o seguinte:
              </p>
              <div className="relative">
                <pre className="p-3 bg-slate-950/70 border border-slate-850 rounded-xl text-3xs font-mono text-slate-300 leading-loose overflow-x-auto select-all">
                  {envTemplate}
                </pre>
                <button
                  onClick={copyEnv}
                  className="absolute right-2.5 top-2.5 p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg border border-slate-700 transition cursor-pointer"
                  title="Copiar Template"
                >
                  {copiedEnv ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="border-t border-slate-850 pt-8 flex items-center justify-center relative z-10">
          <div className="text-center">
            <span className="text-3xs text-slate-500 font-bold uppercase tracking-wider block">Já configurou?</span>
            <span className="text-xs text-slate-450 block mt-0.5">Reinicie o servidor local (<code className="font-mono text-3xs">npm run dev</code>) para carregar as chaves.</span>
          </div>
        </div>

      </div>
    </div>
  );
};
