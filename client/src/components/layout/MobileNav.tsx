import React from 'react';
import { Link, useLocation } from 'wouter';

const MobileNav: React.FC = () => {
  const [location] = useLocation();

  const isActive = (path: string) => location === path;

  return (
    <nav className="md:hidden bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 fixed bottom-0 w-full">
      <div className="grid grid-cols-5 h-16">
        <div className="w-full h-full">
          <Link href="/dashboard">
            <div className={`flex flex-col items-center justify-center h-full w-full cursor-pointer ${
              isActive('/dashboard') 
                ? 'text-primary-600 dark:text-primary-500' 
                : 'text-gray-500 dark:text-gray-400'
            }`}>
              <span className="material-icons">dashboard</span>
              <span className="text-xs mt-1">Dashboard</span>
            </div>
          </Link>
        </div>
        
        <div className="w-full h-full">
          <Link href="/materials">
            <div className={`flex flex-col items-center justify-center h-full w-full cursor-pointer ${
              isActive('/materials') 
                ? 'text-primary-600 dark:text-primary-500' 
                : 'text-gray-500 dark:text-gray-400'
            }`}>
              <span className="material-icons">file_upload</span>
              <span className="text-xs mt-1">Upload</span>
            </div>
          </Link>
        </div>
        
        <div className="w-full h-full">
          <Link href="/quizzes">
            <div className={`flex flex-col items-center justify-center h-full w-full cursor-pointer ${
              isActive('/quizzes') 
                ? 'text-primary-600 dark:text-primary-500' 
                : 'text-gray-500 dark:text-gray-400'
            }`}>
              <span className="material-icons">quiz</span>
              <span className="text-xs mt-1">Quizzes</span>
            </div>
          </Link>
        </div>
        
        <div className="w-full h-full">
          <Link href="/summaries">
            <div className={`flex flex-col items-center justify-center h-full w-full cursor-pointer ${
              isActive('/summaries') 
                ? 'text-primary-600 dark:text-primary-500' 
                : 'text-gray-500 dark:text-gray-400'
            }`}>
              <span className="material-icons">summarize</span>
              <span className="text-xs mt-1">Notes</span>
            </div>
          </Link>
        </div>
        
        <div className="w-full h-full">
          <Link href="/progress">
            <div className={`flex flex-col items-center justify-center h-full w-full cursor-pointer ${
              isActive('/progress') 
                ? 'text-primary-600 dark:text-primary-500' 
                : 'text-gray-500 dark:text-gray-400'
            }`}>
              <span className="material-icons">bar_chart</span>
              <span className="text-xs mt-1">Progress</span>
            </div>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default MobileNav;
