import React, { useState } from 'react';
import { User, Assignment, Submission, RubricScore } from '../data/mockData';
import { CheckSquare, Calendar, Link, Video, Award, MessageSquare, AlertCircle, FileArchive, CheckCircle2, UserCheck } from 'lucide-react';
import { Github } from './Icons';

interface AssignmentsManagerProps {
  user: User;
  assignments: Assignment[];
  submissions: Submission[];
  students: User[];
  onGradeSubmission: (submissionId: string, grade: number, feedback: string, rubricScores: RubricScore[]) => void;
  onSubmitAssignment: (assignmentId: string, studentId: string, github: string, projectUrl: string, zipName: string) => void;
}

export const AssignmentsManager: React.FC<AssignmentsManagerProps> = ({
  user,
  assignments,
  submissions,
  students,
  onGradeSubmission,
  onSubmitAssignment,
}) => {
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string>(assignments[0]?.id || '');
  const [selectedSubmissionId, setSelectedSubmissionId] = useState<string | null>(null);

  // Student Form states
  const [gitUrl, setGitUrl] = useState('');
  const [deployUrl, setDeployUrl] = useState('');
  const [zipName, setZipName] = useState('');

  // Teacher Grading states
  const [gradingScores, setGradingScores] = useState<{ [rubricId: string]: number }>({});
  const [gradingComments, setGradingComments] = useState<{ [rubricId: string]: string }>({});
  const [feedbackText, setFeedbackText] = useState('');
  const [toast, setToast] = useState<string | null>(null);

  const activeAssignment = assignments.find(a => a.id === selectedAssignmentId);

  // Active submissions for the selected assignment
  const activeSubmissions = submissions.filter(s => s.assignmentId === selectedAssignmentId);

  // Selected student submission details (for teacher view)
  const selectedSubmission = submissions.find(s => s.id === selectedSubmissionId);
  const selectedStudent = selectedSubmission ? students.find(s => s.id === selectedSubmission.studentId) : null;

  // Selected student's personal submission for the active assignment (for student view)
  const studentPersonalSubmission = submissions.find(s => s.assignmentId === selectedAssignmentId && s.studentId === user.id);

  const triggerToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleOpenGradeForm = (sub: Submission) => {
    setSelectedSubmissionId(sub.id);
    setFeedbackText(sub.feedback || '');
    
    // Pre-populate rubric scores
    const initialScores: { [rubricId: string]: number } = {};
    const initialComments: { [rubricId: string]: string } = {};
    
    activeAssignment?.rubrics.forEach(rub => {
      const match = sub.rubricScores.find(score => score.rubricId === rub.id);
      initialScores[rub.id] = match ? match.score : 5; // default to maximum
      initialComments[rub.id] = match?.comment || '';
    });
    
    setGradingScores(initialScores);
    setGradingComments(initialComments);
  };

  const handleSaveEvaluation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubmissionId || !activeAssignment) return;

    // Calculate final grade. Sum of rubric scores
    let scoreSum = 0;
    const finalRubricScores: RubricScore[] = activeAssignment.rubrics.map(rub => {
      const score = gradingScores[rub.id] ?? 5;
      scoreSum += score;
      return {
        rubricId: rub.id,
        score,
        comment: gradingComments[rub.id] || undefined
      };
    });

    onGradeSubmission(selectedSubmissionId, scoreSum, feedbackText, finalRubricScores);
    setSelectedSubmissionId(null);
    triggerToast('Avaliação gravada com sucesso!');
  };

  const handleStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeAssignment) return;
    
    onSubmitAssignment(activeAssignment.id, user.id, gitUrl, deployUrl, zipName);
    setGitUrl('');
    setDeployUrl('');
    setZipName('');
    triggerToast('Trabalho submetido com sucesso!');
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
        <h1 className="text-3xl font-extrabold tracking-tight text-white">Trabalhos & Avaliações</h1>
        <p className="mt-2 text-slate-400">Entrega de projetos práticos, grelhas de avaliação e feedback estruturado.</p>
      </div>

      {/* Assignment selector tab bar */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
        {assignments.map(a => (
          <button
            key={a.id}
            onClick={() => {
              setSelectedAssignmentId(a.id);
              setSelectedSubmissionId(null);
            }}
            className={`px-4 py-2.5 rounded-xl text-xs font-semibold border transition shrink-0 cursor-pointer ${
              selectedAssignmentId === a.id
                ? 'bg-brand-600 border-brand-500 text-white font-bold'
                : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            {a.title}
          </button>
        ))}
      </div>

      {activeAssignment && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left/Middle area: instructions, student submission form OR teacher submissions list */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Assignment description card */}
            <div className="p-6 glass rounded-2xl border border-slate-800 space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="text-3xs font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-slate-900 border border-slate-700 text-slate-400">
                  Peso na Média: {activeAssignment.weightPercentage}%
                </span>
                <span className="flex items-center gap-1 text-2xs text-amber-400 font-semibold">
                  <Calendar size={12} />
                  Prazo: {new Date(activeAssignment.dueDate).toLocaleDateString('pt-PT')}
                </span>
              </div>
              <h2 className="text-lg font-bold text-white">{activeAssignment.title}</h2>
              <p className="text-xs text-slate-300 leading-relaxed">{activeAssignment.description}</p>
              <div className="p-4 bg-slate-950/65 rounded-xl border border-slate-800 space-y-2">
                <span className="text-2xs font-extrabold uppercase tracking-widest text-slate-500 block">Instruções de Entrega</span>
                <p className="text-3xs leading-relaxed text-slate-400">{activeAssignment.instructions}</p>
              </div>
            </div>

            {/* Workflow depending on role */}
            {user.role === 'teacher' ? (
              // TEACHER WORKFLOW: Submissions list for active assignment
              <div className="p-6 glass rounded-2xl border border-slate-800 space-y-4">
                <h3 className="text-md font-bold text-white flex items-center gap-2">
                  <UserCheck size={18} className="text-brand-500" />
                  Submissões dos Alunos ({activeSubmissions.length} entregas)
                </h3>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-850 text-slate-400 font-bold uppercase tracking-wider text-2xs">
                        <th className="pb-3">Aluno</th>
                        <th className="pb-3">Entregue Em</th>
                        <th className="pb-3">Fontes</th>
                        <th className="pb-3">Nota</th>
                        <th className="pb-3 text-right">Ação</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-850">
                      {students.map((stud) => {
                        const sub = activeSubmissions.find(s => s.studentId === stud.id);
                        return (
                          <tr key={stud.id} className="hover:bg-slate-800/10 transition">
                            <td className="py-3.5 font-semibold text-white flex items-center gap-2.5">
                              <img src={stud.avatar} className="w-6 h-6 rounded-full" alt="" />
                              {stud.name}
                            </td>
                            <td className="py-3.5 text-slate-400">
                              {sub ? new Date(sub.submittedAt).toLocaleDateString('pt-PT') : <span className="text-rose-500 font-medium">Pendente</span>}
                            </td>
                            <td className="py-3.5">
                              {sub ? (
                                <div className="flex gap-2 text-slate-500">
                                  {sub.githubRepoUrl && <Github size={14} className="text-brand-400" />}
                                  {sub.projectUrl && <Link size={14} className="text-emerald-400" />}
                                  {sub.videoUrl && <Video size={14} className="text-rose-400" />}
                                </div>
                              ) : '-'}
                            </td>
                            <td className="py-3.5">
                              {sub?.finalGrade !== undefined ? (
                                <span className="font-bold text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/10">{sub.finalGrade}</span>
                              ) : sub ? (
                                <span className="text-amber-500 text-3xs font-bold uppercase">Por Avaliar</span>
                              ) : '-'}
                            </td>
                            <td className="py-3.5 text-right">
                              {sub ? (
                                <button
                                  onClick={() => handleOpenGradeForm(sub)}
                                  className="px-2.5 py-1 text-3xs font-bold bg-slate-800 hover:bg-slate-700 text-white rounded transition border border-slate-700 cursor-pointer"
                                >
                                  {sub.finalGrade !== undefined ? 'Reavaliar' : 'Avaliar'}
                                </button>
                              ) : '-'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              // STUDENT WORKFLOW: Personal submission form or status preview
              <div className="p-6 glass rounded-2xl border border-slate-800 space-y-4">
                <h3 className="text-md font-bold text-white">O Teu Estado de Entrega</h3>
                
                {studentPersonalSubmission ? (
                  // Submitted preview
                  <div className="p-5 rounded-xl bg-slate-900/40 border border-slate-800 space-y-4">
                    <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs">
                      <CheckCircle2 size={16} />
                      Submetido no prazo em: {new Date(studentPersonalSubmission.submittedAt).toLocaleString('pt-PT')}
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-xs">
                      {studentPersonalSubmission.githubRepoUrl && (
                        <div className="flex items-center gap-2 text-slate-300">
                          <Github size={14} className="text-slate-400" />
                          <span className="truncate">{studentPersonalSubmission.githubRepoUrl}</span>
                        </div>
                      )}
                      {studentPersonalSubmission.projectUrl && (
                        <div className="flex items-center gap-2 text-slate-300">
                          <Link size={14} className="text-slate-400" />
                          <span className="truncate">{studentPersonalSubmission.projectUrl}</span>
                        </div>
                      )}
                    </div>

                    {studentPersonalSubmission.finalGrade !== undefined ? (
                      // Evaluation result
                      <div className="border-t border-slate-850 pt-4 space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-slate-400">Classificação Atribuída</span>
                          <span className="text-2xl font-black text-emerald-400">{studentPersonalSubmission.finalGrade} / 20</span>
                        </div>
                        <div className="p-4 bg-slate-950/65 rounded-xl border border-slate-850 space-y-2">
                          <span className="text-2xs font-extrabold uppercase tracking-widest text-slate-500 block">Feedback do Professor</span>
                          <p className="text-xs text-slate-300 italic leading-relaxed">{studentPersonalSubmission.feedback}</p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500 italic">O teu trabalho aguarda correção e feedback por parte do professor.</p>
                    )}
                  </div>
                ) : (
                  // Submission form
                  <form onSubmit={handleStudentSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs text-slate-400 font-semibold block">Ficheiro ZIP de Entrega</label>
                        <div className="flex items-center gap-2 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs">
                          <FileArchive size={14} className="text-slate-500" />
                          <input
                            type="text"
                            required
                            placeholder="Ex: projeto_final.zip"
                            value={zipName}
                            onChange={(e) => setZipName(e.target.value)}
                            className="bg-transparent text-slate-200 outline-none w-full placeholder-slate-650"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs text-slate-400 font-semibold block">Repositório GitHub</label>
                        <div className="flex items-center gap-2 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs">
                          <Github size={14} className="text-slate-500" />
                          <input
                            type="url"
                            required
                            placeholder="https://github.com/..."
                            value={gitUrl}
                            onChange={(e) => setGitUrl(e.target.value)}
                            className="bg-transparent text-slate-200 outline-none w-full placeholder-slate-650"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs text-slate-400 font-semibold block">URL do Projeto Online (Deploy)</label>
                      <div className="flex items-center gap-2 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs">
                        <Link size={14} className="text-slate-500" />
                        <input
                          type="url"
                          required
                          placeholder="https://meuprojeto.vercel.app"
                          value={deployUrl}
                          onChange={(e) => setDeployUrl(e.target.value)}
                          className="bg-transparent text-slate-200 outline-none w-full placeholder-slate-650"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="px-4 py-2.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition shadow-lg shadow-emerald-500/10 cursor-pointer"
                    >
                      Submeter Trabalho
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>

          {/* Right Column: Dynamic Assessment Rubrics panel */}
          <div>
            {user.role === 'teacher' && selectedSubmission ? (
              // TEACHER WORKFLOW: Grading Sheet pane
              <form onSubmit={handleSaveEvaluation} className="p-6 glass rounded-2xl border border-brand-500/20 space-y-6">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <h3 className="font-bold text-white text-sm">Avaliação</h3>
                    <span className="text-3xs text-emerald-400 font-semibold">{selectedStudent?.name}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedSubmissionId(null)}
                    className="text-2xs text-slate-400 hover:text-white"
                  >
                    Fechar
                  </button>
                </div>

                {/* Rubrics rating checklist */}
                <div className="space-y-5">
                  <span className="text-xs font-semibold text-slate-300 block flex items-center gap-1">
                    <Award size={14} className="text-brand-400" />
                    Critérios de Classificação
                  </span>

                  {activeAssignment.rubrics.map(rub => {
                    const scoreVal = gradingScores[rub.id] ?? 5;
                    return (
                      <div key={rub.id} className="space-y-2 border-b border-slate-850 pb-3 last:border-b-0">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="text-xs font-semibold text-white leading-none">{rub.criterion}</h4>
                            <p className="text-3xs text-slate-400 mt-1">{rub.description}</p>
                          </div>
                          <span className="text-xs font-black text-brand-400 shrink-0 ml-2">{scoreVal} / 5</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="5"
                          step="0.5"
                          value={scoreVal}
                          onChange={(e) => setGradingScores({ ...gradingScores, [rub.id]: Number(e.target.value) })}
                          className="w-full accent-brand-500"
                        />
                        <input
                          type="text"
                          placeholder="Comentário sobre o critério (opcional)"
                          value={gradingComments[rub.id] || ''}
                          onChange={(e) => setGradingComments({ ...gradingComments, [rub.id]: e.target.value })}
                          className="w-full text-3xs p-1.5 rounded bg-slate-900 border border-slate-800 text-slate-300 outline-none"
                        />
                      </div>
                    );
                  })}
                </div>

                {/* Feedback textarea */}
                <div className="space-y-2">
                  <label className="text-xs text-slate-400 font-semibold block flex items-center gap-1">
                    <MessageSquare size={14} className="text-brand-400" />
                    Feedback Global
                  </label>
                  <textarea
                    required
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    placeholder="Escreve uma nota explicativa sobre os pontos fortes e melhorias do aluno..."
                    rows={4}
                    className="w-full p-3 rounded-xl text-xs glass-input text-slate-200"
                  />
                </div>

                {/* Final Grade Calculation preview */}
                <div className="p-4 bg-brand-900/10 border border-brand-500/20 rounded-xl flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300">Nota Calculada:</span>
                  <span className="text-2xl font-black text-brand-400">
                    {Object.values(gradingScores).reduce((a, b) => a + b, 0)} / 20
                  </span>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition shadow-lg shadow-emerald-500/10 cursor-pointer"
                >
                  Confirmar Classificação
                </button>
              </form>
            ) : (
              // Default side view: Rubrics preview
              <div className="p-6 glass rounded-2xl border border-slate-800 space-y-4">
                <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-500 flex items-center gap-1">
                  <Award size={14} />
                  Critérios Grelha
                </h3>
                <div className="space-y-3">
                  {activeAssignment.rubrics.map(rub => (
                    <div key={rub.id} className="p-3 bg-slate-900/30 rounded-xl border border-slate-800 text-xs">
                      <div className="flex justify-between font-bold text-slate-200">
                        <span>{rub.criterion}</span>
                        <span className="text-brand-400">Máx: {rub.maxScore} val</span>
                      </div>
                      <p className="text-3xs text-slate-400 mt-1.5 leading-relaxed">{rub.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
};
