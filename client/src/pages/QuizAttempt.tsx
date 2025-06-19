import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { useLocation } from 'wouter';
import { Question, Quiz, QuizAttempt as QuizAttemptType } from '../types';
import { submitQuizAnswers } from '../openai';
import { useToast } from '@/hooks/use-toast';

interface QuizAttemptProps {
  id: string;
}

interface QuizResults {
  attempt: QuizAttemptType;
  score: number;
  totalAnswered: number;
  totalCorrect: number;
}

const QuizAttempt: React.FC<QuizAttemptProps> = ({ id }) => {
  const quizId = parseInt(id);
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<{ [questionId: number]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timer, setTimer] = useState(0);
  const [startTime] = useState(Date.now());
  const [results, setResults] = useState<QuizResults | null>(null);
  
  // Parse the attempt ID from the URL query params
  const queryParams = new URLSearchParams(window.location.search);
  const attemptId = parseInt(queryParams.get('attemptId') || '0');

  // Fetch quiz data
  const { data: quiz, isLoading: isLoadingQuiz } = useQuery<Quiz>({
    queryKey: ['/api/quizzes', quizId],
    queryFn: async () => {
      const res = await fetch(`/api/quizzes/${quizId}`);
      const data = await res.json();
      return data;
    },
    enabled: !!quizId && !isNaN(quizId),
  });

  // Fetch quiz questions
  const { data: questions = [], isLoading: isLoadingQuestions } = useQuery<Question[]>({
    queryKey: ['/api/quizzes', quizId, 'questions'],
    queryFn: async () => {
      const res = await fetch(`/api/quizzes/${quizId}/questions`);
      const data = await res.json();
      return data;
    },
    enabled: !!quizId && !isNaN(quizId),
  });

  // Timer update
  useEffect(() => {
    if (results) return; // Stop timer when results are shown
    
    const intervalId = setInterval(() => {
      setTimer(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    
    return () => clearInterval(intervalId);
  }, [startTime, results]);

  // Format timer as minutes:seconds
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleAnswerChange = (questionId: number, answer: string) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleJumpToQuestion = (index: number) => {
    setCurrentQuestionIndex(index);
  };

  const handleSubmitQuiz = async () => {
    // Check if all questions are answered
    const answeredCount = Object.keys(userAnswers).length;
    if (answeredCount < questions.length) {
      const confirmation = window.confirm(`You've only answered ${answeredCount} out of ${questions.length} questions. Are you sure you want to submit?`);
      if (!confirmation) return;
    }

    try {
      setIsSubmitting(true);
      
      // Format answers for submission
      const formattedAnswers = questions.map(question => ({
        questionId: question.id,
        answer: userAnswers[question.id] || ''
      }));
      
      const quizResults = await submitQuizAnswers(attemptId, formattedAnswers, timer);
      setResults(quizResults);
    } catch (error) {
      toast({
        title: "Failed to submit quiz",
        description: error.message || "There was an error submitting your quiz",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLoading = isLoadingQuiz || isLoadingQuestions;

  if (isLoading) {
    return (
      <div className="py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center items-center h-64">
          <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (!quiz || questions.length === 0) {
    return (
      <div className="py-6 px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 text-center">
          <span className="material-icons text-red-500 text-4xl mb-2">error</span>
          <h2 className="text-xl font-medium text-gray-900 dark:text-white mb-2">Quiz not found</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            The quiz you're looking for doesn't exist or has no questions.
          </p>
          <button
            onClick={() => setLocation('/quizzes')}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <span className="material-icons text-sm mr-2">arrow_back</span>
            Back to Quizzes
          </button>
        </div>
      </div>
    );
  }

  // Get current question
  const currentQuestion = questions[currentQuestionIndex];

  // Show results if completed
  if (results) {
    return (
      <div className="py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-medium text-gray-900 dark:text-white">Quiz Results</h2>
            </div>
            
            <div className="px-6 py-4">
              <div className="mb-6 text-center">
                <div className="inline-flex items-center justify-center h-24 w-24 rounded-full bg-primary-100 dark:bg-primary-900 mb-4">
                  <span className="text-3xl font-bold text-primary-600 dark:text-primary-400">{results.score}%</span>
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  {results.score >= 80 ? 'Excellent work!' : 
                   results.score >= 60 ? 'Good job!' : 
                   results.score >= 40 ? 'Nice try!' : 'Keep practicing!'}
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mt-1">
                  You got {results.totalCorrect} out of {results.totalAnswered} questions correct.
                </p>
              </div>
              
              <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2 mb-6">
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Time Spent</dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-white">{formatTime(timer)}</dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Quiz</dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-white">{quiz.title}</dd>
                </div>
              </dl>
              
              <div className="flex justify-center mt-6">
                <button
                  onClick={() => setLocation('/quizzes')}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 mr-4"
                >
                  <span className="material-icons text-sm mr-2">arrow_back</span>
                  Back to Quizzes
                </button>
                <button
                  onClick={() => setLocation(`/quiz/${quizId}/results?attemptId=${attemptId}`)}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  <span className="material-icons text-sm mr-2">assessment</span>
                  View Detailed Results
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
          {/* Quiz header */}
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <div>
              <h2 className="text-xl font-medium text-gray-900 dark:text-white">{quiz.title}</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Question {currentQuestionIndex + 1} of {questions.length}
              </p>
            </div>
            <div className="flex items-center bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
              <span className="material-icons text-gray-500 dark:text-gray-400 text-sm mr-1">timer</span>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{formatTime(timer)}</span>
            </div>
          </div>
          
          {/* Question */}
          <div className="px-6 py-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              {currentQuestion.questionText}
            </h3>
            
            {/* Multiple choice */}
            {currentQuestion.questionType === 'multiple-choice' && currentQuestion.options && (
              <div className="space-y-3">
                {currentQuestion.options.map((option: string, index: number) => (
                  <div key={index} className="flex items-center">
                    <input
                      id={`option-${index}`}
                      name={`question-${currentQuestion.id}`}
                      type="radio"
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 dark:border-gray-700"
                      checked={userAnswers[currentQuestion.id] === option}
                      onChange={() => handleAnswerChange(currentQuestion.id, option)}
                    />
                    <label htmlFor={`option-${index}`} className="ml-3 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      {option}
                    </label>
                  </div>
                ))}
              </div>
            )}
            
            {/* True/False */}
            {currentQuestion.questionType === 'true-false' && (
              <div className="space-y-3">
                <div className="flex items-center">
                  <input
                    id="option-true"
                    name={`question-${currentQuestion.id}`}
                    type="radio"
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 dark:border-gray-700"
                    checked={userAnswers[currentQuestion.id] === 'true'}
                    onChange={() => handleAnswerChange(currentQuestion.id, 'true')}
                  />
                  <label htmlFor="option-true" className="ml-3 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    True
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    id="option-false"
                    name={`question-${currentQuestion.id}`}
                    type="radio"
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 dark:border-gray-700"
                    checked={userAnswers[currentQuestion.id] === 'false'}
                    onChange={() => handleAnswerChange(currentQuestion.id, 'false')}
                  />
                  <label htmlFor="option-false" className="ml-3 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    False
                  </label>
                </div>
              </div>
            )}
            
            {/* Fill in the blank */}
            {currentQuestion.questionType === 'fill-blank' && (
              <div>
                <input
                  type="text"
                  className="mt-1 block w-full sm:max-w-md border-gray-300 dark:border-gray-700 dark:bg-gray-700 dark:text-white rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Enter your answer"
                  value={userAnswers[currentQuestion.id] || ''}
                  onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                />
              </div>
            )}
            
            {/* Short answer */}
            {currentQuestion.questionType === 'short-answer' && (
              <div>
                <textarea
                  rows={4}
                  className="mt-1 block w-full border-gray-300 dark:border-gray-700 dark:bg-gray-700 dark:text-white rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Enter your answer"
                  value={userAnswers[currentQuestion.id] || ''}
                  onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                ></textarea>
              </div>
            )}
          </div>
          
          {/* Question navigation */}
          <div className="flex flex-wrap justify-center gap-2 px-6 py-4 border-t border-b border-gray-200 dark:border-gray-700">
            {questions.map((_, index) => (
              <button
                key={index}
                className={`flex items-center justify-center h-8 w-8 rounded-full text-sm font-medium ${
                  index === currentQuestionIndex 
                    ? 'bg-primary-600 text-white' 
                    : userAnswers[questions[index].id]
                    ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                }`}
                onClick={() => handleJumpToQuestion(index)}
              >
                {index + 1}
              </button>
            ))}
          </div>
          
          {/* Question controls */}
          <div className="flex justify-between items-center px-6 py-4">
            <button
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
              className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="material-icons text-sm mr-2">arrow_back</span>
              Previous
            </button>
            
            <div className="flex space-x-2">
              {currentQuestionIndex === questions.length - 1 ? (
                <button
                  onClick={handleSubmitQuiz}
                  disabled={isSubmitting}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <span className="material-icons text-sm mr-2">check_circle</span>
                      Submit Quiz
                    </>
                  )}
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Next
                  <span className="material-icons text-sm ml-2">arrow_forward</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizAttempt;
