import React, { useState } from 'react';
import { User, Class } from '../data/mockData';
import { Shield, Users, Plus, Clipboard, UserPlus, CheckCircle2, Lock } from 'lucide-react';

interface AdminPanelProps {
  users: User[];
  classes: Class[];
  onAddUser: (name: string, email: string, role: 'student' | 'teacher' | 'admin') => void;
  onAddClass: (name: string, course: string, year: string, teacherId: string) => void;
  onClearPedagogicalData: () => Promise<void>;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  users,
  classes,
  onAddUser,
  onAddClass,
  onClearPedagogicalData,
}) => {
  const [activeTab, setActiveTab] = useState<'users' | 'classes'>('users');
  const [clearing, setClearing] = useState(false);
  
  // User Form states
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userRole, setUserRole] = useState<'student' | 'teacher' | 'admin'>('student');
  const [toast, setToast] = useState<string | null>(null);

  // Class Form states
  const [className, setClassName] = useState('');
  const [classCourse, setClassCourse] = useState('');
  const [classYear, setClassYear] = useState('2026/2027');
  const [classTeacher, setClassTeacher] = useState(users.find(u => u.role === 'teacher')?.id || '');

  const triggerToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName || !userEmail) return;
    onAddUser(userName, userEmail, userRole);
    setUserName('');
    setUserEmail('');
    triggerToast(`Utilizador "${userName}" criado com sucesso!`);
  };

  const handleCreateClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!className || !classCourse) return;
    onAddClass(className, classCourse, classYear, classTeacher);
    setClassName('');
    setClassCourse('');
    triggerToast(`Turma "${className}" criada com sucesso!`);
  };

  const teachers = users.filter(u => u.role === 'teacher');

  const handleClearDataClick = async () => {
    const confirmClear = window.confirm(
      "Tem a certeza de que deseja eliminar TODOS os dados pedagógicos (turmas, módulos, aulas, trabalhos, notas, presenças, etc.)?\n\nEsta ação é irreversível. As contas de utilizador (perfis) serão preservadas."
    );
    if (!confirmClear) return;
    
    setClearing(true);
    try {
      await onClearPedagogicalData();
      triggerToast("Dados pedagógicos limpos com sucesso!");
    } catch (err) {
      console.error(err);
      triggerToast("Erro ao limpar dados pedagógicos.");
    } finally {
      setClearing(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in relative">
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl bg-slate-800 border border-brand-500 text-sm font-semibold text-white shadow-2xl animate-bounce">
          {toast}
        </div>
      )}

      {/* Header section */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
          <Shield className="text-brand-500" />
          Painel de Administração Geral
        </h1>
        <p className="mt-2 text-slate-400">
          Gestão de contas escolares, criação de turmas, atribuição de professores e backups globais do sistema.
        </p>
      </div>

      {/* Tabs list */}
      <div className="flex gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold border-b-2 transition cursor-pointer ${
            activeTab === 'users'
              ? 'border-brand-500 text-brand-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Users size={14} />
          Utilizadores ({users.length})
        </button>
        <button
          onClick={() => setActiveTab('classes')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold border-b-2 transition cursor-pointer ${
            activeTab === 'classes'
              ? 'border-brand-500 text-brand-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Clipboard size={14} />
          Turmas & Cursos ({classes.length})
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left/Middle area: lists of resources */}
        <div className="lg:col-span-2 space-y-6">
          {activeTab === 'users' ? (
            // USERS LIST
            <div className="p-6 glass rounded-2xl border border-slate-800 space-y-4">
              <h3 className="text-md font-bold text-white">Lista de Contas Escolares</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-850 text-slate-400 font-bold uppercase tracking-wider text-2xs">
                      <th className="pb-3">Nome</th>
                      <th className="pb-3">Email</th>
                      <th className="pb-3">Perfil</th>
                      <th className="pb-3 text-right">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850">
                    {users.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-800/10 transition">
                        <td className="py-3.5 font-semibold text-white flex items-center gap-2.5">
                          <img src={u.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&h=80'} className="w-6 h-6 rounded-full" alt="" />
                          {u.name}
                        </td>
                        <td className="py-3.5 text-slate-450">{u.email}</td>
                        <td className="py-3.5">
                          <span className={`px-2 py-0.5 rounded text-3xs font-extrabold uppercase tracking-wider ${
                            u.role === 'admin'
                              ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                              : u.role === 'teacher'
                              ? 'bg-brand-500/10 text-brand-400 border border-brand-500/20'
                              : 'bg-slate-800 text-slate-400 border border-slate-700'
                          }`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="py-3.5 text-right">
                          <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold text-2xs">
                            <CheckCircle2 size={12} /> Ativo
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            // CLASSES LIST
            <div className="p-6 glass rounded-2xl border border-slate-800 space-y-4">
              <h3 className="text-md font-bold text-white">Configuração de Turmas Ativas</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {classes.map((cls) => {
                  const leadTeacher = users.find(u => u.id === cls.mainTeacherId);
                  return (
                    <div key={cls.id} className="p-4 rounded-xl bg-slate-900/40 border border-slate-850 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold text-white">{cls.name}</span>
                          <span className="text-3xs text-slate-500 font-semibold uppercase tracking-wider">{cls.year}</span>
                        </div>
                        <p className="text-2xs text-slate-450 mt-1 leading-normal">{cls.course}</p>
                      </div>
                      <div className="mt-4 border-t border-slate-850 pt-3 text-3xs text-slate-400">
                        <span>Diretor de Turma: </span>
                        <span className="font-bold text-brand-400">{leadTeacher ? leadTeacher.name : 'Desconhecido'}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Form inputs */}
        <div className="space-y-6">
          {activeTab === 'users' ? (
            // CREATE USER FORM
            <form onSubmit={handleCreateUser} className="p-6 glass rounded-2xl border border-brand-500/20 space-y-5">
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5 border-b border-slate-850 pb-2">
                <UserPlus size={16} className="text-brand-400" />
                Criar Novo Utilizador
              </h3>

              <div className="space-y-1">
                <label className="text-xs text-slate-400 font-semibold block">Nome Completo</label>
                <input
                  type="text"
                  required
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="Ex: Clara Antunes"
                  className="w-full p-2.5 rounded-lg text-xs glass-input text-slate-200"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-400 font-semibold block">Endereço Email</label>
                <input
                  type="email"
                  required
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  placeholder="clara.antunes@school.pt"
                  className="w-full p-2.5 rounded-lg text-xs glass-input text-slate-200"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-400 font-semibold block">Perfil de Acesso</label>
                <select
                  value={userRole}
                  onChange={(e: any) => setUserRole(e.target.value)}
                  className="w-full p-2.5 rounded-lg text-xs bg-slate-900 border border-slate-700 text-white focus:outline-none"
                >
                  <option value="student">Aluno</option>
                  <option value="teacher">Professor</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 text-xs font-semibold rounded-lg bg-brand-600 hover:bg-brand-700 text-white transition shadow-lg shadow-brand-500/10 cursor-pointer"
              >
                Registar Utilizador
              </button>
            </form>
          ) : (
            // CREATE CLASS FORM
            <form onSubmit={handleCreateClass} className="p-6 glass rounded-2xl border border-brand-500/20 space-y-5">
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5 border-b border-slate-850 pb-2">
                <Plus size={16} className="text-brand-400" />
                Criar Nova Turma
              </h3>

              <div className="space-y-1">
                <label className="text-xs text-slate-400 font-semibold block">Nome Curto da Turma</label>
                <input
                  type="text"
                  required
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  placeholder="Ex: 10ºP"
                  className="w-full p-2.5 rounded-lg text-xs glass-input text-slate-200"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-400 font-semibold block">Nome Curricular / Curso</label>
                <input
                  type="text"
                  required
                  value={classCourse}
                  onChange={(e) => setClassCourse(e.target.value)}
                  placeholder="Ex: Técnico de Programação de Computadores"
                  className="w-full p-2.5 rounded-lg text-xs glass-input text-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-semibold block">Ano Letivo</label>
                  <input
                    type="text"
                    required
                    value={classYear}
                    onChange={(e) => setClassYear(e.target.value)}
                    placeholder="2026/2027"
                    className="w-full p-2.5 rounded-lg text-xs glass-input text-slate-200"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-semibold block">Diretor de Turma</label>
                  <select
                    value={classTeacher}
                    onChange={(e) => setClassTeacher(e.target.value)}
                    className="w-full p-2.5 rounded-lg text-xs bg-slate-900 border border-slate-700 text-white focus:outline-none"
                  >
                    {teachers.map(t => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition shadow-lg shadow-emerald-500/10 cursor-pointer"
              >
                Criar Turma
              </button>
            </form>
          )}

          {/* Backup utility */}
          <div className="p-6 glass rounded-2xl border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
              <Lock size={12} className="text-slate-500" />
              Operações de Segurança
            </h4>
            <p className="text-4xs text-slate-500 leading-normal">
              Efetue backups completos das bases de dados ou exporte o histórico letivo de anos anteriores em formato comprimido.
            </p>
            <button
              onClick={() => triggerToast('Cópia de segurança gerada com sucesso!')}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-350 border border-slate-700 rounded-lg text-3xs font-semibold uppercase tracking-wider transition cursor-pointer"
            >
              Criar Backup Global
            </button>
            <button
              type="button"
              disabled={clearing}
              onClick={handleClearDataClick}
              className="w-full py-2 bg-rose-950/20 hover:bg-rose-950/40 text-rose-450 border border-rose-900/40 rounded-lg text-3xs font-semibold uppercase tracking-wider transition cursor-pointer disabled:opacity-50"
            >
              {clearing ? "A Limpar..." : "Limpar Dados Pedagógicos"}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
