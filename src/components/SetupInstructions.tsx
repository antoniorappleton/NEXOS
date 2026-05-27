import React, { useState } from 'react';
import { Terminal, Database, Shield, Key, Copy, Check, Play, Sparkles, Loader2 } from 'lucide-react';
import { seedDatabase } from '../lib/seedFirebase';

interface SetupInstructionsProps {
  onBypass: () => void;
}

export const SetupInstructions: React.FC<SetupInstructionsProps> = ({ onBypass }) => {
  const [copiedEnv, setCopiedEnv] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [seedSuccess, setSeedSuccess] = useState(false);
  const [seedError, setSeedError] = useState<string | null>(null);

  const envTemplate = `VITE_FIREBASE_API_KEY=AIzaSyCGWe9GweTIR54yJUMyxN9bElo82-Hq_qc\nVITE_FIREBASE_AUTH_DOMAIN=devclass-ensino-profissiona.firebaseapp.com\nVITE_FIREBASE_PROJECT_ID=devclass-ensino-profissiona\nVITE_FIREBASE_STORAGE_BUCKET=devclass-ensino-profissiona.firebasestorage.app\nVITE_FIREBASE_MESSAGING_SENDER_ID=849450041863\nVITE_FIREBASE_APP_ID=1:849450041863:web:2e760c5f7b741c720320a2`;

  const copyEnv = () => {
    navigator.clipboard.writeText(envTemplate);
    setCopiedEnv(true);
    setTimeout(() => setCopiedEnv(false), 2000);
  };

  const handleSeed = async () => {
    setSeeding(true);
    setSeedError(null);
    setSeedSuccess(false);
    try {
      const config = {
        apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCGWe9GweTIR54yJUMyxN9bElo82-Hq_qc",
        authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "devclass-ensino-profissiona.firebaseapp.com",
        projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "devclass-ensino-profissiona",
        storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "devclass-ensino-profissiona.firebasestorage.app",
        messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "849450041863",
        appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:849450041863:web:2e760c5f7b741c720320a2"
      };
      await seedDatabase(config);
      setSeedSuccess(true);
    } catch (err: any) {
      console.error(err);
      setSeedError(err.message || 'Erro ao inicializar base de dados.');
    } finally {
      setSeeding(false);
    }
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

          {/* Step 3 (Seed Utility) */}
          <div className="flex gap-4 p-5 rounded-2xl bg-slate-900/40 border border-slate-850 hover:border-slate-800 transition">
            <div className="shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-purple-500/10 text-purple-400 text-xs font-bold border border-purple-500/20">
              3
            </div>
            <div className="space-y-3 w-full">
              <h3 className="font-bold text-white text-sm flex items-center gap-1.5">
                <Sparkles size={16} className="text-purple-400" />
                Semear Dados Demo (Firestore)
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Após criar e configurar o `.env`, pode inicializar a base de dados do Firestore com todos os utilizadores, pautas, aulas e submissões da demonstração com um único clique.
              </p>
              {seedError && (
                <div className="p-3 rounded-lg text-xs bg-rose-500/10 border border-rose-500/20 text-rose-450">
                  {seedError}
                </div>
              )}
              {seedSuccess && (
                <div className="p-3 rounded-lg text-xs bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center gap-1.5">
                  <Check size={14} /> Base de dados demo semeada com sucesso! Reinicie o servidor.
                </div>
              )}
              <button
                onClick={handleSeed}
                disabled={seeding || seedSuccess}
                className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-lg transition disabled:opacity-50 cursor-pointer shadow-md"
              >
                {seeding ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                <span>{seeding ? 'A semear base de dados...' : 'Inicializar com Dados Demo'}</span>
              </button>
            </div>
          </div>

        </div>

        {/* Footer actions */}
        <div className="border-t border-slate-850 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 relative z-10">
          <div className="text-center sm:text-left">
            <span className="text-3xs text-slate-500 font-bold uppercase tracking-wider block">Já configurou?</span>
            <span className="text-xs text-slate-450 block mt-0.5">Reinicie o servidor local (<code className="font-mono text-3xs">npm run dev</code>) para carregar as chaves.</span>
          </div>

          <button
            onClick={onBypass}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 hover:border-slate-650 text-xs font-bold transition shadow-lg cursor-pointer"
          >
            <Play size={14} className="text-brand-500 fill-brand-500/20" />
            <span>Usar Modo Demo Offline</span>
          </button>
        </div>

      </div>
    </div>
  );
};
