import React, { useState } from 'react';
import { auth, db } from '../lib/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { setDoc, doc, getDoc } from 'firebase/firestore';
import { Terminal, Mail, Lock, UserPlus, LogIn, ChevronRight, Loader2, Sparkles, UserCheck, Check, AlertCircle } from 'lucide-react';
import { seedDatabase } from '../lib/seedFirebase';

interface LoginViewProps {
  onBypass: () => void;
  onLoginSuccess: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onBypass, onLoginSuccess }) => {
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'student' | 'teacher' | 'admin'>('student');
  
  const [loading, setLoading] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [seedSuccess, setSeedSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Seeded Demo Users for instant testing
  const demoUsers = [
    { name: 'João Appleton', role: 'teacher', email: 'joao.appleton@school.pt', desc: 'Professor Principal' },
    { name: 'Maria Costa', role: 'teacher', email: 'maria.costa@school.pt', desc: 'Professora Substituta' },
    { name: 'Pedro Silva', role: 'student', email: 'pedro.silva@alunos.pt', desc: 'Aluno Ativo' },
    { name: 'Maria Santos', role: 'student', email: 'maria.santos@alunos.pt', desc: 'Aluna Ativa' },
    { name: 'Coordenador', role: 'admin', email: 'admin@school.pt', desc: 'Administrador' }
  ];

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    setErrorMsg(null);

    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      onLoginSuccess();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Erro ao efetuar login. Verifique as credenciais.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !name) return;
    setLoading(true);
    setErrorMsg(null);

    const chosenAvatar = role === 'teacher' 
      ? `https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face`
      : `https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=80&h=80&fit=crop&crop=face`;

    try {
      const userCred = await createUserWithEmailAndPassword(auth, email.trim(), password);
      
      // Create user profile in Firestore
      await setDoc(doc(db, 'profiles', userCred.user.uid), {
        name: name.trim(),
        email: email.trim(),
        role: role,
        avatar: chosenAvatar,
        createdAt: new Date().toISOString()
      });

      onLoginSuccess();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Erro ao registar utilizador.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const provider = new GoogleAuthProvider();
      const userCred = await signInWithPopup(auth, provider);
      
      // Check if user profile already exists
      const docRef = doc(db, 'profiles', userCred.user.uid);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        // Create user profile in Firestore
        await setDoc(docRef, {
          name: userCred.user.displayName || 'Utilizador Google',
          email: userCred.user.email || '',
          role: 'student', // default role
          avatar: userCred.user.photoURL || `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&h=80&fit=crop&crop=face`,
          createdAt: new Date().toISOString()
        });
      }
      
      onLoginSuccess();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Erro ao autenticar com o Google.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (demoEmail: string) => {
    setLoading(true);
    setErrorMsg(null);
    try {
      await signInWithEmailAndPassword(auth, demoEmail, 'password123');
      onLoginSuccess();
    } catch (err: any) {
      console.error(err);
      setErrorMsg('Erro no login de demonstração. Verifique se já executou a inicialização com dados de teste no botão abaixo.');
    } finally {
      setLoading(false);
    }
  };

  const handleSeedDatabase = async () => {
    setSeeding(true);
    setErrorMsg(null);
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
      setErrorMsg(err.message || 'Erro ao popular a base de dados.');
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] flex items-center justify-center p-4 selection:bg-brand-500/30 overflow-y-auto">
      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-12 gap-8 my-8 relative">
        
        {/* Decorative elements */}
        <div className="absolute -top-12 -left-12 w-64 h-64 bg-brand-500/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-12 -right-12 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl" />

        {/* LEFT CARD: AUTH FORM */}
        <div className="md:col-span-7 glass rounded-3xl border border-slate-800 p-8 flex flex-col justify-between shadow-2xl relative overflow-hidden">
          <div>
            {/* Logo */}
            <div className="flex items-center gap-2.5 mb-8">
              <div className="p-2 bg-brand-500/10 text-brand-500 rounded-xl border border-brand-500/15">
                <Terminal size={18} className="stroke-[2.5]" />
              </div>
              <div>
                <span className="font-extrabold text-md tracking-tight text-white block">DevClass</span>
                <span className="text-4xs text-slate-500 font-bold uppercase tracking-widest block">Trabalho & Produção (Firebase)</span>
              </div>
            </div>

            {/* Mode switch */}
            <div className="mb-6 flex gap-4 text-xs font-semibold border-b border-slate-850 pb-2">
              <button 
                onClick={() => { setIsRegisterMode(false); setErrorMsg(null); }}
                className={`pb-2 border-b-2 cursor-pointer transition ${!isRegisterMode ? 'border-brand-500 text-brand-400 font-bold' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
              >
                Entrar
              </button>
              <button 
                onClick={() => { setIsRegisterMode(true); setErrorMsg(null); }}
                className={`pb-2 border-b-2 cursor-pointer transition ${isRegisterMode ? 'border-brand-500 text-brand-400 font-bold' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
              >
                Registar Conta
              </button>
            </div>

            {/* Error / Feedback box */}
            {errorMsg && (
              <div className="mb-6 p-4 rounded-xl text-xs font-medium bg-brand-900/15 border border-brand-500/20 text-brand-450 leading-normal animate-shake flex items-start gap-2">
                <AlertCircle size={14} className="shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Forms */}
            {isRegisterMode ? (
              // REGISTER FORM
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-3xs text-slate-400 font-bold uppercase tracking-wider block">Nome Completo</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Ana Sofia"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-900/60 border border-slate-800 text-slate-200 focus:outline-none focus:border-brand-500 transition"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-3xs text-slate-400 font-bold uppercase tracking-wider block">Perfil / Cargo</label>
                    <select
                      value={role}
                      onChange={(e: any) => setRole(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-brand-500 transition font-semibold"
                    >
                      <option value="student">Aluno</option>
                      <option value="teacher">Professor</option>
                      <option value="admin">Administrador</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-3xs text-slate-400 font-bold uppercase tracking-wider block">Palavra-passe</label>
                    <div className="relative">
                      <Lock size={12} className="absolute left-3.5 top-3.5 text-slate-500" />
                      <input
                        type="password"
                        required
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-9 pr-3.5 py-2.5 rounded-xl text-xs bg-slate-900/60 border border-slate-800 text-slate-200 focus:outline-none focus:border-brand-500 transition"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-3xs text-slate-400 font-bold uppercase tracking-wider block">Endereço Email</label>
                  <div className="relative">
                    <Mail size={12} className="absolute left-3.5 top-3.5 text-slate-500" />
                    <input
                      type="email"
                      required
                      placeholder="seu.nome@escola.pt"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl text-xs bg-slate-900/60 border border-slate-800 text-slate-200 focus:outline-none focus:border-brand-500 transition"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-xs font-bold text-white transition shadow-lg shadow-brand-500/10 cursor-pointer disabled:opacity-50"
                >
                  {loading ? <Loader2 className="animate-spin" size={14} /> : <UserPlus size={14} />}
                  <span>Criar Nova Conta</span>
                </button>
              </form>
            ) : (
              // LOGIN FORM
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-3xs text-slate-400 font-bold uppercase tracking-wider block">Endereço Email</label>
                  <div className="relative">
                    <Mail size={12} className="absolute left-3.5 top-3.5 text-slate-500" />
                    <input
                      type="email"
                      required
                      placeholder="exemplo@escola.pt"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl text-xs bg-slate-900/60 border border-slate-800 text-slate-200 focus:outline-none focus:border-brand-500 transition"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="text-3xs text-slate-400 font-bold uppercase tracking-wider block">Palavra-passe</label>
                  </div>
                  <div className="relative">
                    <Lock size={12} className="absolute left-3.5 top-3.5 text-slate-500" />
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl text-xs bg-slate-900/60 border border-slate-800 text-slate-200 focus:outline-none focus:border-brand-500 transition"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-xs font-bold text-white transition shadow-lg shadow-brand-500/10 cursor-pointer disabled:opacity-50"
                >
                  {loading ? <Loader2 className="animate-spin" size={14} /> : <LogIn size={14} />}
                  <span>Entrar na Área Letiva</span>
                </button>
              </form>
            )}

            {/* Divider */}
            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-850"></div>
              </div>
              <div className="relative flex justify-center text-4xs uppercase">
                <span className="bg-[#141a27] px-2 text-slate-500 font-semibold">Ou aceder com</span>
              </div>
            </div>

            {/* Google Button */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-900/60 hover:bg-slate-800/80 text-xs font-bold text-slate-200 border border-slate-800 hover:border-slate-700 transition cursor-pointer disabled:opacity-50"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
              </svg>
              <span>Entrar com o Google</span>
            </button>
          </div>

          {/* Local fallback action */}
          <div className="mt-8 border-t border-slate-850 pt-4 flex items-center justify-between text-3xs text-slate-550">
            <span>Deseja testar sem base de dados?</span>
            <button 
              onClick={onBypass}
              className="text-slate-400 hover:text-brand-400 font-semibold underline cursor-pointer"
            >
              Usar Demonstração Local
            </button>
          </div>
        </div>

        {/* RIGHT CARD: QUICK DEMO LOGINS */}
        <div className="md:col-span-5 glass rounded-3xl border border-slate-800 p-8 flex flex-col justify-between shadow-2xl relative bg-slate-900/30">
          <div className="space-y-6">
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5 border-b border-slate-850 pb-2">
              <Sparkles size={16} className="text-brand-400 fill-brand-400/10" />
              Acesso Rápido de Teste
            </h3>

            <div className="space-y-2">
              {demoUsers.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => handleQuickLogin(item.email)}
                  disabled={loading || seeding}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-900/40 hover:bg-slate-800/60 border border-slate-850 hover:border-slate-700/60 text-left transition duration-300 group cursor-pointer disabled:opacity-50"
                >
                  <div className="flex items-center gap-2.5">
                    <div className={`p-1.5 rounded-lg ${item.role === 'teacher' ? 'bg-brand-500/10 text-brand-450' : item.role === 'admin' ? 'bg-rose-500/10 text-rose-450' : 'bg-slate-800 text-slate-400'}`}>
                      <UserCheck size={12} />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-200 block leading-tight">{item.name}</span>
                      <span className="text-4xs text-slate-550 block mt-0.5">{item.desc}</span>
                    </div>
                  </div>
                  <ChevronRight size={12} className="text-slate-650 group-hover:text-slate-350 group-hover:translate-x-0.5 transition duration-300 shrink-0" />
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 border-t border-slate-850 pt-5 space-y-3">
            <span className="text-3xs text-slate-400 font-bold block">Primeira utilização?</span>
            {seedSuccess && (
              <div className="p-2 rounded-lg text-3xs bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center gap-1">
                <Check size={12} /> Base de dados demo semeada!
              </div>
            )}
            <button
              onClick={handleSeedDatabase}
              disabled={seeding || seedSuccess}
              className="w-full flex items-center justify-center gap-1.5 py-2 bg-slate-850 hover:bg-slate-750 text-slate-300 hover:text-white rounded-lg border border-slate-700 hover:border-slate-650 transition text-3xs font-semibold cursor-pointer disabled:opacity-50"
            >
              {seeding ? <Loader2 size={10} className="animate-spin" /> : <Sparkles size={10} />}
              <span>{seeding ? 'A semear...' : 'Semear Base de Dados'}</span>
            </button>
            <div className="text-center text-5xs text-slate-600">
              Palavra-passe padrão: <strong>password123</strong>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
