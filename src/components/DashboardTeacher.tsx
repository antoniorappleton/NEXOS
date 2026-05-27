import React from 'react';
import { User, Class, Lesson, Assignment, Submission, GitHubRepoActivity, AttendanceRecord, AttendanceSession } from '../data/mockData';
import { Calendar, CheckSquare, Users, AlertCircle, Plus, FileText, ArrowRight, Play, Eye } from 'lucide-react';

interface DashboardTeacherProps {
  user: User;
  classes: Class[];
  lessons: Lesson[];
  assignments: Assignment[];
  submissions: Submission[];
  users: User[];
  githubRepoActivity: GitHubRepoActivity[];
  attendanceRecords: AttendanceRecord[];
  attendanceSessions: AttendanceSession[];
  onNavigate: (view: string, extra?: any) => void;
  onQuickAction: (actionType: string) => void;
}

export const DashboardTeacher: React.FC<DashboardTeacherProps> = ({
  user,
  classes,
  lessons,
  assignments,
  submissions,
  users,
  githubRepoActivity,
  attendanceRecords,
  attendanceSessions,
  onNavigate,
  onQuickAction,
}) => {
  // Calculations
  const teacherClasses = classes.filter(c => c.mainTeacherId === user.id);
  const totalClassesCount = teacherClasses.length;
  
  // Upcoming lessons (status is planned, ordered by date)
  const upcomingLessons = lessons
    .filter(l => l.status === 'planned')
    .sort((a, b) => new Date(a.plannedDate).getTime() - new Date(b.plannedDate).getTime());
  
  const nextLesson = upcomingLessons[0];
  const nextLessonClass = nextLesson ? classes.find(c => c.id === lessons.find(l => l.id === nextLesson.id)?.moduleId) : null; // simplified lookup

  // Submissions to grade (status submitted, finalGrade is undefined)
  const pendingGradesCount = submissions.filter(s => s.finalGrade === undefined).length;
  const pendingSubmissions = submissions.filter(s => s.finalGrade === undefined).map(sub => {
    const student = users.find(u => u.id === sub.studentId);
    const assignment = assignments.find(a => a.id === sub.assignmentId);
    return {
      submission: sub,
      studentName: student?.name || 'Desconhecido',
      assignmentTitle: assignment?.title || 'Trabalho',
      dueDate: assignment?.dueDate,
    };
  });

  // Helper to format activity times dynamically
  const formatActivityTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (isNaN(diffMs)) return 'Recentemente';
    if (diffMins < 0) return 'Recentemente';
    if (diffMins < 60) return `Há ${diffMins} min`;
    if (diffHours < 24) return `Há ${diffHours} ${diffHours === 1 ? 'hora' : 'horas'}`;
    if (diffHours < 48) return 'Ontem';
    return date.toLocaleDateString('pt-PT');
  };

  // Build dynamic activities list
  const dynamicActivities: Array<{ type: string; text: string; dateVal: Date; time: string; alert?: boolean }> = [];

  // 1. Submissions
  submissions.forEach(sub => {
    if (!sub.submittedAt) return;
    const student = users.find(u => u.id === sub.studentId);
    const assignment = assignments.find(a => a.id === sub.assignmentId);
    if (student && assignment) {
      dynamicActivities.push({
        type: 'submission',
        text: `${student.name} entregou "${assignment.title}"`,
        dateVal: new Date(sub.submittedAt),
        time: formatActivityTime(sub.submittedAt),
      });
    }
  });

  // 2. GitHub activities
  githubRepoActivity.forEach(act => {
    if (!act.lastCommitDate) return;
    const student = users.find(u => u.id === act.studentId);
    if (student) {
      dynamicActivities.push({
        type: 'github',
        text: `${student.name} comitou em "${act.repoName}"`,
        dateVal: new Date(act.lastCommitDate),
        time: formatActivityTime(act.lastCommitDate),
      });
    }
  });

  // 3. Absences/Late records
  attendanceRecords.forEach(rec => {
    if (rec.status === 'present') return;
    const student = users.find(u => u.id === rec.studentId);
    const session = attendanceSessions.find(s => s.id === rec.sessionId);
    const lesson = session ? lessons.find(l => l.id === session.lessonId) : null;
    
    if (student && session && lesson) {
      const isAbsent = rec.status === 'absent';
      dynamicActivities.push({
        type: 'attendance',
        text: `${student.name} ${isAbsent ? 'faltou' : 'atrasou-se'} à aula "${lesson.title}"`,
        dateVal: new Date(session.date),
        time: formatActivityTime(session.date),
        alert: isAbsent,
      });
    }
  });

  // 4. Summarized/Done lessons
  lessons.forEach(l => {
    if (l.status !== 'done' || !l.plannedDate) return;
    dynamicActivities.push({
      type: 'system',
      text: `Aula "${l.title}" foi sumariada e encerrada`,
      dateVal: new Date(l.plannedDate),
      time: formatActivityTime(l.plannedDate),
    });
  });

  // Sort activities by date descending and get the top 4
  const recentActivities = dynamicActivities
    .sort((a, b) => b.dateVal.getTime() - a.dateVal.getTime())
    .slice(0, 4);

  // Dynamic calculations for alerts: Count students with more than 1 absence or with average grade < 9.5
  const studentsAtRisk = users.filter(u => {
    if (u.role !== 'student') return false;
    
    // Check absences
    const absences = attendanceRecords.filter(r => r.studentId === u.id && r.status === 'absent').length;
    if (absences >= 2) return true;
    
    // Check average grade
    const studentSubmissions = submissions.filter(s => s.studentId === u.id && s.finalGrade !== undefined && s.finalGrade !== null);
    if (studentSubmissions.length > 0) {
      const sum = studentSubmissions.reduce((acc, curr) => acc + (curr.finalGrade || 0), 0);
      const avg = sum / studentSubmissions.length;
      if (avg < 9.5) return true;
    }
    return false;
  }).length;

  const currentDateFormatted = new Date().toLocaleDateString('pt-PT', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  const capitalizedDate = currentDateFormatted.charAt(0).toUpperCase() + currentDateFormatted.slice(1);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Greeting */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white md:text-4xl">
            Bem-vindo, {user.name.split(' ')[1] || user.name}
          </h1>
          <p className="mt-2 text-slate-400">
            Painel Geral do Docente — {capitalizedDate}
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => onQuickAction('new-lesson')}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white transition rounded-lg bg-brand-600 hover:bg-brand-700 shadow-lg shadow-brand-500/10 cursor-pointer"
          >
            <Plus size={16} />
            Nova Aula
          </button>
          <button
            onClick={() => onQuickAction('new-assignment')}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white transition rounded-lg bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-500/10 cursor-pointer"
          >
            <Plus size={16} />
            Novo Trabalho
          </button>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {/* Classes */}
        <div className="p-6 transition glass-card rounded-2xl glass-card-hover">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-400">Turmas Ativas</span>
            <div className="p-2 text-blue-400 bg-blue-500/10 rounded-lg">
              <Users size={20} />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-bold text-white">{totalClassesCount}</span>
            <p className="mt-1 text-xs text-slate-500">Sob sua responsabilidade</p>
          </div>
        </div>

        {/* Next Class */}
        <div className="p-6 transition glass-card rounded-2xl glass-card-hover">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-400">Próxima Aula</span>
            <div className="p-2 text-purple-400 bg-purple-500/10 rounded-lg">
              <Calendar size={20} />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-lg font-bold text-white block truncate">
              {nextLesson ? nextLesson.title : 'Sem aulas planeadas'}
            </span>
            <p className="mt-1 text-xs text-slate-500">
              {nextLesson ? `Planeada para ${new Date(nextLesson.plannedDate).toLocaleDateString('pt-PT')}` : 'Planeamento completo'}
            </p>
          </div>
        </div>

        {/* Submissions Pending */}
        <div className="p-6 transition glass-card rounded-2xl glass-card-hover cursor-pointer" onClick={() => onNavigate('trabalhos')}>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-400">Por Corrigir</span>
            <div className="p-2 text-amber-400 bg-amber-500/10 rounded-lg">
              <CheckSquare size={20} />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-bold text-white">{pendingGradesCount}</span>
            <p className="mt-1 text-xs text-slate-500">Submissões pendentes</p>
          </div>
        </div>

        {/* Alerts */}
        <div className="p-6 transition glass-card rounded-2xl glass-card-hover">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-400">Alertas Ativos</span>
            <div className="p-2 text-rose-400 bg-rose-500/10 rounded-lg">
              <AlertCircle size={20} />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-bold text-white">{studentsAtRisk}</span>
            <p className="mt-1 text-xs text-slate-500">Alunos em risco de reprova</p>
          </div>
        </div>
      </div>

      {/* Main Content Layout Grid */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Left column: Upcoming Lessons & Pending Grade Tasks */}
        <div className="space-y-8 lg:col-span-2">
          {/* Upcoming lessons list */}
          <div className="p-6 glass rounded-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Calendar size={18} className="text-brand-500" />
                Planeamento de Aulas Próximas
              </h2>
              <button onClick={() => onNavigate('planeamento')} className="text-xs font-semibold text-brand-400 hover:text-brand-300 flex items-center gap-1 cursor-pointer">
                Ver Completo <ArrowRight size={12} />
              </button>
            </div>
            
            <div className="space-y-4">
              {upcomingLessons.slice(0, 3).map((lesson) => {
                const isToday = lesson.plannedDate === '2026-05-20';
                return (
                  <div key={lesson.id} className="flex items-center justify-between p-4 rounded-xl bg-slate-800/40 border border-slate-700/30 hover:border-slate-700/60 transition">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${isToday ? 'bg-brand-500/20 text-brand-400' : 'bg-slate-700/30 text-slate-400'}`}>
                        <Play size={16} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-white text-sm">{lesson.title}</h3>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Duração: {lesson.durationMinutes} min • Modulo {lesson.moduleId === 'm-3' ? 'React' : 'JS'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-2xs font-bold uppercase tracking-wider ${isToday ? 'bg-brand-500/20 text-brand-400 border border-brand-500/30 animate-pulse' : 'bg-slate-800 text-slate-400 border border-slate-700'}`}>
                        {isToday ? 'Hoje' : lesson.plannedDate}
                      </span>
                    </div>
                  </div>
                );
              })}
              {upcomingLessons.length === 0 && (
                <p className="text-sm text-slate-500 text-center py-4">Nenhuma aula planeada nos próximos dias.</p>
              )}
            </div>
          </div>

          {/* Pending assignments list */}
          <div className="p-6 glass rounded-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <CheckSquare size={18} className="text-emerald-500" />
                Trabalhos por Corrigir
              </h2>
              <button onClick={() => onNavigate('trabalhos')} className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer">
                Ver Caixa de Correção <ArrowRight size={12} />
              </button>
            </div>

            <div className="space-y-4">
              {pendingSubmissions.slice(0, 3).map((item) => (
                <div key={item.submission.id} className="flex items-center justify-between p-4 rounded-xl bg-slate-800/40 border border-slate-700/30 hover:border-slate-700/60 transition">
                  <div>
                    <h3 className="font-semibold text-white text-sm">{item.assignmentTitle}</h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Entregue por: <span className="text-emerald-400 font-medium">{item.studentName}</span>
                    </p>
                  </div>
                  <button
                    onClick={() => onNavigate('trabalhos', { submissionId: item.submission.id })}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-2xs font-semibold text-white bg-slate-700 hover:bg-slate-600 rounded-lg transition cursor-pointer"
                  >
                    <Eye size={12} />
                    Avaliar
                  </button>
                </div>
              ))}
              {pendingSubmissions.length === 0 && (
                <p className="text-sm text-slate-500 text-center py-4">Tudo em dia! Nenhuma submissão pendente de avaliação.</p>
              )}
            </div>
          </div>
        </div>

        {/* Right column: Recent Activity and Quick Actions */}
        <div className="space-y-8">
          {/* Quick Actions Shortcuts */}
          <div className="p-6 glass rounded-2xl">
            <h2 className="text-lg font-bold text-white mb-4">Ações Rápidas</h2>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => onQuickAction('new-content')}
                className="flex flex-col items-center justify-center p-4 rounded-xl bg-slate-800/50 hover:bg-slate-800 border border-slate-700/40 hover:border-brand-500/35 transition text-center group cursor-pointer"
              >
                <div className="p-2.5 bg-brand-500/10 text-brand-400 rounded-lg group-hover:scale-110 transition duration-300">
                  <FileText size={20} />
                </div>
                <span className="text-xs font-semibold text-slate-200 mt-3">Upload Conteúdo</span>
              </button>

              <button
                onClick={() => onQuickAction('new-class')}
                className="flex flex-col items-center justify-center p-4 rounded-xl bg-slate-800/50 hover:bg-slate-800 border border-slate-700/40 hover:border-emerald-500/35 transition text-center group cursor-pointer"
              >
                <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-lg group-hover:scale-110 transition duration-300">
                  <Users size={20} />
                </div>
                <span className="text-xs font-semibold text-slate-200 mt-3">Criar Turma</span>
              </button>
            </div>
          </div>

          {/* Activity Logs timeline */}
          <div className="p-6 glass rounded-2xl">
            <h2 className="text-lg font-bold text-white mb-4">Atividade Recente</h2>
            <div className="relative border-l-2 border-slate-700 ml-3 space-y-6">
              {recentActivities.map((act, index) => (
                <div key={index} className="relative pl-6">
                  <div className={`absolute -left-[9px] top-1 w-4.5 h-4.5 rounded-full border-2 border-slate-900 ${act.alert ? 'bg-rose-500' : 'bg-brand-500'}`} />
                  <p className="text-sm text-slate-200">{act.text}</p>
                  <span className="text-2xs text-slate-500 mt-1 block">{act.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
