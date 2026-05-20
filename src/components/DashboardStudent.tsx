import React from 'react';
import { User, Lesson, Assignment, Submission, Content, Grade, Module } from '../data/mockData';
import { Calendar, CheckCircle2, AlertTriangle, FileText, BarChart3, ExternalLink } from 'lucide-react';
import { Youtube } from './Icons';

interface DashboardStudentProps {
  user: User;
  lessons: Lesson[];
  assignments: Assignment[];
  submissions: Submission[];
  contents: Content[];
  grades: Grade[];
  modules: Module[];
  onNavigate: (view: string, extra?: any) => void;
}

export const DashboardStudent: React.FC<DashboardStudentProps> = ({
  user,
  lessons,
  assignments,
  submissions,
  contents,
  grades,
  modules,
  onNavigate
}) => {
  // Calculations
  const nextLesson = lessons
    .filter(l => l.status === 'planned')
    .sort((a, b) => new Date(a.plannedDate).getTime() - new Date(b.plannedDate).getTime())[0];

  const studentSubmissions = submissions.filter(s => s.studentId === user.id);

  // Group assignments into: pending and completed
  const assignmentsStatus = assignments.map(assign => {
    const submission = studentSubmissions.find(s => s.assignmentId === assign.id);
    const isOverdue = new Date(assign.dueDate).getTime() < new Date().getTime();
    
    let status: 'done' | 'pending' | 'overdue' = 'pending';
    if (submission) {
      status = 'done';
    } else if (isOverdue) {
      status = 'overdue';
    }

    return {
      assignment: assign,
      status,
      submission,
    };
  });

  const pendingAssignments = assignmentsStatus.filter(a => a.status !== 'done');
  const completedAssignments = assignmentsStatus.filter(a => a.status === 'done');

  // Recent contents (last 3 items)
  const recentContents = [...contents]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3);

  // Student grades
  const studentGrades = grades.filter(g => g.studentId === user.id);
  const averageGrade = studentGrades.length > 0
    ? (studentGrades.reduce((sum, g) => sum + Number(g.finalGrade), 0) / studentGrades.length).toFixed(1)
    : 'N/A';

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Banner */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white md:text-4xl">
          Olá, {user.name.split(' ')[0]}
        </h1>
        <p className="mt-2 text-slate-400">
          Esta é a tua área de aprendizagem pessoal — Bom trabalho para hoje!
        </p>
      </div>

      {/* Overview Grid */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Left Column: Next Class & Active Assignments */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Next Class Notification widget */}
          <div className="p-6 bg-gradient-to-br from-brand-900/50 to-brand-950/45 border border-brand-500/25 rounded-2xl flex items-center justify-between">
            <div className="space-y-2">
              <span className="text-2xs font-bold text-brand-400 uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-brand-500/10 border border-brand-500/20">
                Próxima Aula
              </span>
              <h2 className="text-xl font-bold text-white mt-2">
                {nextLesson ? nextLesson.title : 'Sem aulas planeadas de momento'}
              </h2>
              <p className="text-sm text-slate-300">
                {nextLesson ? 'Quarta-feira, 20 de Maio às 14:30' : 'Aproveita para colocar os trabalhos em dia!'}
              </p>
            </div>
            <div className="hidden sm:block p-4 text-brand-400 bg-brand-500/10 border border-brand-500/20 rounded-xl">
              <Calendar size={32} />
            </div>
          </div>

          {/* Assignments Checklist */}
          <div className="p-6 glass rounded-2xl space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <CheckCircle2 size={18} className="text-brand-500" />
              Trabalhos & Entregas
            </h2>
            
            <div className="space-y-3">
              {/* Pending Assignments */}
              {pendingAssignments.map(({ assignment, status }) => {
                const isOverdue = status === 'overdue';
                return (
                  <div key={assignment.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-slate-800/40 border border-slate-700/30 hover:border-slate-700/60 transition gap-4">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg mt-0.5 ${isOverdue ? 'bg-rose-500/10 text-rose-400' : 'bg-amber-500/10 text-amber-400'}`}>
                        <AlertTriangle size={18} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-white text-sm">{assignment.title}</h3>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Entrega: {new Date(assignment.dueDate).toLocaleDateString('pt-PT')} às {new Date(assignment.dueDate).toLocaleTimeString('pt-PT', {hour: '2-digit', minute:'2-digit'})}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-0.5 rounded text-2xs font-semibold ${isOverdue ? 'bg-rose-500/10 text-rose-400 border border-rose-500/25' : 'bg-amber-500/10 text-amber-400 border border-amber-500/25'}`}>
                        {isOverdue ? 'Fora do Prazo' : 'Pendente'}
                      </span>
                      <button
                        onClick={() => onNavigate('trabalhos')}
                        className="px-3.5 py-1.5 text-2xs font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-lg transition cursor-pointer"
                      >
                        Submeter
                      </button>
                    </div>
                  </div>
                );
              })}

              {/* Completed Assignments */}
              {completedAssignments.map(({ assignment, submission }) => (
                <div key={assignment.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-slate-900/30 border border-slate-800/80 transition opacity-80 gap-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg mt-0.5">
                      <CheckCircle2 size={18} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white text-sm">{assignment.title}</h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Submetido a: {new Date(submission?.submittedAt || '').toLocaleDateString('pt-PT')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="px-2 py-0.5 rounded text-2xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
                      Submetido
                    </span>
                    {submission?.finalGrade !== undefined ? (
                      <span className="text-sm font-bold text-emerald-400">
                        Nota: {submission.finalGrade}
                      </span>
                    ) : (
                      <span className="text-xs text-slate-500 italic">Por avaliar</span>
                    )}
                  </div>
                </div>
              ))}

              {assignments.length === 0 && (
                <p className="text-sm text-slate-500 text-center py-4">Nenhum trabalho atribuído nesta disciplina.</p>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Grades Snapshot & Library Materials */}
        <div className="space-y-8">
          
          {/* Personal Grades card */}
          <div className="p-6 glass rounded-2xl space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <BarChart3 size={18} className="text-brand-500" />
              As Minhas Notas
            </h2>
            <div className="flex items-baseline justify-between">
              <span className="text-sm text-slate-400">Média Geral Ponderada</span>
              <span className="text-3xl font-extrabold text-brand-400">{averageGrade}</span>
            </div>
            <div className="border-t border-slate-800 pt-4 space-y-3">
              {studentGrades.map((grade) => {
                const mod = modules.find(m => m.id === grade.moduleId);
                return (
                  <div key={grade.id} className="flex justify-between items-center text-sm">
                    <span className="text-slate-300 truncate max-w-[150px]">{mod ? mod.name : 'Módulo'}</span>
                    <div className="flex items-center gap-3">
                      <div className="w-16 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-brand-500 h-full"
                          style={{ width: `${(grade.finalGrade / 20) * 100}%` }}
                        />
                      </div>
                      <span className="font-bold text-white">{grade.finalGrade}</span>
                    </div>
                  </div>
                );
              })}
              {studentGrades.length === 0 && (
                <p className="text-xs text-slate-500 text-center py-2">Sem notas registadas.</p>
              )}
            </div>
          </div>

          {/* Newest materials list */}
          <div className="p-6 glass rounded-2xl space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <FileText size={18} className="text-emerald-500" />
              Últimos Conteúdos
            </h2>

            <div className="space-y-3">
              {recentContents.map((content) => (
                <div
                  key={content.id}
                  onClick={() => onNavigate('conteudos')}
                  className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/30 hover:border-brand-500/25 transition cursor-pointer flex items-center justify-between group"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="p-2 text-slate-300 bg-slate-700/30 rounded-lg shrink-0">
                      {content.type === 'video' ? <Youtube size={16} className="text-rose-400" /> : <FileText size={16} />}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-semibold text-white truncate group-hover:text-brand-400 transition">
                        {content.title}
                      </h4>
                      <span className="text-3xs text-slate-500 block">{content.technology} • {content.difficulty}</span>
                    </div>
                  </div>
                  <ExternalLink size={12} className="text-slate-500 opacity-0 group-hover:opacity-100 transition" />
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
