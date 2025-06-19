import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { useLocation } from 'wouter';
import { Quiz, QuizAttempt, Material } from '../types';
import QuizCreationModal from '../components/modals/QuizCreationModal';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

const Quizzes: React.FC = () => {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);

  // Fetch user's quizzes
  const { data: quizzes = [], isLoading: isLoadingQuizzes, refetch: refetchQuizzes } = useQuery<Quiz[]>({
    queryKey: ['/api/users', user?.id, 'quizzes'],
    queryFn: async () => {
      if (!user) return [];
      const res = await fetch(`/api/users/${user.id}/quizzes`);
      const data = await res.json();
      return data;
    },
    enabled: !!user,
  });

  // Fetch user's quiz attempts
  const { data: attempts = [], isLoading: isLoadingAttempts } = useQuery<QuizAttempt[]>({
    queryKey: ['/api/users', user?.id, 'attempts'],
    queryFn: async () => {
      if (!user) return [];
      const res = await fetch(`/api/users/${user.id}/attempts`);
      const data = await res.json();
      return data;
    },
    enabled: !!user,
  });

  // Fetch user's materials for quiz creation
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

  const isLoading = isLoadingQuizzes || isLoadingAttempts;

  const handleStartQuiz = async (quizId: number) => {
    try {
      // Check if there's an incomplete attempt for this quiz
      const existingAttempt = attempts.find(a => a.quizId === quizId && !a.completed);
      
      if (existingAttempt) {
        // Continue the existing attempt
        setLocation(`/quiz/${quizId}?attemptId=${existingAttempt.id}`);
        return;
      }
      
      // Create a new attempt
      const response = await fetch(`/api/quizzes/${quizId}/attempts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user?.id,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to start quiz');
      }
      
      const newAttempt = await response.json();
      setLocation(`/quiz/${quizId}?attemptId=${newAttempt.id}`);
    } catch (error) {
      toast({
        title: "Failed to start quiz",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch (error) {
      return 'Unknown date';
    }
  };

  const handleQuizCreated = () => {
    refetchQuizzes();
  };

  // Group attempts by quiz
  const attemptsByQuiz = attempts.reduce<Record<number, QuizAttempt[]>>((acc, attempt) => {
    if (!acc[attempt.quizId]) {
      acc[attempt.quizId] = [];
    }
    acc[attempt.quizId].push(attempt);
    return acc;
  }, {});

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Quizzes</h2>
        <button
          onClick={() => setIsQuizModalOpen(true)}
          disabled={materials.length === 0}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="material-icons text-sm mr-2">add</span>
          Create Quiz
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : quizzes.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 text-center">
          <span className="material-icons text-gray-400 text-4xl mb-2">quiz</span>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">No quizzes created yet</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            {materials.length === 0 
              ? "Upload study materials first to create quizzes."
              : "Create a quiz from your uploaded study materials."}
          </p>
          {materials.length === 0 ? (
            <button
              onClick={() => setLocation('/materials')}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <span className="material-icons text-sm mr-2">upload_file</span>
              Upload Materials
            </button>
          ) : (
            <button
              onClick={() => setIsQuizModalOpen(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <span className="material-icons text-sm mr-2">add</span>
              Create Quiz
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {quizzes.map((quiz) => {
            const quizAttempts = attemptsByQuiz[quiz.id] || [];
            const completedAttempts = quizAttempts.filter(a => a.completed);
            const bestScore = completedAttempts.length > 0 
              ? Math.max(...completedAttempts.map(a => a.score || 0)) 
              : null;
            const latestAttempt = quizAttempts.length > 0 
              ? quizAttempts.reduce((latest, current) => 
                  new Date(current.startedAt) > new Date(latest.startedAt) ? current : latest
                ) 
              : null;
            
            return (
              <div key={quiz.id} className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">{quiz.title}</h3>
                      <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
                        Created on {formatDate(quiz.createdAt)}
                      </p>
                    </div>
                    {bestScore !== null && (
                      <div className="flex items-center bg-green-100 dark:bg-green-900/30 px-3 py-1 rounded-full">
                        <span className="material-icons text-green-600 dark:text-green-500 text-sm mr-1">emoji_events</span>
                        <span className="text-sm font-medium text-green-800 dark:text-green-500">Best: {bestScore}%</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="px-6 py-4">
                  <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Difficulty</dt>
                      <dd className="mt-1 text-sm text-gray-900 dark:text-white capitalize">{quiz.difficulty}</dd>
                    </div>
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Question Type</dt>
                      <dd className="mt-1 text-sm text-gray-900 dark:text-white capitalize">
                        {quiz.questionType.replace(/-/g, ' ')}
                      </dd>
                    </div>
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Questions</dt>
                      <dd className="mt-1 text-sm text-gray-900 dark:text-white">{quiz.totalQuestions}</dd>
                    </div>
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Attempts</dt>
                      <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                        {completedAttempts.length} completed
                        {quizAttempts.length > completedAttempts.length && (
                          <span className="ml-1 text-primary-600 dark:text-primary-500">
                            ({quizAttempts.length - completedAttempts.length} in progress)
                          </span>
                        )}
                      </dd>
                    </div>
                  </dl>
                </div>
                
                <div className="px-6 py-3 bg-gray-50 dark:bg-gray-700 flex justify-between items-center">
                  <div>
                    {latestAttempt && !latestAttempt.completed && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
                        <span className="material-icons text-xs mr-1">schedule</span>
                        In Progress
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => handleStartQuiz(quiz.id)}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    <span className="material-icons text-sm mr-2">
                      {latestAttempt && !latestAttempt.completed ? 'play_arrow' : 'quiz'}
                    </span>
                    {latestAttempt && !latestAttempt.completed ? 'Continue Quiz' : 'Start Quiz'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

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

export default Quizzes;
