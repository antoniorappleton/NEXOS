import React, { useState, useEffect } from 'react';
import {
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
import { isFirebaseConfigured, auth, db, ADMIN_EMAILS } from './lib/firebase';
import { onAuthStateChanged, signOut, getRedirectResult } from 'firebase/auth';
import { collection, getDocs, doc, addDoc, setDoc, updateDoc, deleteDoc, query, orderBy, getDoc, where } from 'firebase/firestore';
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
  Loader2
} from 'lucide-react';
import { Github } from './components/Icons';

export const App: React.FC = () => {
  // Config & Auth states
  const bypassFirebase = false;
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  // Global states are hydrated exclusively from Firebase or user input.
  const [users, setUsers] = useState<User[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [contents, setContents] = useState<Content[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [githubAccounts, setGithubAccounts] = useState<GitHubAccount[]>([]);
  const [githubRepoActivity, setGithubRepoActivity] = useState<GitHubRepoActivity[]>([]);
  const [attendanceSessions, setAttendanceSessions] = useState<AttendanceSession[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);

  // Active profile is resolved after authentication and Firestore profile load.
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<string>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');

  const [showEditProfile, setShowEditProfile] = useState(false);
  const [editName, setEditName] = useState('');
  const [editAvatar, setEditAvatar] = useState('');
  const [editRole, setEditRole] = useState<'student' | 'teacher' | 'admin'>('student');

  // --- FIREBASE SYNCHRONIZATION ---

  // Debug overlay flag: show when ?debug=1 is present
  const showDebug = typeof window !== 'undefined' && (window.location.search.includes('debug=1') || localStorage.getItem('dev_debug') === '1');


  const fetchFirebaseData = async () => {
    if (!isFirebaseConfigured || bypassFirebase) return;
    setLoading(true);
    try {
      setUsers([]);
      setClasses([]);
      setModules([]);
      setLessons([]);
      setContents([]);
      setAssignments([]);
      setSubmissions([]);
      setGithubAccounts([]);
      setGithubRepoActivity([]);
      setAttendanceSessions([]);
      setAttendanceRecords([]);
      setGrades([]);

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
      setLoading(false);
      return;
    }

    // Try to resolve a redirect sign-in result (returns UserCredential if present)
    (async () => {
      if (isFirebaseConfigured && !bypassFirebase) {
        try {
          const redirectResult = await getRedirectResult(auth);
          console.log('getRedirectResult resolved with:', redirectResult);
          if (redirectResult && redirectResult.user) {
            console.log('Processed getRedirectResult for', redirectResult.user.uid);
            setSession(redirectResult.user);
            setAuthError(null);
            try {
              await fetchFirebaseData();
              const profileRef = doc(db, 'profiles', redirectResult.user.uid);
              const profileSnap = await getDoc(profileRef);
              if (!profileSnap.exists()) {
                const savedRole = (typeof window !== 'undefined' ? localStorage.getItem('google_login_role') : null) || 'student';
                let finalRole = savedRole;
                let finalName = (redirectResult.user as any).displayName || 'Utilizador Google';
                let finalAvatar = (redirectResult.user as any).photoURL || null;

                if (redirectResult.user.email) {
                  const q = query(collection(db, 'profiles'), where('email', '==', redirectResult.user.email));
                  const querySnap = await getDocs(q);
                  if (!querySnap.empty) {
                    const existingProfile = querySnap.docs[0].data();
                    finalRole = existingProfile.role || finalRole;
                    finalName = existingProfile.name || finalName;
                    finalAvatar = existingProfile.avatar || finalAvatar;
                    if (querySnap.docs[0].id !== redirectResult.user.uid) {
                      await deleteDoc(doc(db, 'profiles', querySnap.docs[0].id));
                    }
                  }
                }

                if (ADMIN_EMAILS.includes((redirectResult.user as any).email || '')) {
                  finalRole = 'admin';
                }

                await setDoc(profileRef, {
                  name: finalName,
                  email: (redirectResult.user as any).email || '',
                  role: finalRole,
                  avatar: finalAvatar,
                  createdAt: new Date().toISOString()
                });
                if (typeof window !== 'undefined') {
                  localStorage.removeItem('google_login_role');
                }
                await fetchFirebaseData();
              } else if (
                ADMIN_EMAILS.includes((redirectResult.user as any).email || '') &&
                profileSnap.data()?.role !== 'admin'
              ) {
                await updateDoc(profileRef, { role: 'admin' });
                await fetchFirebaseData();
              }
            } catch (err: any) {
              console.error('Erro ao processar redirect result profile:', err);
              const errMsg = err?.message || '';
              if (errMsg.includes('Database') || errMsg.includes('default') || err?.code === 'unavailable') {
                setAuthError('A base de dados Cloud Firestore "(default)" não foi encontrada. Vá ao Console do Firebase, clique em "Firestore Database" e clique em "Criar base de dados" (em modo de teste).');
              } else {
                setAuthError(errMsg || 'Erro ao carregar perfil no Firestore.');
              }
              setSession(null);
              await signOut(auth);
            }
          }
        } catch (e: any) {
          console.error('Erro no getRedirectResult do Firebase:', e);
          if (e?.code === 'auth/unauthorized-domain') {
            setAuthError('O domínio antoniorappleton.github.io não está autorizado no console do Firebase. Adicione-o em Authentication -> Settings -> Authorized Domains.');
          } else {
            setAuthError(e?.message || 'Erro ao processar o resultado da autenticação.');
          }
        }
      }
    })();
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
              const savedRole = (typeof window !== 'undefined' ? localStorage.getItem('google_login_role') : null) || 'student';
              let finalRole = savedRole;
              let finalName = (user as any).displayName || 'Utilizador Google';
              let finalAvatar = (user as any).photoURL || null;

              if (user.email) {
                const q = query(collection(db, 'profiles'), where('email', '==', user.email));
                const querySnap = await getDocs(q);
                if (!querySnap.empty) {
                  const existingProfile = querySnap.docs[0].data();
                  finalRole = existingProfile.role || finalRole;
                  finalName = existingProfile.name || finalName;
                  finalAvatar = existingProfile.avatar || finalAvatar;
                  if (querySnap.docs[0].id !== user.uid) {
                    await deleteDoc(doc(db, 'profiles', querySnap.docs[0].id));
                  }
                }
              }

              if (ADMIN_EMAILS.includes((user as any).email || '')) {
                finalRole = 'admin';
              }

              await setDoc(profileRef, {
                name: finalName,
                email: (user as any).email || '',
                role: finalRole,
                avatar: finalAvatar,
                createdAt: new Date().toISOString()
              });
              if (typeof window !== 'undefined') {
                localStorage.removeItem('google_login_role');
              }
              // Reload profiles into state
              await fetchFirebaseData();
            } else if (
              ADMIN_EMAILS.includes((user as any).email || '') &&
              profileSnap.data()?.role !== 'admin'
            ) {
              await updateDoc(profileRef, { role: 'admin' });
              await fetchFirebaseData();
            }
          } catch (err: any) {
            console.error('Erro ao processar perfil após autenticação:', err);
            const errMsg = err?.message || '';
            if (errMsg.includes('Database') || errMsg.includes('default') || err?.code === 'unavailable') {
              setAuthError('A base de dados Cloud Firestore "(default)" não foi encontrada. Vá ao Console do Firebase, clique em "Firestore Database" e clique em "Criar base de dados" (em modo de teste).');
            } else {
              setAuthError(errMsg || 'Erro ao processar perfil após autenticação.');
            }
            setSession(null);
            await signOut(auth);
          } finally {
            setLoading(false);
          }
        })();
      } else {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

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

  const handleOpenEditProfile = () => {
    setEditName(currentUser?.name || '');
    setEditAvatar(currentUser?.avatar || '');
    setEditRole(currentUser?.role || 'student');
    setShowEditProfile(true);
  };

  const handleSaveProfile = async () => {
    if (!currentUser) return;
    const newData = { name: editName, avatar: editAvatar, role: editRole };
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
        date: new Date().toISOString().slice(0, 10)
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
        createdAt: new Date().toISOString().slice(0, 10)
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
            calculatedAt: new Date().toISOString().slice(0, 10)
          } : g));
        } else {
          const newGrade: Grade = {
            id: `g-${grades.length + 1}`,
            studentId: targetSub.studentId,
            moduleId: targetAssign.moduleId,
            finalGrade: grade,
            calculatedAt: new Date().toISOString().slice(0, 10)
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
          commitsCount: 0,
          languages: []
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
        commitsCount: 0,
        languages: []
      };
      setGithubRepoActivity([...githubRepoActivity, newRepo]);
    }
  };

  const handleConnectGitHub = async (username: string) => {
    if (!currentUser) return;
    if (isFirebaseConfigured && !bypassFirebase) {
      try {
        await updateDoc(doc(db, 'profiles', currentUser.id), {
          githubUsername: username,
          connectedAt: new Date().toISOString().slice(0, 10)
        });
        await fetchFirebaseData();
      } catch (err) {
        console.error('Error connecting GitHub:', err);
      }
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
          calculatedAt: new Date().toISOString().slice(0, 10)
        } : g));
      } else {
        const created: Grade = {
          id: `g-${grades.length + 1}`,
          studentId,
          moduleId,
          finalGrade: gradeVal,
          calculatedAt: new Date().toISOString().slice(0, 10)
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

  const activeClassName = classes[0]?.name;

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
  if (!isFirebaseConfigured) {
    return <SetupInstructions />;
  }

  // 2. Configured but not logged in
  if (isFirebaseConfigured && !bypassFirebase && !session) {
    return (
      <LoginView
        onLoginSuccess={() => fetchFirebaseData()}
        externalError={authError}
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
            <span className="font-extrabold text-lg tracking-tight text-white block">NEXOS</span>
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
              <span>Turma Ativa: <strong className="text-slate-250 font-bold">{activeClassName || 'Sem turma'}</strong></span>
            </div>
          </div>
        </header>

        {/* View content panel */}
        <div className="flex-1 overflow-y-auto px-8 py-8">
          {renderActiveView()}
        </div>
      </main>

      {/* Edit Profile Modal */}
      {showEditProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-xs">
          <div className="w-full max-w-md p-6 bg-[#111726] border border-slate-800 rounded-2xl shadow-2xl">
            <h3 className="text-sm font-bold text-white mb-4">Editar Perfil</h3>
            <div className="space-y-4">
              <div>
                <label className="text-3xs text-slate-400 font-bold uppercase tracking-wider block mb-1">Nome</label>
                <input 
                  value={editName} 
                  onChange={(e) => setEditName(e.target.value)} 
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white outline-none focus:border-brand-500 transition" 
                />
              </div>
              <div>
                <label className="text-3xs text-slate-400 font-bold uppercase tracking-wider block mb-1">URL Avatar</label>
                <input 
                  value={editAvatar} 
                  onChange={(e) => setEditAvatar(e.target.value)} 
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white outline-none focus:border-brand-500 transition" 
                />
              </div>
              <div>
                <label className="text-3xs text-slate-400 font-bold uppercase tracking-wider block mb-1">Cargo / Perfil</label>
                <select
                  value={editRole}
                  onChange={(e: any) => setEditRole(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white outline-none focus:border-brand-500 transition font-semibold"
                >
                  <option value="student">Aluno</option>
                  <option value="teacher">Professor</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 mt-6">
              <button 
                onClick={() => setShowEditProfile(false)} 
                className="px-3.5 py-2 text-3xs bg-slate-800 hover:bg-slate-750 rounded-lg text-slate-300 border border-slate-700 cursor-pointer"
              >
                Cancelar
              </button>
              <button 
                onClick={handleSaveProfile} 
                className="px-3.5 py-2 text-3xs bg-emerald-600 hover:bg-emerald-700 rounded-lg text-white font-bold cursor-pointer"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default App;
