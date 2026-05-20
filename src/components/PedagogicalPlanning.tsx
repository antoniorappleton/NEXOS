import React, { useState } from 'react';
import { User, Module, Lesson, AttendanceRecord } from '../data/mockData';
import { BookOpen, Calendar, Clock, Plus, CheckCircle2, Circle, AlertCircle, Edit, Users } from 'lucide-react';

interface PedagogicalPlanningProps {
  user: User;
  modules: Module[];
  lessons: Lesson[];
  students: User[];
  onAddLesson: (newLesson: Omit<Lesson, 'id'>) => void;
  onLogLesson: (lessonId: string, summary: string, topics: string, obs: string, attendance: { [studentId: string]: 'present' | 'absent' | 'late' | 'justified' }) => void;
}

export const PedagogicalPlanning: React.FC<PedagogicalPlanningProps> = ({
  user,
  modules,
  lessons,
  students,
  onAddLesson,
  onLogLesson,
}) => {
  const [expandedModuleId, setExpandedModuleId] = useState<string | null>('m-1');
  const [selectedLessonForLog, setSelectedLessonForLog] = useState<Lesson | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form states for new lesson
  const [newTitle, setNewTitle] = useState('');
  const [newModuleId, setNewModuleId] = useState(modules[0]?.id || '');
  const [newDate, setNewDate] = useState('2026-05-21');
  const [newDuration, setNewDuration] = useState(90);
  const [newDesc, setNewDesc] = useState('');

  // Form states for lesson logging
  const [logSummary, setLogSummary] = useState('');
  const [logTopics, setLogTopics] = useState('');
  const [logObs, setLogObs] = useState('');
  const [logAttendance, setLogAttendance] = useState<{ [studentId: string]: 'present' | 'absent' | 'late' | 'justified' }>({});

  const handleOpenLog = (lesson: Lesson) => {
    setSelectedLessonForLog(lesson);
    setLogSummary(lesson.summary || '');
    setLogTopics(lesson.topicsCovered || '');
    setLogObs(lesson.observations || '');
    
    // Pre-populate attendance to 'present' for all students
    const initialAttendance: { [studentId: string]: 'present' | 'absent' | 'late' | 'justified' } = {};
    students.forEach(s => {
      initialAttendance[s.id] = 'present';
    });
    setLogAttendance(initialAttendance);
  };

  const handleSaveLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedLessonForLog) {
      onLogLesson(
        selectedLessonForLog.id,
        logSummary,
        logTopics,
        logObs,
        logAttendance
      );
      setSelectedLessonForLog(null);
    }
  };

  const handleSaveLesson = (e: React.FormEvent) => {
    e.preventDefault();
    onAddLesson({
      moduleId: newModuleId,
      teacherId: user.role === 'teacher' ? user.id : 'u-1',
      title: newTitle,
      description: newDesc,
      plannedDate: newDate,
      durationMinutes: Number(newDuration),
      status: 'planned'
    });
    setNewTitle('');
    setNewDesc('');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Planeamento Pedagógico</h1>
          <p className="mt-2 text-slate-400">Desenho curricular, módulos da disciplina e registo diário de aulas.</p>
        </div>
        {user.role === 'teacher' && (
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white transition rounded-lg bg-brand-600 hover:bg-brand-700 shadow-lg shadow-brand-500/10 cursor-pointer"
          >
            <Plus size={16} />
            Planear Aula
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side: Modules & Expandable Lessons */}
        <div className="lg:col-span-2 space-y-4">
          {modules.map((mod) => {
            const isExpanded = expandedModuleId === mod.id;
            const moduleLessons = lessons.filter(l => l.moduleId === mod.id);
            const doneLessonsCount = moduleLessons.filter(l => l.status === 'done').length;

            return (
              <div key={mod.id} className="glass rounded-2xl overflow-hidden transition-all duration-300 border border-slate-800">
                {/* Module title bar */}
                <div
                  onClick={() => setExpandedModuleId(isExpanded ? null : mod.id)}
                  className="p-5 flex items-center justify-between cursor-pointer hover:bg-slate-800/25 transition select-none"
                >
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-brand-500/10 text-brand-400 rounded-xl mt-0.5">
                      <BookOpen size={20} />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-white group-hover:text-brand-400 transition">
                        Mód. {mod.orderIndex}: {mod.name}
                      </h2>
                      <p className="text-xs text-slate-400 mt-1 mr-4 line-clamp-1">{mod.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xs font-semibold px-2.5 py-1 bg-slate-800 rounded-full border border-slate-700 text-slate-400">
                      {doneLessonsCount}/{moduleLessons.length} Aulas
                    </span>
                  </div>
                </div>

                {/* Lessons inside the module */}
                {isExpanded && (
                  <div className="border-t border-slate-800/80 bg-slate-950/20 p-5 space-y-3">
                    {moduleLessons.map((lesson) => {
                      const isDone = lesson.status === 'done';
                      return (
                        <div
                          key={lesson.id}
                          className={`p-4 rounded-xl border transition ${
                            isDone
                              ? 'bg-slate-900/40 border-slate-800/80 opacity-90'
                              : 'bg-slate-800/40 border-slate-700/30'
                          }`}
                        >
                          <div className="flex items-start justify-between flex-wrap gap-4">
                            <div className="flex gap-3">
                              <div className="mt-1">
                                {isDone ? (
                                  <CheckCircle2 size={16} className="text-emerald-500" />
                                ) : (
                                  <Circle size={16} className="text-slate-500 animate-pulse" />
                                )}
                              </div>
                              <div>
                                <h3 className="text-sm font-semibold text-white">{lesson.title}</h3>
                                <p className="text-xs text-slate-400 mt-1 max-w-xl">{lesson.description}</p>
                                
                                <div className="flex items-center gap-4 text-3xs text-slate-500 font-medium mt-3 uppercase tracking-wider">
                                  <span className="flex items-center gap-1">
                                    <Calendar size={10} />
                                    {lesson.plannedDate}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Clock size={10} />
                                    {lesson.durationMinutes} minutos
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div>
                              {user.role === 'teacher' && !isDone && (
                                <button
                                  onClick={() => handleOpenLog(lesson)}
                                  className="flex items-center gap-1 px-3 py-1.5 text-3xs font-bold uppercase tracking-wider text-white bg-brand-600 hover:bg-brand-700 rounded-lg transition cursor-pointer"
                                >
                                  <Edit size={10} />
                                  Registar Aula
                                </button>
                              )}
                              {isDone && (
                                <button
                                  onClick={() => setSelectedLessonForLog(lesson)}
                                  className="flex items-center gap-1 px-3 py-1.5 text-3xs font-bold uppercase tracking-wider text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition cursor-pointer"
                                >
                                  Sumário & Log
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {moduleLessons.length === 0 && (
                      <p className="text-xs text-slate-500 text-center py-4">Nenhuma aula adicionada a este módulo.</p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Right Side: Quick summary or selected lesson log details */}
        <div className="space-y-6">
          {selectedLessonForLog ? (
            <div className="p-6 glass rounded-2xl border border-brand-500/20 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-white">
                  {selectedLessonForLog.status === 'done' ? 'Sumário Registado' : 'Registo de Aula'}
                </h2>
                <button
                  onClick={() => setSelectedLessonForLog(null)}
                  className="text-xs font-semibold text-slate-400 hover:text-slate-200 cursor-pointer"
                >
                  Fechar
                </button>
              </div>

              {selectedLessonForLog.status === 'done' ? (
                // View Mode (Teacher or Student view details)
                <div className="space-y-4 text-sm">
                  <div>
                    <span className="text-xs text-slate-400 block font-medium">Tema da Aula</span>
                    <p className="text-white font-semibold mt-1">{selectedLessonForLog.title}</p>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 block font-medium">Sumário Oficial</span>
                    <p className="text-slate-300 mt-1 p-3 bg-slate-900/60 rounded-xl border border-slate-800 italic leading-relaxed">
                      {selectedLessonForLog.summary}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 block font-medium">Conteúdos Abordados</span>
                    <p className="text-slate-300 mt-1">{selectedLessonForLog.topicsCovered}</p>
                  </div>
                  {selectedLessonForLog.observations && (
                    <div>
                      <span className="text-xs text-slate-400 block font-medium">Observações Pedagógicas</span>
                      <p className="text-slate-400 mt-1 text-xs">{selectedLessonForLog.observations}</p>
                    </div>
                  )}
                </div>
              ) : (
                // Logging Edit Form (Teacher ONLY)
                <form onSubmit={handleSaveLog} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs text-slate-400 font-semibold block">Sumário (Livro de Ponto)</label>
                    <textarea
                      required
                      value={logSummary}
                      onChange={(e) => setLogSummary(e.target.value)}
                      placeholder="Ex: Introdução às Arrays em JS. Declaração, manipulação e loops fundamentais..."
                      rows={3}
                      className="w-full p-3 rounded-lg text-sm glass-input text-slate-200"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-slate-400 font-semibold block">Conteúdos Ministrados</label>
                    <input
                      type="text"
                      required
                      value={logTopics}
                      onChange={(e) => setLogTopics(e.target.value)}
                      placeholder="Ex: Arrays, Array length, push/pop, loops"
                      className="w-full p-2.5 rounded-lg text-sm glass-input text-slate-200"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-slate-400 font-semibold block">Observações Pedagógicas</label>
                    <textarea
                      value={logObs}
                      onChange={(e) => setLogObs(e.target.value)}
                      placeholder="Ex: Alunos cooperantes. Sem incidentes."
                      rows={2}
                      className="w-full p-3 rounded-lg text-sm glass-input text-slate-200"
                    />
                  </div>

                  {/* Attendance taking grid */}
                  <div className="space-y-2 border-t border-slate-800 pt-4">
                    <span className="text-xs text-slate-400 font-semibold flex items-center gap-1">
                      <Users size={12} />
                      Registo de Presenças
                    </span>
                    <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                      {students.map((student) => (
                        <div key={student.id} className="flex items-center justify-between text-xs py-1">
                          <span className="text-slate-300 truncate max-w-[120px]">{student.name}</span>
                          <div className="flex gap-1.5">
                            {['present', 'absent', 'late', 'justified'].map((opt) => (
                              <button
                                key={opt}
                                type="button"
                                onClick={() => setLogAttendance({ ...logAttendance, [student.id]: opt as any })}
                                className={`px-2 py-0.5 rounded-md font-bold uppercase tracking-wider text-3xs border transition cursor-pointer ${
                                  logAttendance[student.id] === opt
                                    ? opt === 'present'
                                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                                      : opt === 'absent'
                                      ? 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                                      : opt === 'late'
                                      ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                                      : 'bg-slate-500/20 text-slate-400 border-slate-500/40'
                                    : 'bg-transparent border-slate-700 text-slate-500 hover:text-slate-400'
                                }`}
                              >
                                {opt === 'present' ? 'P' : opt === 'absent' ? 'F' : opt === 'late' ? 'A' : 'FJ'}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition shadow-lg shadow-emerald-500/10 cursor-pointer"
                  >
                    Guardar Sumário e Fechar Aula
                  </button>
                </form>
              )}
            </div>
          ) : (
            <div className="p-6 glass rounded-2xl text-center space-y-3">
              <div className="mx-auto w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400">
                <AlertCircle size={24} />
              </div>
              <h3 className="font-bold text-white text-sm">Resumo da Aula</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Seleciona um sumário ou clica em "Registar Aula" (se fores docente) para registar o sumário diário e as presenças da turma.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modal dialog for planning/adding a new lesson */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md p-6 glass rounded-2xl border border-slate-800 space-y-4">
            <h2 className="text-lg font-bold text-white">Nova Aula Planeada</h2>

            <form onSubmit={handleSaveLesson} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs text-slate-400 font-semibold block">Selecione o Módulo</label>
                <select
                  value={newModuleId}
                  onChange={(e) => setNewModuleId(e.target.value)}
                  className="w-full p-2.5 rounded-lg text-sm bg-slate-900 border border-slate-700 text-white focus:outline-none"
                >
                  {modules.map(m => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-400 font-semibold block">Título da Aula</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Ex: Introdução ao CSS Grid"
                  className="w-full p-2.5 rounded-lg text-sm glass-input text-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-semibold block">Data</label>
                  <input
                    type="date"
                    required
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full p-2.5 rounded-lg text-sm glass-input text-slate-200"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-semibold block">Duração (min)</label>
                  <input
                    type="number"
                    required
                    min={45}
                    max={270}
                    value={newDuration}
                    onChange={(e) => setNewDuration(Number(e.target.value))}
                    className="w-full p-2.5 rounded-lg text-sm glass-input text-slate-200"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-400 font-semibold block">Descrição / Objetivos</label>
                <textarea
                  required
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Ex: Conhecer as diferenças entre Grid e Flexbox e saber desenhar colunas dinâmicas..."
                  rows={3}
                  className="w-full p-3 rounded-lg text-sm glass-input text-slate-200"
                />
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200 transition bg-slate-800 rounded-lg cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-lg transition cursor-pointer"
                >
                  Criar Aula
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
