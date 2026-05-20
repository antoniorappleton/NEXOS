import React, { useState } from 'react';
import {
  initialUsers,
  initialClasses,
  initialModules,
  initialLessons,
  initialContents,
  initialAssignments,
  initialSubmissions,
  initialGitHubAccounts,
  initialGitHubRepoActivity,
  initialAttendanceSessions,
  initialAttendanceRecords,
  User,
  Class,
  Module,
  Lesson,
  Content,
  Assignment,
  Submission,
  GitHubAccount,
  GitHubRepoActivity,
  AttendanceSession,
  AttendanceRecord,
  Grade,
  RubricScore
} from './data/mockData';

// Views
import { DashboardTeacher } from './components/DashboardTeacher';
import { DashboardStudent } from './components/DashboardStudent';
import { PedagogicalPlanning } from './components/PedagogicalPlanning';
import { ContentLibrary } from './components/ContentLibrary';
import { AssignmentsManager } from './components/AssignmentsManager';
import { GitHubCenter } from './components/GitHubCenter';
import { GradesSheet } from './components/GradesSheet';
import { AdminPanel } from './components/AdminPanel';

// Icons
import {
  Terminal,
  LayoutDashboard,
  Calendar,
  BookOpen,
  CheckSquare,
  BarChart3,
  Shield,
  Search,
  Bell,
  UserCheck,
  Power,
  Info
} from 'lucide-react';
import { Github } from './components/Icons';

