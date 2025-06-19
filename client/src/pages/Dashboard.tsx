import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '../contexts/AuthContext';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import LoadingModal from '../components/modals/LoadingModal';
import QuizCreationModal from '../components/modals/QuizCreationModal';
import StatsCard from '../components/dashboard/StatsCard';
import RecentQuizList from '../components/dashboard/RecentQuizList';
import RecentSummaryList from '../components/dashboard/RecentSummaryList';
import UploadMaterial from '../components/dashboard/UploadMaterial';
import { DashboardStats, Material, Quiz, QuizAttempt, Summary } from '../types';
import { useToast } from '@/hooks/use-toast';

// Sample data for development
const MOCK_MATERIALS: Material[] = [
  {
    id: 1,
    userId: 12345,
    title: 'Introduction to AI',
    description: 'Basic concepts of artificial intelligence',
    fileType: 'pdf',
    content: 'Sample content about AI...',
    fileUrl: '/sample-files/ai-intro.pdf',
    subject: 'Computer Science',
    createdAt: '2025-03-15T10:00:00Z',
  },
  {
    id: 2,
    userId: 12345,
    title: 'Web Development',
    description: 'Frontend and backend basics',
    fileType: 'docx',
    content: 'Sample content about web dev...',
    fileUrl: '/sample-files/web-dev.docx',
    subject: 'Web Technologies',
    createdAt: '2025-03-20T14:30:00Z',
  },
];

const MOCK_QUIZZES: Quiz[] = [
  {
    id: 1,
    userId: 12345,
    materialId: 1,
    title: 'AI Fundamentals Quiz',
    description: 'Test your knowledge of AI basics',
    difficulty: 'medium',
    totalQuestions: 10,
    questionType: 'multiple-choice',
    createdAt: '2025-03-16T15:00:00Z',
  },
  {
    id: 2,
    userId: 12345,
    materialId: 2,
    title: 'HTML & CSS Quiz',
    description: 'Test your web design knowledge',
    difficulty: 'easy',
    totalQuestions: 8,
    questionType: 'mixed',
    createdAt: '2025-03-21T12:00:00Z',
  },
];

const MOCK_ATTEMPTS: QuizAttempt[] = [
  {
    id: 1,
    userId: 12345,
    quizId: 1,
    score: 80,
    totalTime: 720, // 12 minutes in seconds
    completed: true,
    startedAt: '2025-03-16T16:00:00Z',
    completedAt: '2025-03-16T16:12:00Z',
  },
  {
    id: 2,
    userId: 12345,
    quizId: 2,
    score: 90,
    totalTime: 600, // 10 minutes in seconds
    completed: true,
    startedAt: '2025-03-22T14:00:00Z',
    completedAt: '2025-03-22T14:10:00Z',
  },
];

const MOCK_SUMMARIES: Summary[] = [
  {
    id: 1,
    userId: 12345,
    materialId: 1,
    title: 'AI Concepts Summary',
    content: 'This is a summary of artificial intelligence concepts...',
    pdfUrl: '/sample-files/ai-summary.pdf',
    createdAt: '2025-03-16T11:00:00Z',
  },
  {
    id: 2,
    userId: 12345,
    materialId: 2,
    title: 'Web Development Overview',
    content: 'This summary covers the basics of web development...',
    pdfUrl: '/sample-files/web-summary.pdf',
    createdAt: '2025-03-21T15:00:00Z',
  },
];

