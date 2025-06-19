import React from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '../../contexts/AuthContext';
import { logout } from '../../lib/auth';
import ThemeToggle from '../shared/ThemeToggle';
import { useToast } from '@/hooks/use-toast';

interface SidebarProps {
  className?: string;
  mobileView?: boolean;
  onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ className = '', mobileView = false, onClose }) => {
  const [location] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your account",
      });
    } catch (error) {
      toast({
        title: "Logout failed",
        description: "There was an error logging out",
        variant: "destructive",
      });
    }
  };

  const isActive = (path: string) => location === path;
  
  // Handle navigation with optional mobile view closing
  const handleNavClick = () => {
    if (mobileView && onClose) {
      onClose();
    }
  };

  return (
    <aside className={`${className} flex-col w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700`}>
      <div className="flex items-center justify-center h-16 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center">
          <span className="material-icons text-primary text-2xl mr-2">psychology</span>
          <h1 className="font-semibold text-xl">VORTEX AI Study Mate</h1>
        </div>
      </div>
      
      <nav className="flex-1 px-2 py-4 space-y-2 overflow-y-auto">
        <div className="w-full">
          <Link href="/dashboard">
            <div 
              className={`flex items-center px-4 py-2.5 text-sm font-medium rounded-lg cursor-pointer ${
                isActive('/dashboard') 
                  ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400' 
                  : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
              onClick={handleNavClick}
            >
              <span className="material-icons mr-3">dashboard</span>
              Dashboard
            </div>
          </Link>
        </div>
        
        <div className="w-full">
          <Link href="/materials">
            <div 
              className={`flex items-center px-4 py-2.5 text-sm font-medium rounded-lg cursor-pointer ${
                isActive('/materials') 
                  ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400' 
                  : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
              onClick={handleNavClick}
            >
              <span className="material-icons mr-3">file_upload</span>
              Upload Materials
            </div>
          </Link>
        </div>
        
        <div className="w-full">
          <Link href="/quizzes">
            <div 
              className={`flex items-center px-4 py-2.5 text-sm font-medium rounded-lg cursor-pointer ${
                isActive('/quizzes') 
                  ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400' 
                  : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
              onClick={handleNavClick}
            >
              <span className="material-icons mr-3">quiz</span>
              Quizzes
            </div>
          </Link>
        </div>
        
        <div className="w-full">
          <Link href="/summaries">
            <div 
              className={`flex items-center px-4 py-2.5 text-sm font-medium rounded-lg cursor-pointer ${
                isActive('/summaries') 
                  ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400' 
                  : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
              onClick={handleNavClick}
            >
              <span className="material-icons mr-3">summarize</span>
              Notes & Summaries
            </div>
          </Link>
        </div>
        
        <div className="w-full">
          <Link href="/progress">
            <div 
              className={`flex items-center px-4 py-2.5 text-sm font-medium rounded-lg cursor-pointer ${
                isActive('/progress') 
                  ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400' 
                  : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
              onClick={handleNavClick}
            >
              <span className="material-icons mr-3">bar_chart</span>
              Progress Tracking
            </div>
          </Link>
        </div>
        
        <div className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
          <h3 className="px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Settings
          </h3>
          
          <div className="w-full mt-2">
            <Link href="/profile">
              <div 
                className={`flex items-center px-4 py-2.5 text-sm font-medium rounded-lg cursor-pointer ${
                  isActive('/profile') 
                    ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400' 
                    : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
                onClick={handleNavClick}
              >
                <span className="material-icons mr-3">account_circle</span>
                Profile
              </div>
            </Link>
          </div>
          
          {user?.isAdmin && (
            <div className="w-full mt-1">
              <Link href="/admin">
                <div 
                  className={`flex items-center px-4 py-2.5 text-sm font-medium rounded-lg cursor-pointer ${
                    isActive('/admin') 
                      ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400' 
                      : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                  onClick={handleNavClick}
                >
                  <span className="material-icons mr-3">admin_panel_settings</span>
                  Admin
                </div>
              </Link>
            </div>
          )}
          
          <ThemeToggle className="w-full flex items-center px-4 py-2.5 text-sm font-medium rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700" />
        </div>
      </nav>
      
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center">
          <div className="h-8 w-8 rounded-full bg-primary-100 dark:bg-primary-800 flex items-center justify-center">
            {user?.photoURL ? (
              <img src={user.photoURL} alt={user.displayName || ''} className="h-8 w-8 rounded-full" />
            ) : (
              <span className="text-primary-600 dark:text-primary-400 font-semibold">
                {user?.displayName?.charAt(0) || user?.email?.charAt(0) || 'U'}
              </span>
            )}
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium">{user?.displayName || user?.username}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email}</p>
          </div>
        </div>
        <button 
          onClick={handleLogout}
          className="mt-4 w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
        >
          <span className="material-icons text-sm mr-2">logout</span>
          Sign Out
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
