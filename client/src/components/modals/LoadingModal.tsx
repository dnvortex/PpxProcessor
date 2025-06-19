import React from 'react';

interface LoadingModalProps {
  isOpen: boolean;
  message?: string;
  progress?: number;
}

const LoadingModal: React.FC<LoadingModalProps> = ({ 
  isOpen, 
  message = 'AI is processing your content', 
  progress = 75 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed z-10 inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 dark:bg-gray-900 dark:bg-opacity-75 transition-opacity" aria-hidden="true"></div>
        
        <div className="inline-block align-middle bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full p-6">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <svg className="animate-spin h-10 w-10 text-primary-600 dark:text-primary-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
              {message}
            </h3>
            <div className="mt-2">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                This may take a minute or two depending on the size of your content.
              </p>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mt-6">
              <div 
                className="bg-primary-600 dark:bg-primary-500 h-2.5 rounded-full" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Analyzing content: {progress}% complete
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingModal;
