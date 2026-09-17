export interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'teacher' | 'admin';
  avatar?: string;
}

export interface Class {
  id: string;
  name: string;
  course: string;
  year: string;
  mainTeacherId: string;
}

export interface Module {
  id: string;
  classId: string;
  name: string;
  description: string;
  orderIndex: number;
}

export interface Lesson {
  id: string;
  moduleId: string;
  teacherId: string;
  title: string;
  description: string;
  plannedDate: string;
  durationMinutes: number;
  status: 'planned' | 'done' | 'cancelled';
  summary?: string;
  topicsCovered?: string;
  observations?: string;
}

export interface Content {
  id: string;
  moduleId: string;
  teacherId: string;
  title: string;
  type: 'video' | 'pdf' | 'link' | 'code' | 'exercise';
  description: string;
  fileUrl?: string;
  externalUrl?: string;
  difficulty: 'Iniciante' | 'Intermédio' | 'Avançado';
  technology: string;
  createdAt: string;
}

export interface Rubric {
  id: string;
  criterion: string;
  maxScore: number;
  description: string;
}

export interface Assignment {
  id: string;
  moduleId: string;
  teacherId: string;
  classId: string;
  title: string;
  description: string;
  instructions: string;
  dueDate: string;
  weightPercentage: number;
  rubrics: Rubric[];
  createdAt: string;
}

export interface RubricScore {
  rubricId: string;
  score: number;
  comment?: string;
}

export interface Submission {
  id: string;
  assignmentId: string;
  studentId: string;
  submittedAt: string;
  status: 'submitted' | 'late' | 'missing';
  githubRepoUrl?: string;
  projectUrl?: string;
  videoUrl?: string;
  finalGrade?: number;
  feedback?: string;
  rubricScores: RubricScore[];
}

export interface Grade {
  id: string;
  studentId: string;
  moduleId: string;
  finalGrade: number;
  calculatedAt: string;
}

export interface AttendanceSession {
  id: string;
  lessonId: string;
  classId: string;
  date: string;
}

export interface AttendanceRecord {
  id: string;
  sessionId: string;
  studentId: string;
  status: 'present' | 'absent' | 'late' | 'justified';
}

export interface GitHubAccount {
  userId: string;
  githubUsername: string;
  connectedAt: string;
}

export interface GitHubRepoActivity {
  id: string;
  studentId: string;
  repoName: string;
  repoUrl: string;
  lastCommitDate: string;
  commitsCount: number;
  languages: string[];
}

