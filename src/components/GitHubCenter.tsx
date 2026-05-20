import React, { useState } from 'react';
import { User, GitHubAccount, GitHubRepoActivity } from '../data/mockData';
import { Code2, RefreshCw, GitCommit, ExternalLink, Calendar, Plus, Users } from 'lucide-react';
import { Github } from './Icons';

interface GitHubCenterProps {
  user: User;
  accounts: GitHubAccount[];
  repoActivity: GitHubRepoActivity[];
  students: User[];
  onConnectGitHub: (username: string) => void;
}

export const GitHubCenter: React.FC<GitHubCenterProps> = ({
  user,
  accounts,
  repoActivity,
  students,
  onConnectGitHub,
}) => {
  const [gitUsername, setGitUsername] = useState('');
  const [syncing, setSyncing] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // Check if current user is linked
  const isLinked = accounts.some(a => a.userId === user.id);
  const connectedAccount = accounts.find(a => a.userId === user.id);

  // Filter repos
  const userRepos = repoActivity.filter(r => r.studentId === user.id);

  const handleLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!gitUsername) return;
    onConnectGitHub(gitUsername);
    setGitUsername('');
    setToast('GitHub conectado via OAuth com sucesso!');
    setTimeout(() => setToast(null), 3000);
  };

  const handleSync = () => {
    setSyncing(true);
    setTimeout(() => {
      setSyncing(false);
      setToast('Sincronização completa dos repositórios!');
      setTimeout(() => setToast(null), 3000);
    }, 1500);
  };

  // Mock GitHub Contributions Grid data (5 rows x 15 columns of commits activity)
  const contributionGrid = Array.from({ length: 5 }, (_, rowIndex) =>
    Array.from({ length: 18 }, (_, colIndex) => {
      const intensities = [0, 0, 1, 0, 2, 0, 1, 3, 0, 1, 0, 2, 4, 1, 0];
      const rand = intensities[(rowIndex + colIndex * 3) % intensities.length];
      return rand;
    })
  );

  return (
    <div className="space-y-8 animate-fade-in relative">
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl bg-slate-800 border border-brand-500 text-sm font-semibold text-white shadow-2xl animate-bounce">
          {toast}
        </div>
      )}

      {/* Header section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
            <Github className="text-slate-100" />
            GitHub Integration Center
          </h1>
          <p className="mt-2 text-slate-400">
            Acompanhamento de commits, repositórios de projetos e portfólio de código dos alunos.
          </p>
        </div>
        <button
          onClick={handleSync}
          className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-slate-850 hover:bg-slate-800 text-slate-350 border border-slate-700 transition cursor-pointer"
        >
          <RefreshCw size={12} className={syncing ? 'animate-spin' : ''} />
          {syncing ? 'A Sincronizar...' : 'Sincronizar Repos'}
        </button>
      </div>

      {user.role === 'student' ? (
        // STUDENT INTERFACE
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Side: contribution metrics and repos */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Account Status / Linking card */}
            <div className="p-6 glass rounded-2xl border border-slate-800">
              {isLinked ? (
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-brand-500/10 text-brand-400 rounded-xl">
                      <Github size={24} />
                    </div>
                    <div>
                      <h2 className="text-md font-bold text-white">Conta GitHub Ligada</h2>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Utilizador: <span className="text-brand-400 font-semibold">@{connectedAccount?.githubUsername}</span>
                      </p>
                    </div>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-2xs font-extrabold bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
                    Ligado
                  </span>
                </div>
              ) : (
                <form onSubmit={handleLink} className="space-y-4">
                  <div>
                    <h2 className="text-md font-bold text-white">Ligar Conta do GitHub</h2>
                    <p className="text-xs text-slate-400 mt-1">
                      Associa a tua conta para sincronizar automaticamente os commits e projetos diretamente para o teu portfólio.
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <div className="flex items-center gap-2 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs w-full max-w-xs">
                      <Github size={14} className="text-slate-500" />
                      <input
                        type="text"
                        required
                        placeholder="Utilizador do GitHub"
                        value={gitUsername}
                        onChange={(e) => setGitUsername(e.target.value)}
                        className="bg-transparent text-slate-200 outline-none w-full placeholder-slate-650"
                      />
                    </div>
                    <button
                      type="submit"
                      className="px-4 py-2.5 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-lg transition cursor-pointer"
                    >
                      Autenticar OAuth
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Repositories Activity lists */}
            <div className="p-6 glass rounded-2xl border border-slate-800 space-y-4">
              <h3 className="text-md font-bold text-white flex items-center gap-2">
                <Code2 size={18} className="text-brand-500" />
                Repositórios de Projetos Sincronizados
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {userRepos.map((repo) => (
                  <div key={repo.id} className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 hover:border-slate-700/60 transition flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white block truncate">{repo.repoName}</span>
                        <a href={repo.repoUrl} target="_blank" rel="noreferrer" className="text-slate-550 hover:text-white transition">
                          <ExternalLink size={12} />
                        </a>
                      </div>
                      <p className="text-3xs text-slate-500 mt-1 flex items-center gap-1">
                        <Calendar size={10} />
                        Último commit: {new Date(repo.lastCommitDate).toLocaleDateString('pt-PT')}
                      </p>
                    </div>

                    <div className="mt-4 flex items-center justify-between border-t border-slate-850 pt-3 text-3xs">
                      <span className="text-slate-400 flex items-center gap-1 font-semibold">
                        <GitCommit size={10} />
                        {repo.commitsCount} Commits
                      </span>
                      <div className="flex gap-1.5">
                        {repo.languages.map((l, i) => (
                          <span key={i} className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-400 font-extrabold uppercase">
                            {l}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
                {userRepos.length === 0 && (
                  <p className="text-xs text-slate-500 text-center py-4 col-span-2">
                    Nenhum repositório de trabalho associado de momento.
                  </p>
                )}
              </div>
            </div>

          </div>

          {/* Right column: Contributions Grid and activity history */}
          <div className="space-y-6">
            
            {/* Visual Contribution Graph Grid */}
            <div className="p-6 glass rounded-2xl border border-slate-800 space-y-4">
              <span className="text-2xs font-extrabold uppercase tracking-widest text-slate-500 block">Gráfico de Contribuições (Commits)</span>
              
              <div className="flex flex-col gap-1 items-center bg-slate-950/40 p-4 rounded-xl border border-slate-900">
                {contributionGrid.map((row, rIdx) => (
                  <div key={rIdx} className="flex gap-1">
                    {row.map((intensity, cIdx) => {
                      const bgClasses = [
                        'bg-slate-900/80',
                        'bg-emerald-950 text-emerald-800',
                        'bg-emerald-800 text-emerald-650',
                        'bg-emerald-650 text-emerald-500',
                        'bg-emerald-500 text-emerald-450'
                      ];
                      return (
                        <div
                          key={cIdx}
                          className={`w-3.5 h-3.5 rounded-sm ${bgClasses[intensity]}`}
                          title={`${intensity * 3} commits`}
                        />
                      );
                    })}
                  </div>
                ))}
              </div>
              
              <div className="flex justify-between items-center text-3xs text-slate-500 font-semibold uppercase">
                <span>Menos</span>
                <div className="flex gap-1">
                  <div className="w-2.5 h-2.5 bg-slate-900 rounded-sm" />
                  <div className="w-2.5 h-2.5 bg-emerald-950 rounded-sm" />
                  <div className="w-2.5 h-2.5 bg-emerald-800 rounded-sm" />
                  <div className="w-2.5 h-2.5 bg-emerald-650 rounded-sm" />
                  <div className="w-2.5 h-2.5 bg-emerald-505 bg-emerald-500 rounded-sm" />
                </div>
                <span>Mais</span>
              </div>
            </div>

            {/* Commits logs feeds */}
            <div className="p-6 glass rounded-2xl border border-slate-800 space-y-4">
              <span className="text-2xs font-extrabold uppercase tracking-widest text-slate-500 block">Commit Log Recente</span>
              <div className="space-y-3 text-xs leading-relaxed max-h-[180px] overflow-y-auto pr-1">
                <div className="p-2 rounded bg-slate-900/35 border border-slate-850">
                  <span className="font-bold text-slate-300 block text-3xs">feat: add basic state hooks for transaction lists</span>
                  <span className="text-3xs text-slate-550 block mt-1">react-finance-dashboard • Há 12 horas</span>
                </div>
                <div className="p-2 rounded bg-slate-900/35 border border-slate-850">
                  <span className="font-bold text-slate-300 block text-3xs">fix: solve LocalStorage crash on empty arrays</span>
                  <span className="text-3xs text-slate-550 block mt-1">javascript-clicker-game • Há 3 dias</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      ) : (
        // TEACHER INTERFACE (portal view for class code tracking)
        <div className="p-6 glass rounded-2xl border border-slate-800 space-y-4">
          <h3 className="text-md font-bold text-white flex items-center gap-2">
            <Users size={18} className="text-brand-500" />
            Atividade de Código da Turma (12ºP)
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-850 text-slate-400 font-bold uppercase tracking-wider text-2xs">
                  <th className="pb-3">Aluno</th>
                  <th className="pb-3">GitHub Link</th>
                  <th className="pb-3">Repositórios Sincronizados</th>
                  <th className="pb-3">Último Commit</th>
                  <th className="pb-3 text-right">Commits Totais</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850">
                {students.map((stud) => {
                  const acc = accounts.find(a => a.userId === stud.id);
                  const studentRepos = repoActivity.filter(r => r.studentId === stud.id);
                  const totalCommits = studentRepos.reduce((sum, r) => sum + r.commitsCount, 0);
                  const lastCommitRepo = [...studentRepos].sort((a, b) => new Date(b.lastCommitDate).getTime() - new Date(a.lastCommitDate).getTime())[0];

                  return (
                    <tr key={stud.id} className="hover:bg-slate-800/10 transition">
                      <td className="py-3.5 font-semibold text-white flex items-center gap-2.5">
                        <img src={stud.avatar} className="w-6 h-6 rounded-full" alt="" />
                        {stud.name}
                      </td>
                      <td className="py-3.5">
                        {acc ? (
                          <a
                            href={`https://github.com/${acc.githubUsername}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-brand-400 font-semibold hover:underline flex items-center gap-1"
                          >
                            @{acc.githubUsername}
                            <ExternalLink size={10} />
                          </a>
                        ) : (
                          <span className="text-slate-500 italic">Desconectado</span>
                        )}
                      </td>
                      <td className="py-3.5 text-slate-350">
                        {acc ? `${studentRepos.length} Repositórios` : '-'}
                      </td>
                      <td className="py-3.5 text-slate-400">
                        {lastCommitRepo ? (
                          <span>
                            {new Date(lastCommitRepo.lastCommitDate).toLocaleDateString('pt-PT')} em{' '}
                            <span className="text-slate-300 font-semibold">{lastCommitRepo.repoName}</span>
                          </span>
                        ) : '-'}
                      </td>
                      <td className="py-3.5 text-right font-black text-white">
                        {acc ? totalCommits : '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
export default GitHubCenter;