const Dashboard: React.FC = () => {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoadingModalOpen, setIsLoadingModalOpen] = useState(false);
  const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);
  const queryClient = useQueryClient();
  const [useDevelopmentData, setUseDevelopmentData] = useState(true);

  // Using mock data for development to bypass API calls
  const materials = useDevelopmentData ? MOCK_MATERIALS : [];
  const quizzes = useDevelopmentData ? MOCK_QUIZZES : [];
  const attempts = useDevelopmentData ? MOCK_ATTEMPTS : [];
  const summaries = useDevelopmentData ? MOCK_SUMMARIES : [];

  // In real mode, fetch data from API (disabled for development)
  if (!useDevelopmentData) {
    // Fetch user's materials - commented out for development
    /*
    const { data: materials = [] } = useQuery<Material[]>({
      queryKey: ['/api/users', user?.id, 'materials'],
      queryFn: async () => {
        if (!user) return [];
        const res = await fetch(`/api/users/${user.id}/materials`);
        const data = await res.json();
        return data;
      },
      enabled: !!user,
    });

    // Fetch user's quiz attempts
    const { data: attempts = [] } = useQuery<QuizAttempt[]>({
      queryKey: ['/api/users', user?.id, 'attempts'],
      queryFn: async () => {
        if (!user) return [];
        const res = await fetch(`/api/users/${user.id}/attempts`);
        const data = await res.json();
        return data;
      },
      enabled: !!user,
    });

    // Fetch quizzes for the attempts
    const { data: quizzes = [] } = useQuery<Quiz[]>({
      queryKey: ['/api/users', user?.id, 'quizzes'],
      queryFn: async () => {
        if (!user) return [];
        const res = await fetch(`/api/users/${user.id}/quizzes`);
        const data = await res.json();
        return data;
      },
      enabled: !!user,
    });

    // Fetch user's summaries
    const { data: summaries = [] } = useQuery<Summary[]>({
      queryKey: ['/api/users', user?.id, 'summaries'],
      queryFn: async () => {
        if (!user) return [];
        const res = await fetch(`/api/users/${user.id}/summaries`);
        const data = await res.json();
        return data;
      },
      enabled: !!user,
    });
    */
  }

  // Combine attempts with quiz data
  const attemptsWithQuizData = attempts.map(attempt => {
    const quiz = quizzes.find(q => q.id === attempt.quizId) || {
      id: attempt.quizId,
      title: 'Unknown Quiz',
      userId: user?.id || 0,
      materialId: 0,
      difficulty: 'medium',
      totalQuestions: 0,
      questionType: 'multiple-choice',
      createdAt: new Date().toISOString(),
    };
    return { ...attempt, quiz };
  });

  // Calculate dashboard stats
  const stats: DashboardStats = {
    totalQuizzes: quizzes.length,
    savedNotes: summaries.length,
    averageScore: calculateAverageScore(attempts),
    studyHours: calculateStudyHours(attempts),
  };

  function calculateAverageScore(attempts: QuizAttempt[]): string {
    const completedAttempts = attempts.filter(a => a.completed && a.score !== null);
    if (completedAttempts.length === 0) return '0%';
    
    const totalScore = completedAttempts.reduce((sum, attempt) => sum + (attempt.score || 0), 0);
    return `${Math.round(totalScore / completedAttempts.length)}%`;
  }

  function calculateStudyHours(attempts: QuizAttempt[]): string {
    const totalTimeInSeconds = attempts.reduce((sum, attempt) => sum + (attempt.totalTime || 0), 0);
    const hours = Math.floor(totalTimeInSeconds / 3600);
    const minutes = Math.floor((totalTimeInSeconds % 3600) / 60);
    
    if (hours === 0 && minutes === 0) return '0h';
    if (hours === 0) return `${minutes}m`;
    if (minutes === 0) return `${hours}h`;
    return `${hours}.${Math.floor(minutes / 6)}h`; // Convert minutes to decimal hours
  }

  const handleUploadStart = () => {
    setIsLoadingModalOpen(true);
  };

  const handleUploadSuccess = () => {
    setIsLoadingModalOpen(false);
    // Invalidate queries to refresh data
    queryClient.invalidateQueries({ queryKey: ['/api/users', user?.id, 'materials'] });
  };

  const handleQuizCreated = () => {
    // Invalidate queries to refresh data
    queryClient.invalidateQueries({ queryKey: ['/api/users', user?.id, 'quizzes'] });
  };

  const handleDownloadSummary = async (summaryId: number) => {
    try {
      window.open(`/api/summaries/${summaryId}/pdf`, '_blank');
    } catch (error) {
      toast({
        title: "Download failed",
        description: "Failed to download the summary PDF",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h2>
        <button 
          className="mt-4 md:mt-0 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          onClick={() => setIsQuizModalOpen(true)}
        >
          <span className="material-icons text-sm mr-2">add</span>
          New Quiz
        </button>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard 
          title="Total Quizzes" 
          value={stats.totalQuizzes} 
          icon="quiz" 
          color="primary" 
        />
        <StatsCard 
          title="Saved Notes" 
          value={stats.savedNotes} 
          icon="summarize" 
          color="indigo" 
        />
        <StatsCard 
          title="Average Score" 
          value={stats.averageScore} 
          icon="trending_up" 
          color="green" 
        />
        <StatsCard 
          title="Study Hours" 
          value={stats.studyHours} 
          icon="schedule" 
          color="purple" 
        />
      </div>
      
      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Quizzes */}
        <RecentQuizList 
          attempts={attemptsWithQuizData.slice(0, 4)} 
          onViewAll={() => setLocation('/quizzes')} 
        />
        
        {/* Right Column - Quick Actions */}
        <div className="space-y-6">
          {/* Upload New Material */}
          <UploadMaterial 
            onUploadStart={handleUploadStart}
            onUploadSuccess={handleUploadSuccess}
          />
          
          {/* Recent Summaries */}
          <RecentSummaryList 
            summaries={summaries.slice(0, 3)} 
            onViewAll={() => setLocation('/summaries')} 
            onDownload={handleDownloadSummary}
          />
        </div>
      </div>

      {/* Loading Modal */}
      <LoadingModal 
        isOpen={isLoadingModalOpen} 
        message="AI is processing your content"
        progress={75}
      />

      {/* Quiz Creation Modal */}
      <QuizCreationModal
        isOpen={isQuizModalOpen}
        onClose={() => setIsQuizModalOpen(false)}
        materials={materials}
        onQuizCreated={handleQuizCreated}
      />
    </div>
  );
};

export default Dashboard;
