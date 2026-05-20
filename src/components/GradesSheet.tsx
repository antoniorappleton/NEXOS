import React, { useState } from 'react';
import { User, Grade, Module } from '../data/mockData';
import { Award, FileSpreadsheet, Download, RefreshCw, BarChart2, Edit2 } from 'lucide-react';

interface GradesSheetProps {
  user: User;
  students: User[];
  modules: Module[];
  grades: Grade[];
  onUpdateGrade: (studentId: string, moduleId: string, grade: number) => void;
}

export const GradesSheet: React.FC<GradesSheetProps> = ({
  user,
  students,
  modules,
  grades,
  onUpdateGrade,
}) => {
  const [editingCell, setEditingCell] = useState<{ studentId: string; moduleId: string } | null>(null);
  const [editValue, setEditValue] = useState('');
  const [toast, setToast] = useState<string | null>(null);

  const handleExport = () => {
    setToast('CSV de Avaliações exportado com sucesso!');
    setTimeout(() => setToast(null), 3000);
  };

  const handleStartEdit = (studentId: string, moduleId: string, currentVal: number) => {
    if (user.role !== 'teacher') return;
    setEditingCell({ studentId, moduleId });
    setEditValue(currentVal.toString());
  };

  const handleSaveEdit = (studentId: string, moduleId: string) => {
    const val = Number(editValue);
    if (isNaN(val) || val < 0 || val > 20) {
      setToast('Nota inválida! Introduza um valor entre 0.0 e 20.0');
      setTimeout(() => setToast(null), 3000);
      return;
    }
    onUpdateGrade(studentId, moduleId, val);
    setEditingCell(null);
    setToast('Pauta atualizada e guardada!');
    setTimeout(() => setToast(null), 3000);
  };

  // Helper to fetch student grade for a module
  const getStudentGradeVal = (studentId: string, moduleId: string): number => {
    const gradeObj = grades.find(g => g.studentId === studentId && g.moduleId === moduleId);
    return gradeObj ? Number(gradeObj.finalGrade) : 0;
  };

  // Helper to calculate student's overall average
  const getStudentAverage = (studentId: string): number => {
    const studentGrades = grades.filter(g => g.studentId === studentId);
    if (studentGrades.length === 0) return 0;
    const sum = studentGrades.reduce((acc, g) => acc + Number(g.finalGrade), 0);
    return Number((sum / studentGrades.length).toFixed(2));
  };

  // Student specific calculations
  const myGrades = grades.filter(g => g.studentId === user.id);
  const myAverage = myGrades.length > 0
    ? (myGrades.reduce((sum, g) => sum + Number(g.finalGrade), 0) / myGrades.length).toFixed(1)
    : '0';

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
            <FileSpreadsheet className="text-emerald-500" />
            Pauta de Avaliações
          </h1>
          <p className="mt-2 text-slate-400">Pauta académica, registo de classificações modulares e cálculo de médias gerais.</p>
        </div>
        <div className="flex gap-2">
          {user.role === 'teacher' && (
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-400 border border-emerald-500/25 transition cursor-pointer"
            >
              <Download size={14} />
              Exportar CSV
            </button>
          )}
        </div>
      </div>

      {user.role === 'teacher' ? (
        // TEACHER SPREADSHEET VIEW
        <div className="p-6 glass rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-md font-bold text-white flex items-center gap-2">
              <BarChart2 size={18} className="text-brand-500" />
              Pauta da Turma 12ºP (Programação)
            </h3>
            <span className="text-3xs text-slate-500 font-semibold uppercase italic flex items-center gap-1">
              <Edit2 size={10} />
              Clique numa célula para editar a nota
            </span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-800/80">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-900/60 border-b border-slate-850 text-slate-400 font-bold uppercase tracking-wider text-2xs">
                  <th className="p-4">Aluno</th>
                  {modules.map(mod => (
                    <th key={mod.id} className="p-4 text-center max-w-[140px] truncate" title={mod.name}>
                      {mod.name.split(' ')[0]}...
                    </th>
                  ))}
                  <th className="p-4 text-right">Média Final</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850">
                {students.map((stud) => {
                  const avg = getStudentAverage(stud.id);
                  return (
                    <tr key={stud.id} className="hover:bg-slate-800/10 transition">
                      <td className="p-4 font-semibold text-white flex items-center gap-2.5">
                        <img src={stud.avatar} className="w-6 h-6 rounded-full" alt="" />
                        {stud.name}
                      </td>
                      
                      {/* Modules grades cells */}
                      {modules.map(mod => {
                        const gradeVal = getStudentGradeVal(stud.id, mod.id);
                        const isEditing = editingCell?.studentId === stud.id && editingCell?.moduleId === mod.id;
                        
                        return (
                          <td key={mod.id} className="p-4 text-center">
                            {isEditing ? (
                              <input
                                type="text"
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                onBlur={() => handleSaveEdit(stud.id, mod.id)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit(stud.id, mod.id)}
                                autoFocus
                                className="w-14 text-center text-xs p-1 rounded bg-slate-950 border border-brand-500 text-white focus:outline-none"
                              />
                            ) : (
                              <div
                                onClick={() => handleStartEdit(stud.id, mod.id, gradeVal)}
                                className={`inline-block px-2.5 py-1 rounded font-bold transition duration-200 cursor-pointer ${
                                  gradeVal >= 10
                                    ? 'bg-slate-800 text-slate-350 hover:bg-slate-700 hover:text-white'
                                    : gradeVal > 0
                                    ? 'bg-rose-500/15 text-rose-400 hover:bg-rose-500/25'
                                    : 'bg-transparent text-slate-600 hover:text-slate-400'
                                }`}
                              >
                                {gradeVal > 0 ? gradeVal.toFixed(1) : '-'}
                              </div>
                            )}
                          </td>
                        );
                      })}

                      {/* Average GPA cell */}
                      <td className="p-4 text-right">
                        <span className={`font-black text-sm px-2.5 py-1 rounded-md ${
                          avg >= 14
                            ? 'bg-emerald-500/10 text-emerald-400'
                            : avg >= 10
                            ? 'bg-brand-500/10 text-brand-400'
                            : 'bg-rose-500/10 text-rose-400'
                        }`}>
                          {avg > 0 ? avg.toFixed(1) : '-'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        // STUDENT PERSONAL TRANSCRIPT REPORT
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* List of modules report cards */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-md font-bold text-white">O Teu Historial Modular</h3>
            
            <div className="space-y-3">
              {modules.map((mod) => {
                const gradeVal = getStudentGradeVal(user.id, mod.id);
                const hasGrade = gradeVal > 0;
                
                return (
                  <div key={mod.id} className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800 flex items-center justify-between flex-wrap gap-4">
                    <div className="space-y-1 max-w-sm">
                      <span className="text-3xs text-slate-500 font-extrabold uppercase tracking-wider block">Módulo {mod.orderIndex}</span>
                      <h4 className="font-bold text-white text-sm">{mod.name}</h4>
                      <p className="text-3xs text-slate-400 leading-normal">{mod.description}</p>
                    </div>

                    <div className="flex items-center gap-6">
                      <span className={`px-2.5 py-0.5 rounded text-3xs font-extrabold uppercase tracking-wider ${
                        !hasGrade
                          ? 'bg-slate-800 text-slate-450 border border-slate-700'
                          : gradeVal >= 10
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25'
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/25'
                      }`}>
                        {!hasGrade ? 'Em Curso' : gradeVal >= 10 ? 'Aprovado' : 'Retido'}
                      </span>

                      <div className="text-right">
                        <span className="text-3xs text-slate-500 block font-semibold">Nota Modular</span>
                        <span className={`text-xl font-black ${hasGrade ? 'text-white' : 'text-slate-600'}`}>
                          {hasGrade ? gradeVal.toFixed(1) : '-'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* GPA Average summary widget */}
          <div className="p-6 glass rounded-2xl border border-brand-500/20 text-center space-y-6 flex flex-col items-center justify-center">
            <span className="text-2xs font-extrabold uppercase tracking-widest text-slate-400 block">Classificação Final Prevista</span>
            
            {/* Visual Ring Gauge */}
            <div className="relative w-36 h-36 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                {/* Background Ring */}
                <circle cx="72" cy="72" r="60" stroke="#1e293b" strokeWidth="10" fill="transparent" />
                {/* Foreground Progress Ring */}
                <circle
                  cx="72"
                  cy="72"
                  r="60"
                  stroke="#2563eb"
                  strokeWidth="10"
                  fill="transparent"
                  strokeDasharray={376.8}
                  strokeDashoffset={376.8 - (376.8 * (Number(myAverage) / 20))}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-3xl font-extrabold text-white">{myAverage}</span>
                <span className="text-4xs text-slate-500 uppercase tracking-widest font-semibold mt-1">G.P.A</span>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-xs font-semibold text-slate-350 flex items-center gap-1 justify-center">
                <Award size={14} className="text-brand-400" />
                Transição de Ano Assegurada
              </span>
              <p className="text-3xs text-slate-500 leading-normal max-w-[200px] mx-auto">
                Parabéns! Manténs uma média geral acima do limiar de transição de 10.0 valores.
              </p>
            </div>
          </div>

        </div>
      )}
    </div>
  );
};
export default GradesSheet;
