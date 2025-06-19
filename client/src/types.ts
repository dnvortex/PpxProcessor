// User types
export interface User {
  id: number;
  username: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  isAdmin: boolean;
  provider: string;
}

// Material types
export interface Material {
  id: number;
  userId: number;
  title: string;
  description?: string;
  fileType: string;
  content?: string;
  fileUrl?: string;
  subject?: string;
  createdAt: string;
}

// Summary types
export interface Summary {
  id: number;
  userId: number;
  materialId: number;
  title: string;
  content: string;
  pdfUrl?: string;
  createdAt: string;
}

// Quiz types
export interface Quiz {
  id: number;
  userId: number;
  materialId: number;
  title: string;
  description?: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'mixed';
  totalQuestions: number;
  questionType: 'multiple-choice' | 'true-false' | 'fill-blank' | 'short-answer' | 'mixed';
  createdAt: string;
}

// Question types
export interface Question {
  id: number;
  quizId: number;
  questionText: string;
  questionType: 'multiple-choice' | 'true-false' | 'fill-blank' | 'short-answer';
  options?: string[];
  correctAnswer?: string;
  explanation?: string;
}

// QuizAttempt types
export interface QuizAttempt {
  id: number;
  userId: number;
  quizId: number;
  score: number | null;
  totalTime: number | null;
  completed: boolean;
  startedAt: string;
  completedAt: string | null;
}

// UserAnswer types
export interface UserAnswer {
  id: number;
  attemptId: number;
  questionId: number;
  userAnswer: string;
  isCorrect: boolean;
}

// Stats types
export interface DashboardStats {
  totalQuizzes: number;
  savedNotes: number;
  averageScore: string;
  studyHours: string;
}

// Quiz result types
export interface QuizResult {
  question: Question;
  userAnswer: string | null;
  isCorrect: boolean;
}

// Quiz creation form data
export interface QuizFormData {
  materialId: number;
  title: string;
  description?: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'mixed';
  totalQuestions: number;
  questionType: 'multiple-choice' | 'true-false' | 'fill-blank' | 'short-answer' | 'mixed';
}
