import React from 'react';
import { Link } from 'wouter';
import { QuizAttempt, Quiz } from '../../types';
import { format } from 'date-fns';

interface EnhancedQuizAttempt extends QuizAttempt {
  quiz: Quiz;
}

interface RecentQuizListProps {
  attempts: EnhancedQuizAttempt[];
  onViewAll: () => void;
}

const RecentQuizList: React.FC<RecentQuizListProps> = ({ attempts, onViewAll }) => {
  const formatDate = (dateString: string) => {
    try {
      return `Completed on ${format(new Date(dateString), 'MMM d')}`;
    } catch (error) {
      return 'Date unknown';
    }
  };

  const getIconForQuiz = (quiz: Quiz) => {
    const subjectIcons: Record<string, { icon: string, color: string }> = {
      'math': { icon: 'functions', color: 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300' },
      'biology': { icon: 'biotech', color: 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300' },
      'psychology': { icon: 'psychology', color: 'bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300' },
      'history': { icon: 'history_edu', color: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-600 dark:text-yellow-300' },
      'default': { icon: 'school', color: 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300' },
    };

    // Attempt to match the quiz title with a subject
    const lowerTitle = quiz.title.toLowerCase();
    for (const [subject, data] of Object.entries(subjectIcons)) {
      if (lowerTitle.includes(subject)) {
        return data;
      }
    }

    return subjectIcons.default;
  };

  return (
    <div className="lg:col-span-2 bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Recent Quizzes</h3>
          <button 
            onClick={onViewAll}
            className="text-sm font-medium text-primary-600 dark:text-primary-500 hover:text-primary-700 dark:hover:text-primary-400"
          >
            View all
          </button>
        </div>
      </div>
      
      {attempts.length === 0 ? (
        <div className="px-6 py-8 text-center">
          <span className="material-icons text-gray-400 text-4xl mb-2">quiz</span>
          <p className="text-gray-500 dark:text-gray-400">No quiz attempts yet</p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Upload study materials and create your first quiz.</p>
        </div>
      ) : (
        <ul role="list" className="divide-y divide-gray-200 dark:divide-gray-700">
          {attempts.map((attempt) => {
            const { icon, color } = getIconForQuiz(attempt.quiz);
            return (
              <li key={attempt.id} className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer">
                <Link href={`/quiz/${attempt.quizId}`}>
                  <a className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`flex-shrink-0 h-10 w-10 rounded-full ${color} flex items-center justify-center`}>
                        <span className="material-icons">{icon}</span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{attempt.quiz.title}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {attempt.completedAt ? formatDate(attempt.completedAt) : 'In progress'}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      {attempt.score !== null ? (
                        <div className="text-sm font-medium text-gray-900 dark:text-white mr-4">{attempt.score}%</div>
                      ) : (
                        <div className="text-sm font-medium text-gray-500 mr-4">--</div>
                      )}
                      <span className="material-icons text-gray-400">chevron_right</span>
                    </div>
                  </a>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default RecentQuizList;
