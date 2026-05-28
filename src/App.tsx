import React, { useState, useEffect } from 'react';
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

// Firebase client & Views
import { isFirebaseConfigured, auth, db } from './lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, getDocs, doc, addDoc, setDoc, updateDoc, deleteDoc, query, orderBy, getDoc } from 'firebase/firestore';
import { SetupInstructions } from './components/SetupInstructions';
import { LoginView } from './components/LoginView';

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
  Info,
  Loader2
} from 'lucide-react';
import { Github } from './components/Icons';

export const App: React.FC = () => {
  // Config & Auth states
  const [bypassFirebase, setBypassFirebase] = useState(() => localStorage.getItem('devclass_offline_mode') === 'true');
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Global States (Default to mock data, populated from Firebase if online)
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
  const [grades, setGrades] = useState<Grade[]>([
    { id: 'g-1', studentId: 'u-3', moduleId: 'm-1', finalGrade: 17.0, calculatedAt: '2026-10-06' },
    { id: 'g-2', studentId: 'u-3', moduleId: 'm-2', finalGrade: 14.5, calculatedAt: '2026-11-20' },
    { id: 'g-3', studentId: 'u-4', moduleId: 'm-1', finalGrade: 16.5, calculatedAt: '2026-10-06' },
    { id: 'g-4', studentId: 'u-5', moduleId: 'm-2', finalGrade: 12.0, calculatedAt: '2026-11-21' }
  ]);

  // Active Role and Profile (Default: Teacher João Appleton, updated after loading)
  const [currentUser, setCurrentUser] = useState<User>(initialUsers[0]);
  const [currentView, setCurrentView] = useState<string>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');

  // Floating selector display
  const [showRoleSelector, setShowRoleSelector] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [editName, setEditName] = useState('');
  const [editAvatar, setEditAvatar] = useState('');

  // --- FIREBASE SYNCHRONIZATION ---

  // Debug overlay flag: show when ?debug=1 is present
  const showDebug = typeof window !== 'undefined' && (window.location.search.includes('debug=1') || localStorage.getItem('dev_debug') === '1');


  const fetchFirebaseData = async () => {
    if (!isFirebaseConfigured || bypassFirebase) return;
    setLoading(true);
    try {
      // 1. Fetch profiles
      const pSnap = await getDocs(collection(db, 'profiles'));
      const fetchedProfiles = pSnap.docs.map(d => ({ id: d.id, ...d.data() } as any));
      
      if (fetchedProfiles.length > 0) {
        setUsers(fetchedProfiles.map(p => ({
          id: p.id,
          name: p.name,
          email: p.email,
          role: p.role,
          avatar: p.avatar || undefined
        })));

        // Reconstruct GitHub Accounts from profiles containing username
        const fetchedGitAccounts = fetchedProfiles
          .filter(p => p.githubUsername)
          .map(p => ({
            userId: p.id,
            githubUsername: p.githubUsername,
            connectedAt: p.connectedAt || new Date().toISOString().slice(0, 10)
          }));
        setGithubAccounts(fetchedGitAccounts);
      }

      // 2. Fetch classes
      const clSnap = await getDocs(collection(db, 'classes'));
      if (!clSnap.empty) {
        setClasses(clSnap.docs.map(d => {
          const c = d.data();
          return {
            id: d.id,
            name: c.name,
            course: c.course,
            year: c.year,
            mainTeacherId: c.mainTeacherId
          };
        }));
      }

      // 3. Fetch modules
      const mSnap = await getDocs(query(collection(db, 'modules'), orderBy('orderIndex')));
      if (!mSnap.empty) {
        setModules(mSnap.docs.map(d => {
          const m = d.data();
          return {
            id: d.id,
            classId: m.classId,
            name: m.name,
            description: m.description || '',
            orderIndex: m.orderIndex
          };
        }));
      }

      // 4. Fetch lessons
      const lSnap = await getDocs(collection(db, 'lessons'));
      if (!lSnap.empty) {
        setLessons(lSnap.docs.map(d => {
          const l = d.data();
          return {
            id: d.id,
            moduleId: l.moduleId,
            teacherId: l.teacherId,
            title: l.title,
            description: l.description || '',
            plannedDate: l.plannedDate,
            durationMinutes: l.durationMinutes,
            status: l.status,
            summary: l.summary || undefined,
            topicsCovered: l.topicsCovered || undefined,
            observations: l.observations || undefined
          };
        }));
      }

      // 5. Fetch contents
      const coSnap = await getDocs(collection(db, 'contents'));
      if (!coSnap.empty) {
        setContents(coSnap.docs.map(d => {
          const co = d.data();
          return {
            id: d.id,
            moduleId: co.moduleId,
            teacherId: co.teacherId,
            title: co.title,
            type: co.type,
            description: co.description || '',
            fileUrl: co.fileUrl || undefined,
            externalUrl: co.externalUrl || undefined,
            difficulty: co.difficulty,
            technology: co.technology,
            createdAt: co.createdAt ? co.createdAt.slice(0, 10) : new Date().toISOString().slice(0, 10)
          };
        }));
      }

      // 6. Fetch assignments
      const aSnap = await getDocs(collection(db, 'assignments'));
      if (!aSnap.empty) {
        setAssignments(aSnap.docs.map(d => {
          const a = d.data();
          return {
            id: d.id,
            moduleId: a.moduleId,
            teacherId: a.teacherId,
            classId: a.classId,
            title: a.title,
            description: a.description || '',
            instructions: a.instructions || '',
            dueDate: a.dueDate,
            weightPercentage: Number(a.weightPercentage),
            rubrics: (a.rubrics || []).map((r: any) => ({
              id: r.id,
              criterion: r.criterion,
              maxScore: Number(r.maxScore),
              description: r.description || ''
            })),
            createdAt: a.createdAt ? a.createdAt.slice(0, 10) : new Date().toISOString().slice(0, 10)
          };
        }));
      }

      // 7. Fetch submissions
      const sSnap = await getDocs(collection(db, 'submissions'));
      if (!sSnap.empty) {
        setSubmissions(sSnap.docs.map(d => {
          const s = d.data();
          return {
            id: d.id,
            assignmentId: s.assignmentId,
            studentId: s.studentId,
            submittedAt: s.submittedAt,
            status: s.status,
            githubRepoUrl: s.githubRepoUrl || undefined,
            projectUrl: s.projectUrl || undefined,
            videoUrl: s.videoUrl || undefined,
            finalGrade: s.finalGrade !== null && s.finalGrade !== undefined ? Number(s.finalGrade) : undefined,
            feedback: s.feedback || undefined,
            rubricScores: (s.rubricScores || []).map((rs: any) => ({
              rubricId: rs.rubricId,
              score: Number(rs.score),
              comment: rs.comment || undefined
            }))
          };
        }));
      }

      // 8. Fetch grades
      const gSnap = await getDocs(collection(db, 'grades'));
      if (!gSnap.empty) {
        setGrades(gSnap.docs.map(d => {
          const g = d.data();
          return {
            id: d.id,
            studentId: g.studentId,
            moduleId: g.moduleId,
            finalGrade: Number(g.finalGrade),
            calculatedAt: g.calculatedAt ? g.calculatedAt.slice(0, 10) : new Date().toISOString().slice(0, 10)
          };
        }));
      }

      // 9. Fetch repo activities
      const graSnap = await getDocs(collection(db, 'github_repo_activities'));
      if (!graSnap.empty) {
        setGithubRepoActivity(graSnap.docs.map(d => {
          const gra = d.data();
          return {
            id: d.id,
            studentId: gra.studentId,
            repoName: gra.repoName,
            repoUrl: gra.repoUrl,
            lastCommitDate: gra.lastCommitDate,
            commitsCount: Number(gra.commitsCount),
            languages: gra.languages || []
          };
        }));
      }

      // 10. Fetch attendance sessions & reconstruct attendance records
      const sesSnap = await getDocs(collection(db, 'attendance_sessions'));
      if (!sesSnap.empty) {
        setAttendanceSessions(sesSnap.docs.map(d => {
          const as = d.data();
          return {
            id: d.id,
            lessonId: as.lessonId,
            classId: as.classId,
            date: as.date
          };
        }));

        const recordsList: AttendanceRecord[] = [];
        sesSnap.docs.forEach(d => {
          const as = d.data();
          if (as.records) {
            Object.entries(as.records).forEach(([studentId, status]: any) => {
              recordsList.push({
                id: `ar-${d.id}-${studentId}`,
                sessionId: d.id,
                studentId,
                status
              });
            });
          }
        });
        setAttendanceRecords(recordsList);
      }

    } catch (err) {
      console.error('Erro a carregar dados do Firebase Firestore:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isFirebaseConfigured || bypassFirebase) {
      setUsers(initialUsers);
      setClasses(initialClasses);
      setModules(initialModules);
      setLessons(initialLessons);
      setContents(initialContents);
      setAssignments(initialAssignments);
      setSubmissions(initialSubmissions);
      setGithubAccounts(initialGitHubAccounts);
      setGithubRepoActivity(initialGitHubRepoActivity);
      setAttendanceSessions(initialAttendanceSessions);
      setAttendanceRecords(initialAttendanceRecords);
      setGrades([
        { id: 'g-1', studentId: 'u-3', moduleId: 'm-1', finalGrade: 17.0, calculatedAt: '2026-10-06' },
        { id: 'g-2', studentId: 'u-3', moduleId: 'm-2', finalGrade: 14.5, calculatedAt: '2026-11-20' },
        { id: 'g-3', studentId: 'u-4', moduleId: 'm-1', finalGrade: 16.5, calculatedAt: '2026-10-06' },
        { id: 'g-4', studentId: 'u-5', moduleId: 'm-2', finalGrade: 12.0, calculatedAt: '2026-11-21' }
      ]);
      setCurrentUser(initialUsers[0]);
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setSession(user);
      console.log('onAuthStateChanged fired. user:', user, 'location:', typeof window !== 'undefined' ? window.location.href : 'n/a');
      if (user) {
        // When a user signs in via redirect, we must ensure their profile exists
        // in Firestore. Fetch data and create a profile doc if missing.
        (async () => {
          try {
            await fetchFirebaseData();
            const profileRef = doc(db, 'profiles', user.uid);
            const profileSnap = await getDoc(profileRef);
            if (!profileSnap.exists()) {
              await setDoc(profileRef, {
                name: (user as any).displayName || 'Utilizador Google',
                email: (user as any).email || '',
                role: 'student',
                avatar: (user as any).photoURL || null,
                createdAt: new Date().toISOString()
              });
              // Reload profiles into state
              await fetchFirebaseData();
            }
          } catch (err) {
            console.error('Erro ao processar perfil após autenticação:', err);
          } finally {
            setLoading(false);
          }
        })();
      } else {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [bypassFirebase]);

  // Sync profile data once authenticated & profiles are fetched
  useEffect(() => {
    if (isFirebaseConfigured && !bypassFirebase && session && users.length > 0) {
      const activeProfile = users.find(u => u.id === session.uid);
      if (activeProfile) {
        setCurrentUser(activeProfile);
        setCurrentView(activeProfile.role === 'admin' ? 'admin' : 'dashboard');
      }
    }
  }, [session, users, bypassFirebase]);

  // Navigation handlers
  const handleNavigate = (view: string) => {
    setCurrentView(view);
  };

  // --- DEBUG: small overlay to help diagnose redirect/auth issues ---
  const DebugOverlay: React.FC = () => {
    const [registrations, setRegistrations] = useState<string[]>([]);
    useEffect(() => {
      (async () => {
        if ('serviceWorker' in navigator) {
          try {
            const regs = await navigator.serviceWorker.getRegistrations();
            setRegistrations(regs.map(r => r.scope));
          } catch (e) {
            setRegistrations(['error']);
          }
        }
      })();
    }, []);

    return (
      <div style={{position:'fixed',right:12,top:12,zIndex:9999,background:'rgba(0,0,0,0.6)',color:'#fff',padding:12,borderRadius:8,fontSize:12,maxWidth:380}}>
        <div style={{fontWeight:700,marginBottom:6}}>Dev Debug</div>
        <div><strong>URL:</strong> {typeof window !== 'undefined' ? window.location.href : 'n/a'}</div>
        <div><strong>Host:</strong> {typeof window !== 'undefined' ? window.location.hostname : 'n/a'}</div>
        <div><strong>Auth session:</strong> {session ? JSON.stringify({uid: (session as any).uid, email: (session as any).email}) : 'null'}</div>
        <div><strong>auth.currentUser:</strong> {JSON.stringify((auth as any)?.currentUser ? {uid: (auth as any).currentUser.uid, email: (auth as any).currentUser.email} : null)}</div>
        <div><strong>SW regs:</strong> {registrations.length ? registrations.join(', ') : 'none'}</div>
      </div>
    );
  };

  const handleRoleChange = (userId: string) => {
    const matchedUser = users.find(u => u.id === userId);
    if (matchedUser) {
      setCurrentUser(matchedUser);
      setCurrentView(matchedUser.role === 'admin' ? 'admin' : 'dashboard');
      setShowRoleSelector(false);
    }
  };

  const handleOpenEditProfile = () => {
    setEditName(currentUser?.name || '');
    setEditAvatar(currentUser?.avatar || '');
    setShowEditProfile(true);
  };

  const handleSaveProfile = async () => {
    const newData = { name: editName, avatar: editAvatar };
    if (isFirebaseConfigured && !bypassFirebase) {
      try {
        await updateDoc(doc(db, 'profiles', currentUser.id), newData);
        await fetchFirebaseData();
        setShowEditProfile(false);
      } catch (err) {
        console.error('Error updating profile:', err);
        alert('Erro ao atualizar perfil. Veja a consola para detalhes.');
      }
    } else {
      // offline/demo mode: update local state
      setUsers(prev => prev.map(u => u.id === currentUser.id ? { ...u, ...newData } : u));
      setCurrentUser(prev => prev ? { ...prev, ...newData } : prev as any);
      setShowEditProfile(false);
    }
  };

  // --- MUTATION HANDLERS (Firebase Database Writes) ---

  const handleAddLesson = async (newLesson: Omit<Lesson, 'id'>) => {
    if (isFirebaseConfigured && !bypassFirebase) {
      try {
        await addDoc(collection(db, 'lessons'), {
          moduleId: newLesson.moduleId,
          teacherId: newLesson.teacherId,
          title: newLesson.title,
          description: newLesson.description,
          plannedDate: newLesson.plannedDate,
          durationMinutes: newLesson.durationMinutes,
          status: newLesson.status
        });
        await fetchFirebaseData();
      } catch (err) {
        console.error('Error saving lesson:', err);
      }
    } else {
      const created: Lesson = {
        ...newLesson,
        id: `l-${lessons.length + 1}`
      };
      setLessons([...lessons, created]);
    }
  };

  const handleLogLesson = async (
    lessonId: string,
    summary: string,
    topics: string,
    obs: string,
    attendance: { [studentId: string]: 'present' | 'absent' | 'late' | 'justified' }
  ) => {
    if (isFirebaseConfigured && !bypassFirebase) {
      try {
        // 1. Update lesson doc
        await updateDoc(doc(db, 'lessons', lessonId), {
          status: 'done',
          summary,
          topicsCovered: topics,
          observations: obs
        });

        const lessonObj = lessons.find(l => l.id === lessonId);
        const moduleObj = lessonObj ? modules.find(m => m.id === lessonObj.moduleId) : null;
        const classId = moduleObj ? moduleObj.classId : (classes[0]?.id || '');

        // 2. Create attendance session with embedded student records
        await addDoc(collection(db, 'attendance_sessions'), {
          lessonId,
          classId,
          date: new Date().toISOString().slice(0, 10),
          records: attendance
        });

        await fetchFirebaseData();
      } catch (err) {
        console.error('Error logging lesson:', err);
      }
    } else {
      setLessons(prev => prev.map(l => l.id === lessonId ? {
        ...l,
        status: 'done',
        summary,
        topicsCovered: topics,
        observations: obs
      } : l));

      const sessionId = `as-${attendanceSessions.length + 1}`;
      const newSession: AttendanceSession = {
        id: sessionId,
        lessonId,
        classId: 'c-1',
        date: '2026-05-20'
      };
      setAttendanceSessions(prev => [...prev, newSession]);

      const newRecords: AttendanceRecord[] = Object.entries(attendance).map(([studentId, status], idx) => ({
        id: `ar-${attendanceRecords.length + 1 + idx}`,
        sessionId,
        studentId,
        status
      }));
      setAttendanceRecords(prev => [...prev, ...newRecords]);
    }
  };

  const handleUploadContent = async (newContent: Omit<Content, 'id' | 'createdAt'>) => {
    if (isFirebaseConfigured && !bypassFirebase) {
      try {
        await addDoc(collection(db, 'contents'), {
          moduleId: newContent.moduleId,
          teacherId: newContent.teacherId,
          title: newContent.title,
          type: newContent.type,
          description: newContent.description,
          fileUrl: newContent.fileUrl || null,
          externalUrl: newContent.externalUrl || null,
          difficulty: newContent.difficulty,
          technology: newContent.technology,
          createdAt: new Date().toISOString()
        });
        await fetchFirebaseData();
      } catch (err) {
        console.error('Error uploading content:', err);
      }
    } else {
      const created: Content = {
        ...newContent,
        id: `co-${contents.length + 1}`,
        createdAt: '2026-05-20'
      };
      setContents([...contents, created]);
    }
  };

  const handleGradeSubmission = async (
    submissionId: string,
    grade: number,
    feedback: string,
    rubricScores: RubricScore[]
  ) => {
    if (isFirebaseConfigured && !bypassFirebase) {
      try {
        // 1. Update submission
        await updateDoc(doc(db, 'submissions', submissionId), {
          finalGrade: grade,
          feedback,
          rubricScores: rubricScores.map(rs => ({
            rubricId: rs.rubricId,
            score: rs.score,
            comment: rs.comment || null
          }))
        });

        // 2. Set/Upsert Grade
        const targetSub = submissions.find(s => s.id === submissionId);
        const targetAssign = targetSub ? assignments.find(a => a.id === targetSub.assignmentId) : null;
        if (targetSub && targetAssign) {
          const gradeDocId = `${targetSub.studentId}_${targetAssign.moduleId}`;
          await setDoc(doc(db, 'grades', gradeDocId), {
            studentId: targetSub.studentId,
            moduleId: targetAssign.moduleId,
            finalGrade: grade,
            calculatedAt: new Date().toISOString()
          });
        }

        await fetchFirebaseData();
      } catch (err) {
        console.error('Error grading submission:', err);
      }
    } else {
      setSubmissions(prev => prev.map(s => s.id === submissionId ? {
        ...s,
        finalGrade: grade,
        feedback,
        rubricScores
      } : s));

      const targetSub = submissions.find(s => s.id === submissionId);
      const targetAssign = targetSub ? assignments.find(a => a.id === targetSub.assignmentId) : null;
      
      if (targetSub && targetAssign) {
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
    }
  };

  const handleSubmitAssignment = async (
    assignmentId: string,
    studentId: string,
    github: string,
    projectUrl: string,
    zipName: string
  ) => {
    if (isFirebaseConfigured && !bypassFirebase) {
      try {
        await addDoc(collection(db, 'submissions'), {
          assignmentId,
          studentId,
          submittedAt: new Date().toISOString(),
          status: 'submitted',
          githubRepoUrl: github,
          projectUrl,
          videoUrl: zipName,
          rubricScores: []
        });

        const repoName = github.split('/').pop() || 'projeto';
        await addDoc(collection(db, 'github_repo_activities'), {
          studentId,
          repoName,
          repoUrl: github,
          lastCommitDate: new Date().toISOString(),
          commitsCount: 1,
          languages: ['HTML', 'CSS', 'JavaScript']
        });

        await fetchFirebaseData();
      } catch (err) {
        console.error('Error submitting assignment:', err);
      }
    } else {
      const newSub: Submission = {
        id: `s-${submissions.length + 1}`,
        assignmentId,
        studentId,
        submittedAt: new Date().toISOString().slice(0, 19),
        status: 'submitted',
        githubRepoUrl: github,
        projectUrl,
        videoUrl: zipName,
        rubricScores: []
      };
      setSubmissions([...submissions, newSub]);

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
    }
  };

  const handleConnectGitHub = async (username: string) => {
    if (isFirebaseConfigured && !bypassFirebase) {
      try {
        // Update user profile document in Firestore
        await updateDoc(doc(db, 'profiles', currentUser.id), {
          githubUsername: username,
          connectedAt: new Date().toISOString().slice(0, 10)
        });

        // Insert repo activity docs
        await addDoc(collection(db, 'github_repo_activities'), {
          studentId: currentUser.id,
          repoName: 'projeto-portfolio',
          repoUrl: `https://github.com/${username}/projeto-portfolio`,
          lastCommitDate: new Date().toISOString(),
          commitsCount: 12,
          languages: ['HTML', 'CSS']
        });
        await addDoc(collection(db, 'github_repo_activities'), {
          studentId: currentUser.id,
          repoName: 'mini-pwa-finance',
          repoUrl: `https://github.com/${username}/mini-pwa-finance`,
          lastCommitDate: new Date().toISOString(),
          commitsCount: 26,
          languages: ['JavaScript', 'HTML']
        });

        await fetchFirebaseData();
      } catch (err) {
        console.error('Error connecting GitHub:', err);
      }
    } else {
      const newAcc: GitHubAccount = {
        userId: currentUser.id,
        githubUsername: username,
        connectedAt: '2026-05-20'
      };
      setGithubAccounts([...githubAccounts, newAcc]);

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
    }
  };

  const handleUpdateGrade = async (studentId: string, moduleId: string, gradeVal: number) => {
    if (isFirebaseConfigured && !bypassFirebase) {
      try {
        const gradeDocId = `${studentId}_${moduleId}`;
        await setDoc(doc(db, 'grades', gradeDocId), {
          studentId,
          moduleId,
          finalGrade: gradeVal,
          calculatedAt: new Date().toISOString()
        });
        await fetchFirebaseData();
      } catch (err) {
        console.error('Error updating grade:', err);
      }
    } else {
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
    }
  };

  const handleAddUser = async (name: string, email: string, role: 'student' | 'teacher' | 'admin') => {
    if (isFirebaseConfigured && !bypassFirebase) {
      alert('Nota: No modo conectado ao Firebase, novos utilizadores reais devem registar-se através do ecrã de Registo da aplicação para obter credenciais de login.');
    } else {
      const created: User = {
        id: `u-${users.length + 1}`,
        name,
        email,
        role,
        avatar: `https://images.unsplash.com/photo-${1500000000000 + users.length * 100000}?w=80&h=80&fit=crop&crop=face`
      };
      setUsers([...users, created]);
    }
  };

  const handleAddClass = async (name: string, course: string, year: string, teacherId: string) => {
    if (isFirebaseConfigured && !bypassFirebase) {
      try {
        await addDoc(collection(db, 'classes'), {
          name,
          course,
          year,
          mainTeacherId: teacherId,
          createdAt: new Date().toISOString()
        });
        await fetchFirebaseData();
      } catch (err) {
        console.error('Error creating class:', err);
      }
    } else {
      const created: Class = {
        id: `c-${classes.length + 1}`,
        name,
        course,
        year,
        mainTeacherId: teacherId
      };
      setClasses([...classes, created]);
    }
  };

  const handleAddModule = async (name: string, description: string, orderIndex: number, classId: string) => {
    if (isFirebaseConfigured && !bypassFirebase) {
      try {
        await addDoc(collection(db, 'modules'), {
          classId,
          name,
          description,
          orderIndex
        });
        await fetchFirebaseData();
      } catch (err) {
        console.error('Error saving module:', err);
      }
    } else {
      const created: Module = {
        id: `m-${modules.length + 1}`,
        classId,
        name,
        description,
        orderIndex
      };
      setModules([...modules, created]);
    }
  };

  const handleAddAssignment = async (newAssignment: Omit<Assignment, 'id' | 'createdAt'>) => {
    if (isFirebaseConfigured && !bypassFirebase) {
      try {
        await addDoc(collection(db, 'assignments'), {
          ...newAssignment,
          createdAt: new Date().toISOString()
        });
        await fetchFirebaseData();
      } catch (err) {
        console.error('Error saving assignment:', err);
      }
    } else {
      const created: Assignment = {
        ...newAssignment,
        id: `a-${assignments.length + 1}`,
        createdAt: new Date().toISOString().slice(0, 10)
      };
      setAssignments([...assignments, created]);
    }
  };

  const handleClearPedagogicalData = async () => {
    if (isFirebaseConfigured && !bypassFirebase) {
      try {
        const collectionsToClear = [
          'classes',
          'modules',
          'lessons',
          'contents',
          'assignments',
          'submissions',
          'grades',
          'attendance_sessions',
          'github_repo_activities'
        ];
        
        for (const colName of collectionsToClear) {
          const snap = await getDocs(collection(db, colName));
          for (const docObj of snap.docs) {
            await deleteDoc(doc(db, colName, docObj.id));
          }
        }
        await fetchFirebaseData();
      } catch (err) {
        console.error('Error clearing data:', err);
        throw err;
      }
    } else {
      // Clear offline state
      setClasses([]);
      setModules([]);
      setLessons([]);
      setContents([]);
      setAssignments([]);
      setSubmissions([]);
      setGrades([]);
      setAttendanceSessions([]);
      setAttendanceRecords([]);
      setGithubRepoActivity([]);
    }
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
  ].filter(item => item.roles.includes(currentUser?.role || 'student'));

  // Render View Routing Selector
  const renderActiveView = () => {
    if (!currentUser) return <div className="text-white">Carregando perfil...</div>;

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
            githubRepoActivity={githubRepoActivity}
            attendanceRecords={attendanceRecords}
            attendanceSessions={attendanceSessions}
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
            classes={classes}
            modules={modules}
            lessons={lessons}
            students={studentsList}
            onAddLesson={handleAddLesson}
            onLogLesson={handleLogLesson}
            onAddModule={handleAddModule}
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
            modules={modules}
            classes={classes}
            onGradeSubmission={handleGradeSubmission}
            onSubmitAssignment={handleSubmitAssignment}
            onAddAssignment={handleAddAssignment}
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
            onClearPedagogicalData={handleClearPedagogicalData}
          />
        );
      default:
        return <div className="text-white">Em construção</div>;
    }
  };

  // --- RENDERING ROUTER & VIEWS ---

  // 1. Not configured at all
  if (!isFirebaseConfigured && !bypassFirebase) {
    return <SetupInstructions onBypass={() => {
      setBypassFirebase(true);
      localStorage.setItem('devclass_offline_mode', 'true');
    }} />;
  }

  // 2. Configured but not logged in
  if (isFirebaseConfigured && !bypassFirebase && !session) {
    return (
      <LoginView 
        onBypass={() => {
          setBypassFirebase(true);
          localStorage.setItem('devclass_offline_mode', 'true');
        }}
        onLoginSuccess={() => fetchFirebaseData()}
      />
    );
  }

  // 3. Loading database state
  if (isFirebaseConfigured && !bypassFirebase && loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#0b0f19] text-white">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin text-brand-500" size={40} />
          <span className="text-xs font-semibold text-slate-400">A carregar dados do Firebase...</span>
        </div>
      </div>
    );
  }

  // 4. Authenticated or Offline Main Application
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
        <div className="p-4 border-t border-slate-850 bg-slate-900/20 space-y-3">
          <div className="flex items-center gap-3">
            <img src={currentUser?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&h=80&fit=crop&crop=face'} className="w-9 h-9 rounded-full border border-slate-700/60" alt="" />
            <div className="min-w-0">
              <span className="text-xs font-bold text-white block truncate">{currentUser?.name || 'Carregando...'}</span>
              <span className="text-3xs text-slate-550 font-medium block capitalize tracking-wider">{currentUser?.role || 'student'}</span>
            </div>
          </div>

          <div className="pt-2 flex items-center gap-2">
            <button
              onClick={handleOpenEditProfile}
              className="px-3 py-1.5 text-3xs bg-slate-800 hover:bg-slate-750 rounded-md text-slate-300 border border-slate-700"
            >
              Editar Perfil
            </button>
          </div>

          {/* Database connection indicator & Logout */}
          <div className="pt-2 border-t border-slate-850 flex flex-col gap-1.5 text-4xs">
            {isFirebaseConfigured && !bypassFirebase ? (
              <div className="flex items-center justify-between text-slate-500">
                <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Firebase Online</span>
                <button 
                  onClick={async () => {
                    await signOut(auth);
                  }}
                  className="text-slate-400 hover:text-rose-450 font-bold underline cursor-pointer"
                >
                  Sair
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between text-slate-500">
                <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" /> Offline Demo</span>
                {isFirebaseConfigured ? (
                  <button 
                    onClick={() => {
                      setBypassFirebase(false);
                      localStorage.removeItem('devclass_offline_mode');
                    }}
                    className="text-slate-450 hover:text-brand-400 font-bold underline cursor-pointer"
                  >
                    Ligar Firebase
                  </button>
                ) : (
                  <button 
                    onClick={() => {
                      setBypassFirebase(false);
                      localStorage.removeItem('devclass_offline_mode');
                    }}
                    className="text-slate-450 hover:text-brand-400 font-bold underline cursor-pointer"
                  >
                    Ver Config
                  </button>
                )}
              </div>
            )}
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
              className="bg-transparent text-xs text-slate-300 outline-none w-full placeholder-slate-650"
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

      {/* Profile/Role selector controller (Only in Local Offline Demo Mode) */}
      {(!isFirebaseConfigured || bypassFirebase) && (
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
                      currentUser?.id === u.id
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
      )}


      {/* Edit Profile Modal */}
      {showEditProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-md p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl">
            <h3 className="text-sm font-bold text-white mb-3">Editar Perfil</h3>
            <label className="text-3xs text-slate-400">Nome</label>
            <input value={editName} onChange={(e) => setEditName(e.target.value)} className="w-full p-2 my-2 rounded bg-slate-800 text-sm text-white border border-slate-700 outline-none" />
            <label className="text-3xs text-slate-400">URL Avatar</label>
            <input value={editAvatar} onChange={(e) => setEditAvatar(e.target.value)} className="w-full p-2 my-2 rounded bg-slate-800 text-sm text-white border border-slate-700 outline-none" />
            <div className="flex items-center justify-end gap-2 mt-4">
              <button onClick={() => setShowEditProfile(false)} className="px-3 py-1.5 text-3xs bg-slate-800 hover:bg-slate-750 rounded-md text-slate-300 border border-slate-700">Cancelar</button>
              <button onClick={handleSaveProfile} className="px-3 py-1.5 text-3xs bg-emerald-600 hover:bg-emerald-700 rounded-md text-white font-bold">Guardar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default App;
