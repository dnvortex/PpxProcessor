import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { QuizAttempt, Quiz } from '../types';
import { format, parseISO, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay } from 'date-fns';

const Progress: React.FC = () => {
  const { user } = useAuth();

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

  // Fetch quizzes for the attempts
  const { data: quizzes = [], isLoading: isLoadingQuizzes } = useQuery<Quiz[]>({
    queryKey: ['/api/users', user?.id, 'quizzes'],
    queryFn: async () => {
      if (!user) return [];
      const res = await fetch(`/api/users/${user.id}/quizzes`);
      const data = await res.json();
      return data;
    },
    enabled: !!user,
  });

  const isLoading = isLoadingAttempts || isLoadingQuizzes;

  // Get completed attempts
  const completedAttempts = attempts.filter(attempt => attempt.completed && attempt.score !== null);

  // Calculate average score
  const averageScore = completedAttempts.length > 0
    ? Math.round(completedAttempts.reduce((sum, attempt) => sum + (attempt.score || 0), 0) / completedAttempts.length)
    : 0;

  // Calculate total study time in hours and minutes
  const totalTimeInSeconds = attempts.reduce((sum, attempt) => sum + (attempt.totalTime || 0), 0);
  const hours = Math.floor(totalTimeInSeconds / 3600);
  const minutes = Math.floor((totalTimeInSeconds % 3600) / 60);
  const totalStudyTime = `${hours}h ${minutes}m`;

  // Calculate accuracy by subject
  const subjectAccuracy = quizzes.reduce<Record<string, { totalScore: number, count: number }>>((acc, quiz) => {
    // Find attempts for this quiz
    const quizAttempts = completedAttempts.filter(a => a.quizId === quiz.id);
    if (quizAttempts.length === 0) return acc;

    // Use the quiz title to determine subject
    const subject = quiz.title.split(':')[0].trim();
    if (!acc[subject]) {
      acc[subject] = { totalScore: 0, count: 0 };
    }

    // Add scores from attempts
    quizAttempts.forEach(attempt => {
      if (attempt.score !== null) {
        acc[subject].totalScore += attempt.score;
        acc[subject].count += 1;
      }
    });

    return acc;
  }, {});

  // Convert to chart data
  const subjectChartData = Object.entries(subjectAccuracy).map(([subject, data]) => ({
    subject,
    accuracy: Math.round(data.totalScore / data.count),
  }));

  // Calculate weekly progress
  const now = new Date();
  const weekStart = startOfWeek(now);
  const weekEnd = endOfWeek(now);
  const daysInWeek = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const weeklyProgress = daysInWeek.map(day => {
    const dayAttempts = completedAttempts.filter(attempt => {
      if (!attempt.completedAt) return false;
      return isSameDay(parseISO(attempt.completedAt), day);
    });

    const attemptsCount = dayAttempts.length;
    const averageScoreForDay = attemptsCount > 0
      ? Math.round(dayAttempts.reduce((sum, attempt) => sum + (attempt.score || 0), 0) / attemptsCount)
      : 0;

    return {
      day: format(day, 'EEE'),
      attempts: attemptsCount,
      score: averageScoreForDay,
    };
  });

  // Get suggestions for improvement
  const getSuggestions = () => {
    if (completedAttempts.length === 0) {
      return ["Complete at least one quiz to get personalized suggestions"];
    }

    const suggestions = [];
    
    // Find lowest performing subject
    if (Object.keys(subjectAccuracy).length > 0) {
      const lowestSubject = Object.entries(subjectAccuracy).reduce((lowest, current) => {
        const currentAvg = current[1].totalScore / current[1].count;
        const lowestAvg = lowest[1].totalScore / lowest[1].count;
        return currentAvg < lowestAvg ? current : lowest;
      });
      
      suggestions.push(`Focus more on ${lowestSubject[0]}, your average score is ${Math.round(lowestSubject[1].totalScore / lowestSubject[1].count)}%`);
    }

    // Suggest consistency
    const daysWithActivity = new Set(completedAttempts.map(attempt => {
      if (!attempt.completedAt) return '';
      return format(parseISO(attempt.completedAt), 'yyyy-MM-dd');
    })).size;
    
    if (daysWithActivity < 3 && completedAttempts.length > 0) {
      suggestions.push("Try to study more consistently throughout the week");
    }

    // Suggest more practice if scores are low
    if (averageScore < 70 && completedAttempts.length > 0) {
      suggestions.push("Review your incorrect answers to improve your understanding");
    }

    return suggestions;
  };

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Progress Tracking</h2>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : completedAttempts.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 text-center">
          <span className="material-icons text-gray-400 text-4xl mb-2">bar_chart</span>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">No progress data yet</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Complete quizzes to start tracking your progress.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-primary-100 dark:bg-primary-900 mr-4">
                  <span className="material-icons text-primary-600 dark:text-primary-400">quiz</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Completed Quizzes</p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">{completedAttempts.length}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-green-100 dark:bg-green-900 mr-4">
                  <span className="material-icons text-green-600 dark:text-green-400">trending_up</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Average Score</p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">{averageScore}%</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900 mr-4">
                  <span className="material-icons text-purple-600 dark:text-purple-400">schedule</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Study Time</p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">{totalStudyTime}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Weekly Progress */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Weekly Progress</h3>
            </div>
            <div className="p-6">
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={weeklyProgress}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                    <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                    <Tooltip />
                    <Bar yAxisId="left" dataKey="attempts" name="Attempts" fill="#8884d8" />
                    <Bar yAxisId="right" dataKey="score" name="Avg. Score (%)" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Accuracy by Subject */}
          {subjectChartData.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
              <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Accuracy by Subject</h3>
              </div>
              <div className="p-6">
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={subjectChartData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      layout="vertical"
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" domain={[0, 100]} />
                      <YAxis type="category" dataKey="subject" width={150} />
                      <Tooltip />
                      <Bar dataKey="accuracy" name="Accuracy (%)" fill="#4f46e5" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* Suggestions for Improvement */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Suggestions for Improvement</h3>
            </div>
            <div className="p-6">
              <ul className="space-y-3">
                {getSuggestions().map((suggestion, index) => (
                  <li key={index} className="flex items-start">
                    <span className="material-icons text-primary-600 dark:text-primary-400 mr-2 mt-0.5">lightbulb</span>
                    <span className="text-gray-700 dark:text-gray-300">{suggestion}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Recent Activity</h3>
            </div>
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {completedAttempts.slice(0,.5).map((attempt) => {
                const quiz = quizzes.find(q => q.id === attempt.quizId);
                if (!quiz || !attempt.completedAt) return null;
                
                return (
                  <div key={attempt.id} className="px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                        <span className="material-icons text-blue-600 dark:text-blue-300">school</span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{quiz.title}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {format(parseISO(attempt.completedAt), 'MMM d, yyyy')}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <div className="text-sm font-medium text-gray-900 dark:text-white mr-4">{attempt.score}%</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Progress;
