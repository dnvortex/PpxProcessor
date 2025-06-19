import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { generateQuiz } from '../../openai';
import { Material, QuizFormData } from '../../types';
import { useToast } from '@/hooks/use-toast';

interface QuizCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  materials: Material[];
  onQuizCreated: () => void;
}

const QuizCreationModal: React.FC<QuizCreationModalProps> = ({
  isOpen,
  onClose,
  materials,
  onQuizCreated,
}) => {
  const [materialId, setMaterialId] = useState<number>(materials[0]?.id || 0);
  const [questionType, setQuestionType] = useState<string>('multiple-choice');
  const [difficulty, setDifficulty] = useState<string>('medium');
  const [totalQuestions, setTotalQuestions] = useState<number>(10);
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const { user } = useAuth();
  const { toast } = useToast();

  if (!isOpen) return null;

  const handleCreateQuiz = async () => {
    if (!materialId || !user) {
      toast({
        title: "Invalid data",
        description: "Please select a material and ensure you're logged in",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsCreating(true);
      const selectedMaterial = materials.find(m => m.id === materialId);
      
      const quizData: QuizFormData = {
        materialId,
        title: `Quiz: ${selectedMaterial?.title || 'Study Material'}`,
        difficulty: difficulty as 'easy' | 'medium' | 'hard' | 'mixed',
        totalQuestions: Number(totalQuestions),
        questionType: questionType as 'multiple-choice' | 'true-false' | 'fill-blank' | 'short-answer' | 'mixed',
      };

      await generateQuiz(materialId, quizData);
      
      toast({
        title: "Quiz created",
        description: "Your quiz has been successfully created",
      });

      onQuizCreated();
      onClose();
    } catch (error) {
      toast({
        title: "Error creating quiz",
        description: error.message || "There was an error creating your quiz",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="fixed z-10 inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 dark:bg-gray-900 dark:bg-opacity-75 transition-opacity" 
          aria-hidden="true"
          onClick={onClose}
        ></div>
        
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        
        <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-primary-100 dark:bg-primary-900 sm:mx-0 sm:h-10 sm:w-10">
                <span className="material-icons text-primary-600 dark:text-primary-400">quiz</span>
              </div>
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white" id="modal-title">
                  Create New Quiz
                </h3>
                <div className="mt-4 space-y-4">
                  <div>
                    <label htmlFor="quiz-material" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      From Material
                    </label>
                    <select 
                      id="quiz-material" 
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-700 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                      value={materialId}
                      onChange={(e) => setMaterialId(Number(e.target.value))}
                      disabled={isCreating}
                    >
                      {materials.length === 0 ? (
                        <option value="">No materials available</option>
                      ) : (
                        materials.map((material) => (
                          <option key={material.id} value={material.id}>
                            {material.title}
                          </option>
                        ))
                      )}
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="quiz-type" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Question Type
                    </label>
                    <select 
                      id="quiz-type" 
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-700 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                      value={questionType}
                      onChange={(e) => setQuestionType(e.target.value)}
                      disabled={isCreating}
                    >
                      <option value="multiple-choice">Multiple Choice</option>
                      <option value="true-false">True/False</option>
                      <option value="fill-blank">Fill in the Blanks</option>
                      <option value="short-answer">Short Answer</option>
                      <option value="mixed">Mixed</option>
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="quiz-difficulty" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Difficulty Level
                    </label>
                    <select 
                      id="quiz-difficulty" 
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-700 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                      value={difficulty}
                      onChange={(e) => setDifficulty(e.target.value)}
                      disabled={isCreating}
                    >
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                      <option value="mixed">Mixed</option>
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="quiz-questions" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Number of Questions
                    </label>
                    <input 
                      type="number" 
                      id="quiz-questions" 
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-700 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                      value={totalQuestions}
                      onChange={(e) => setTotalQuestions(Number(e.target.value))}
                      min={1}
                      max={20}
                      disabled={isCreating}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button 
              type="button" 
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleCreateQuiz}
              disabled={isCreating || !materialId}
            >
              {isCreating ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating...
                </>
              ) : "Generate Quiz"}
            </button>
            <button 
              type="button" 
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-800 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={onClose}
              disabled={isCreating}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizCreationModal;
