import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import ThemeToggle from '../shared/ThemeToggle';

interface TopNavbarProps {
  onMenuClick: () => void;
}

const TopNavbar: React.FC<TopNavbarProps> = ({ onMenuClick }) => {
  const { user } = useAuth();

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between h-16 px-4">
        {/* Mobile menu button */}
        <button 
          type="button" 
          className="md:hidden text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 focus:outline-none"
          onClick={onMenuClick}
        >
          <span className="material-icons">menu</span>
        </button>
        
        {/* Logo for mobile */}
        <div className="flex items-center md:hidden">
          <span className="material-icons text-primary-600 dark:text-primary-500 mr-2">psychology</span>
          <h1 className="font-semibold text-xl">VORTEX</h1>
        </div>
        
        {/* Search bar - hidden on small screens */}
        <div className="hidden md:flex items-center flex-1 mx-4">
          <div className="relative w-full max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="material-icons text-gray-400 text-sm">search</span>
            </div>
            <input 
              type="text" 
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm" 
              placeholder="Search quizzes, notes or subjects..." 
            />
          </div>
        </div>
        
        {/* Right side buttons */}
        <div className="flex items-center space-x-4">
          <button type="button" className="p-1 rounded-full text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 focus:outline-none">
            <span className="material-icons">notifications</span>
          </button>
          
          {/* Theme toggle on mobile only */}
          <ThemeToggle className="p-1 rounded-full text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 focus:outline-none md:hidden" iconOnly />
          
          {/* Profile dropdown (mobile only) */}
          <div className="md:hidden">
            <button type="button" className="flex items-center">
              {user?.photoURL ? (
                <img src={user.photoURL} alt={user.displayName} className="h-8 w-8 rounded-full" />
              ) : (
                <div className="h-8 w-8 rounded-full bg-primary-100 dark:bg-primary-800 flex items-center justify-center">
                  <span className="text-primary-600 dark:text-primary-400 font-semibold">
                    {user?.displayName?.charAt(0) || user?.email?.charAt(0) || 'U'}
                  </span>
                </div>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopNavbar;