export const App: React.FC = () => {
  // Global Mock States
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [classes, setClasses] = useState<Class[]>(initialClasses);
  const [modules, setModules] = useState<Module[]>(initialModules);
  const [lessons, setLessons] = useState<Lesson[]>(initialLessons);
  const [contents, setContents] = useState<Content[]>(initialContents);
  const [assignments, setAssignments] = useState<Assignment[]>(initialAssignments);
  const [submissions, setSubmissions] = useState<Submission[]>(initialSubmissions);
  const [githubAccounts, setGithubAccounts] = useState<GitHubAccount[]>(initialGitHubAccounts);
  const [githubRepoActivity, setGithubRepoActivity] = useState<GitHubRepoActivity[]>(initialGitHubRepoActivity);
  const [attendanceSessions, setAttendanceSessions] = useState<AttendanceSession[]>(initialAttendanceSessions);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(initialAttendanceRecords);

  // Default Grades derived from mock submissions ( Pedro & Maria have grades for HTML/CSS & JS )
  const [grades, setGrades] = useState<Grade[]>([
    { id: 'g-1', studentId: 'u-3', moduleId: 'm-1', finalGrade: 17.0, calculatedAt: '2026-10-06' },
    { id: 'g-2', studentId: 'u-3', moduleId: 'm-2', finalGrade: 14.5, calculatedAt: '2026-11-20' },
    { id: 'g-3', studentId: 'u-4', moduleId: 'm-1', finalGrade: 16.5, calculatedAt: '2026-10-06' },
    { id: 'g-4', studentId: 'u-5', moduleId: 'm-2', finalGrade: 12.0, calculatedAt: '2026-11-21' }
  ]);

  // Active Role and Profile (Default: Teacher João Appleton)
  const [currentUser, setCurrentUser] = useState<User>(users[0]);
  const [currentView, setCurrentView] = useState<string>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');

  // Floating selector display
  const [showRoleSelector, setShowRoleSelector] = useState(false);

  // Navigation handlers
  const handleNavigate = (view: string) => {
    setCurrentView(view);
  };

  const handleRoleChange = (userId: string) => {
    const matchedUser = users.find(u => u.id === userId);
    if (matchedUser) {
      setCurrentUser(matchedUser);
      // Reset view to dashboard
      setCurrentView(matchedUser.role === 'admin' ? 'admin' : 'dashboard');
      setShowRoleSelector(false);
    }
  };

  // --- MUTATION HANDLERS (Simulated DB Updates) ---

  const handleAddLesson = (newLesson: Omit<Lesson, 'id'>) => {
    const created: Lesson = {
      ...newLesson,
      id: `l-${lessons.length + 1}`
    };
    setLessons([...lessons, created]);
  };

  const handleLogLesson = (
    lessonId: string,
    summary: string,
    topics: string,
    obs: string,
    attendance: { [studentId: string]: 'present' | 'absent' | 'late' | 'justified' }
  ) => {
    // 1. Update lesson record
    setLessons(prev => prev.map(l => l.id === lessonId ? {
      ...l,
      status: 'done',
      summary,
      topicsCovered: topics,
      observations: obs
    } : l));

    // 2. Create attendance session
    const sessionId = `as-${attendanceSessions.length + 1}`;
    const newSession: AttendanceSession = {
      id: sessionId,
      lessonId,
      classId: 'c-1',
      date: '2026-05-20'
    };
    setAttendanceSessions(prev => [...prev, newSession]);

    // 3. Register records
    const newRecords: AttendanceRecord[] = Object.entries(attendance).map(([studentId, status], idx) => ({
      id: `ar-${attendanceRecords.length + 1 + idx}`,
      sessionId,
      studentId,
      status
    }));
    setAttendanceRecords(prev => [...prev, ...newRecords]);
  };

  const handleUploadContent = (newContent: Omit<Content, 'id' | 'createdAt'>) => {
    const created: Content = {
      ...newContent,
      id: `co-${contents.length + 1}`,
      createdAt: '2026-05-20'
    };
    setContents([...contents, created]);
  };

  const handleGradeSubmission = (
    submissionId: string,
    grade: number,
    feedback: string,
    rubricScores: RubricScore[]
  ) => {
    // 1. Update submission
    setSubmissions(prev => prev.map(s => s.id === submissionId ? {
      ...s,
      finalGrade: grade,
      feedback,
      rubricScores
    } : s));

    // 2. Recalculate/create Grade for module
    const targetSub = submissions.find(s => s.id === submissionId);
    const targetAssign = targetSub ? assignments.find(a => a.id === targetSub.assignmentId) : null;
    
    if (targetSub && targetAssign) {
      // Find if grade already exists
      const exists = grades.some(g => g.studentId === targetSub.studentId && g.moduleId === targetAssign.moduleId);
      
      if (exists) {
        setGrades(prev => prev.map(g => (g.studentId === targetSub.studentId && g.moduleId === targetAssign.moduleId) ? {
          ...g,
          finalGrade: grade,
          calculatedAt: '2026-05-20'
        } : g));
      } else {
        const newGrade: Grade = {
          id: `g-${grades.length + 1}`,
          studentId: targetSub.studentId,
          moduleId: targetAssign.moduleId,
          finalGrade: grade,
          calculatedAt: '2026-05-20'
        };
        setGrades(prev => [...prev, newGrade]);
      }
    }
  };

  const handleSubmitAssignment = (
    assignmentId: string,
    studentId: string,
    github: string,
    projectUrl: string,
    zipName: string
  ) => {
    const newSub: Submission = {
      id: `s-${submissions.length + 1}`,
      assignmentId,
      studentId,
      submittedAt: new Date().toISOString().slice(0, 19),
      status: 'submitted',
      githubRepoUrl: github,
      projectUrl,
      videoUrl: zipName, // Mock storage filename
      rubricScores: []
    };
    setSubmissions([...submissions, newSub]);

    // Append to git repos
    const repoName = github.split('/').pop() || 'projeto';
    const newRepo: GitHubRepoActivity = {
      id: `ra-${githubRepoActivity.length + 1}`,
      studentId,
      repoName,
      repoUrl: github,
      lastCommitDate: new Date().toISOString().slice(0, 19),
      commitsCount: 1,
      languages: ['HTML', 'CSS', 'JavaScript']
    };
    setGithubRepoActivity([...githubRepoActivity, newRepo]);
  };

  const handleConnectGitHub = (username: string) => {
    const newAcc: GitHubAccount = {
      userId: currentUser.id,
      githubUsername: username,
      connectedAt: '2026-05-20'
    };
    setGithubAccounts([...githubAccounts, newAcc]);

    // Seed a couple repositories
    const seedRepos: GitHubRepoActivity[] = [
      {
        id: `ra-${githubRepoActivity.length + 1}`,
        studentId: currentUser.id,
        repoName: 'projeto-portfolio',
        repoUrl: `https://github.com/${username}/projeto-portfolio`,
        lastCommitDate: '2026-05-20T17:30:00',
        commitsCount: 12,
        languages: ['HTML', 'CSS']
      },
      {
        id: `ra-${githubRepoActivity.length + 2}`,
        studentId: currentUser.id,
        repoName: 'mini-pwa-finance',
        repoUrl: `https://github.com/${username}/mini-pwa-finance`,
        lastCommitDate: '2026-05-18T10:15:00',
        commitsCount: 26,
        languages: ['JavaScript', 'HTML']
      }
    ];
    setGithubRepoActivity([...githubRepoActivity, ...seedRepos]);
  };

  const handleUpdateGrade = (studentId: string, moduleId: string, gradeVal: number) => {
    const exists = grades.some(g => g.studentId === studentId && g.moduleId === moduleId);
    if (exists) {
      setGrades(prev => prev.map(g => (g.studentId === studentId && g.moduleId === moduleId) ? {
        ...g,
        finalGrade: gradeVal,
        calculatedAt: '2026-05-20'
      } : g));
    } else {
      const created: Grade = {
        id: `g-${grades.length + 1}`,
        studentId,
        moduleId,
        finalGrade: gradeVal,
        calculatedAt: '2026-05-20'
      };
      setGrades([...grades, created]);
    }
  };

  const handleAddUser = (name: string, email: string, role: 'student' | 'teacher' | 'admin') => {
    const created: User = {
      id: `u-${users.length + 1}`,
      name,
      email,
      role,
      avatar: `https://images.unsplash.com/photo-${1500000000000 + users.length * 100000}?w=80&h=80&fit=crop&crop=face`
    };
    setUsers([...users, created]);
  };

  const handleAddClass = (name: string, course: string, year: string, teacherId: string) => {
    const created: Class = {
      id: `c-${classes.length + 1}`,
      name,
      course,
      year,
      mainTeacherId: teacherId
    };
    setClasses([...classes, created]);
  };

  // Filter students
  const studentsList = users.filter(u => u.role === 'student');

  // Active Menu list depending on role
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} />, roles: ['student', 'teacher', 'admin'] },
    { id: 'planeamento', label: 'Planeamento', icon: <Calendar size={18} />, roles: ['student', 'teacher'] },
    { id: 'trabalhos', label: 'Trabalhos', icon: <CheckSquare size={18} />, roles: ['student', 'teacher'] },
    { id: 'conteudos', label: 'Conteúdos', icon: <BookOpen size={18} />, roles: ['student', 'teacher'] },
    { id: 'github', label: 'GitHub Center', icon: <Github size={18} />, roles: ['student', 'teacher'] },
    { id: 'notas', label: 'Pauta Notas', icon: <BarChart3 size={18} />, roles: ['student', 'teacher'] },
    { id: 'admin', label: 'Administração', icon: <Shield size={18} />, roles: ['admin', 'teacher'] }
  ].filter(item => item.roles.includes(currentUser.role));

  // Render View Routing Selector
  const renderActiveView = () => {
    switch (currentView) {
      case 'dashboard':
        return currentUser.role === 'teacher' ? (
          <DashboardTeacher
            user={currentUser}
            classes={classes}
            lessons={lessons}
            assignments={assignments}
            submissions={submissions}
            users={users}
            onNavigate={handleNavigate}
            onQuickAction={(action) => {
              if (action === 'new-lesson') setCurrentView('planeamento');
              if (action === 'new-assignment') setCurrentView('trabalhos');
              if (action === 'new-content') setCurrentView('conteudos');
              if (action === 'new-class') setCurrentView('admin');
            }}
          />
        ) : (
          <DashboardStudent
            user={currentUser}
            lessons={lessons}
            assignments={assignments}
            submissions={submissions}
            contents={contents}
            grades={grades}
            modules={modules}
            onNavigate={handleNavigate}
          />
        );
      case 'planeamento':
        return (
          <PedagogicalPlanning
            user={currentUser}
            modules={modules}
            lessons={lessons}
            students={studentsList}
            onAddLesson={handleAddLesson}
            onLogLesson={handleLogLesson}
          />
        );
      case 'conteudos':
        return (
          <ContentLibrary
            user={currentUser}
            contents={contents}
            modules={modules}
            onUploadContent={handleUploadContent}
          />
        );
      case 'trabalhos':
        return (
          <AssignmentsManager
            user={currentUser}
            assignments={assignments}
            submissions={submissions}
            students={studentsList}
            onGradeSubmission={handleGradeSubmission}
            onSubmitAssignment={handleSubmitAssignment}
          />
        );
      case 'github':
        return (
          <GitHubCenter
            user={currentUser}
            accounts={githubAccounts}
            repoActivity={githubRepoActivity}
            students={studentsList}
            onConnectGitHub={handleConnectGitHub}
          />
        );
      case 'notas':
        return (
          <GradesSheet
            user={currentUser}
            students={studentsList}
            modules={modules}
            grades={grades}
            onUpdateGrade={handleUpdateGrade}
          />
        );
      case 'admin':
        return (
          <AdminPanel
            users={users}
            classes={classes}
            onAddUser={handleAddUser}
            onAddClass={handleAddClass}
          />
        );
      default:
        return <div className="text-white">Em construção</div>;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#0b0f19]">
      
      {/* Sidebar navigation */}
      <aside className="w-64 bg-slate-900/60 border-r border-slate-850 flex flex-col shrink-0">
        {/* Brand header */}
        <div className="p-6 flex items-center gap-3 border-b border-slate-850">
          <div className="p-2.5 bg-brand-500/10 text-brand-500 rounded-xl">
            <Terminal size={22} className="stroke-[2.5]" />
          </div>
          <div>
            <span className="font-extrabold text-lg tracking-tight text-white block">DevClass</span>
            <span className="text-4xs text-slate-500 font-bold uppercase tracking-widest block">Ensino Profissional</span>
          </div>
        </div>

        {/* Menu items */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold transition group cursor-pointer ${
                currentView === item.id
                  ? 'bg-brand-600/15 border-brand-500/20 text-brand-450 border border-brand-500/10 font-bold'
                  : 'bg-transparent text-slate-400 hover:bg-slate-800/35 hover:text-slate-200'
              }`}
            >
              <div className={currentView === item.id ? 'text-brand-400' : 'text-slate-500 group-hover:text-slate-350 transition'}>
                {item.icon}
              </div>
              {item.label}
            </button>
          ))}
        </nav>

        {/* Profile Card footer */}
        <div className="p-4 border-t border-slate-850 bg-slate-900/20">
          <div className="flex items-center gap-3">
            <img src={currentUser.avatar} className="w-9 h-9 rounded-full border border-slate-700/60" alt="" />
            <div className="min-w-0">
              <span className="text-xs font-bold text-white block truncate">{currentUser.name}</span>
              <span className="text-3xs text-slate-500 font-medium block capitalize tracking-wider">{currentUser.role}</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main workspace container */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Top Navbar */}
        <header className="h-16 bg-[#0b0f19]/30 border-b border-slate-850 flex items-center justify-between px-8 z-10 shrink-0">
          <div className="flex items-center gap-3 bg-slate-900/40 border border-slate-800 px-3 py-1.5 rounded-xl w-64">
            <Search size={14} className="text-slate-500" />
            <input
              type="text"
              placeholder="Pesquisar..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent text-xs text-slate-300 outline-none w-full placeholder-slate-600"
            />
          </div>

          <div className="flex items-center gap-4">
            <button className="relative p-2 text-slate-400 hover:text-slate-250 bg-slate-900/35 border border-slate-800 rounded-xl transition cursor-pointer">
              <Bell size={16} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-brand-500 border border-slate-950" />
            </button>
            <div className="h-5 w-[1px] bg-slate-850" />
            <div className="flex items-center gap-2 text-slate-400 text-xs">
              <UserCheck size={14} className="text-emerald-500" />
              <span>Turma Ativa: <strong className="text-slate-250 font-bold">12ºP</strong></span>
            </div>
          </div>
        </header>

        {/* View content panel */}
        <div className="flex-1 overflow-y-auto px-8 py-8">
          {renderActiveView()}
        </div>
      </main>

      {/* Profile/Role selector controller */}
      <div className="fixed bottom-6 right-6 z-40">
        <div className="relative">
          <button
            onClick={() => setShowRoleSelector(!showRoleSelector)}
            className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-650 rounded-xl shadow-2xl transition duration-300 group cursor-pointer"
          >
            <Power size={14} className="text-brand-500 group-hover:rotate-45 transition duration-300" />
            <span>Alternar Perfil Demo</span>
          </button>

          {showRoleSelector && (
            <div className="absolute bottom-11 right-0 w-64 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-2 space-y-1 animate-fade-in">
              <div className="px-2.5 py-1.5 text-3xs text-slate-500 font-extrabold uppercase tracking-widest flex items-center gap-1 border-b border-slate-850 mb-1">
                <Info size={10} />
                Selecione um Perfil
              </div>
              {users.map(u => (
                <button
                  key={u.id}
                  onClick={() => handleRoleChange(u.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-left transition cursor-pointer ${
                    currentUser.id === u.id
                      ? 'bg-brand-600/10 text-brand-400 font-bold'
                      : 'hover:bg-slate-800 text-slate-350 hover:text-white'
                  }`}
                >
                  <img src={u.avatar} className="w-5 h-5 rounded-full" alt="" />
                  <div className="min-w-0">
                    <span className="block truncate">{u.name}</span>
                    <span className="block text-3xs text-slate-550 capitalize">{u.role}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

    </div>
  );
};
export default App;
