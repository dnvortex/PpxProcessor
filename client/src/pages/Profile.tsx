import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { logout } from '../lib/auth';
import { useTheme } from '../contexts/ThemeContext';
import { useQuery } from '@tanstack/react-query';
import { QuizAttempt, Summary } from '../types';

const Profile: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { theme, toggleTheme } = useTheme();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Fetch quiz attempts for stats
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

  // Fetch summaries for stats
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

  // Set initial form values
  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || '');
      setEmail(user.email || '');
    }
  }, [user]);

  const handleEditToggle = () => {
    if (isEditing) {
      // Reset form when canceling edit
      setDisplayName(user?.displayName || '');
      setEmail(user?.email || '');
    }
    setIsEditing(!isEditing);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!displayName.trim()) {
      toast({
        title: "Validation error",
        description: "Display name cannot be empty",
        variant: "destructive",
      });
      return;
    }
    
    // In a real implementation, this would update the user profile
    // Since we're using mock storage, we'll just show a success toast
    setIsSaving(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated",
      });
      
      setIsEditing(false);
    } catch (error) {
      toast({
        title: "Update failed",
        description: "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    
    try {
      await logout();
      toast({
        title: "Logged out",
        description: "You have been successfully logged out",
      });
    } catch (error) {
      toast({
        title: "Logout failed",
        description: "Failed to log out",
        variant: "destructive",
      });
      setIsLoggingOut(false);
    }
  };

  // Calculate stats
  const completedQuizzes = attempts.filter(a => a.completed).length;
  const totalStudyTimeInSeconds = attempts.reduce((sum, a) => sum + (a.totalTime || 0), 0);
  const hours = Math.floor(totalStudyTimeInSeconds / 3600);
  const minutes = Math.floor((totalStudyTimeInSeconds % 3600) / 60);
  const totalStudyTime = `${hours}h ${minutes}m`;
  const notesGenerated = summaries.length;
  
  // Calculate average score
  const completedAttempts = attempts.filter(a => a.completed && a.score !== null);
  const averageScore = completedAttempts.length > 0
    ? Math.round(completedAttempts.reduce((sum, a) => sum + (a.score || 0), 0) / completedAttempts.length)
    : 0;

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Profile</h2>
      
      <div className="md:grid md:grid-cols-3 md:gap-6">
        {/* Profile section */}
        <div className="md:col-span-1">
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">Personal Information</h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
                Manage your account details
              </p>
            </div>
            
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center justify-center mb-6">
                {user?.photoURL ? (
                  <img 
                    src={user.photoURL} 
                    alt={user.displayName || 'Profile'} 
                    className="h-24 w-24 rounded-full" 
                  />
                ) : (
                  <div className="h-24 w-24 rounded-full bg-primary-100 dark:bg-primary-800 flex items-center justify-center">
                    <span className="text-primary-600 dark:text-primary-400 text-3xl font-semibold">
                      {user?.displayName?.charAt(0) || user?.email?.charAt(0) || 'U'}
                    </span>
                  </div>
                )}
              </div>
              
              <form onSubmit={handleSaveProfile}>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Display Name
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        name="displayName"
                        id="displayName"
                        className={`shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 dark:border-gray-700 dark:bg-gray-700 dark:text-white rounded-md ${!isEditing ? 'bg-gray-50 dark:bg-gray-800' : ''}`}
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        disabled={!isEditing || isSaving}
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Email
                    </label>
                    <div className="mt-1">
                      <input
                        type="email"
                        name="email"
                        id="email"
                        className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 dark:border-gray-700 dark:bg-gray-700 dark:text-white rounded-md bg-gray-50 dark:bg-gray-800"
                        value={email}
                        disabled={true}
                        readOnly
                      />
                    </div>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Email cannot be changed</p>
                  </div>
                  
                  <div>
                    <label htmlFor="provider" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Login Provider
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        name="provider"
                        id="provider"
                        className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 dark:border-gray-700 dark:bg-gray-700 dark:text-white rounded-md bg-gray-50 dark:bg-gray-800"
                        value={user?.provider === 'google.com' ? 'Google' : 'Email/Password'}
                        disabled={true}
                        readOnly
                      />
                    </div>
                  </div>
                  
                  <div className="pt-4 flex justify-end space-x-3">
                    {isEditing ? (
                      <>
                        <button
                          type="button"
                          onClick={handleEditToggle}
                          className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                          disabled={isSaving}
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                          disabled={isSaving}
                        >
                          {isSaving ? (
                            <>
                              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Saving...
                            </>
                          ) : "Save Changes"}
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={handleEditToggle}
                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                      >
                        <span className="material-icons text-sm mr-2">edit</span>
                        Edit Profile
                      </button>
                    )}
                  </div>
                </div>
              </form>
            </div>
          </div>

          {/* Settings card */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden mt-6">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">Settings</h3>
            </div>
            <div className="px-4 py-5 sm:p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">Dark Mode</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Toggle between light and dark theme</p>
                  </div>
                  <button
                    onClick={toggleTheme}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    <span className="material-icons text-sm mr-2">
                      {theme === 'light' ? 'dark_mode' : 'light_mode'}
                    </span>
                    {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
                  </button>
                </div>
                
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <button
                    onClick={handleLogout}
                    className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                    disabled={isLoggingOut}
                  >
                    {isLoggingOut ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Logging out...
                      </>
                    ) : (
                      <>
                        <span className="material-icons text-sm mr-2">logout</span>
                        Sign Out
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Stats and Activity */}
        <div className="mt-5 md:mt-0 md:col-span-2">
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">Activity Statistics</h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
                Your study progress at a glance
              </p>
            </div>
            
            {/* Stats grid */}
            <div className="px-4 py-5 sm:p-6">
              <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Quizzes Completed</dt>
                  <dd className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">{completedQuizzes}</dd>
                </div>
                
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Average Score</dt>
                  <dd className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">{averageScore}%</dd>
                </div>
                
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Study Time</dt>
                  <dd className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">{totalStudyTime}</dd>
                </div>
                
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Notes Generated</dt>
                  <dd className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">{notesGenerated}</dd>
                </div>
              </dl>
            </div>
          </div>
          
          {/* Badge/Achievement card */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden mt-6">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">Achievements</h3>
            </div>
            <div className="px-4 py-5 sm:p-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                <div className={`flex flex-col items-center ${completedQuizzes >= 1 ? 'text-primary-600 dark:text-primary-400' : 'text-gray-400 dark:text-gray-600'}`}>
                  <span className="material-icons text-4xl mb-2">emoji_events</span>
                  <span className="text-sm font-medium text-center">First Quiz</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 text-center">Complete your first quiz</span>
                </div>
                
                <div className={`flex flex-col items-center ${completedQuizzes >= 5 ? 'text-primary-600 dark:text-primary-400' : 'text-gray-400 dark:text-gray-600'}`}>
                  <span className="material-icons text-4xl mb-2">workspace_premium</span>
                  <span className="text-sm font-medium text-center">Quiz Master</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 text-center">Complete 5 quizzes</span>
                </div>
                
                <div className={`flex flex-col items-center ${averageScore >= 80 ? 'text-primary-600 dark:text-primary-400' : 'text-gray-400 dark:text-gray-600'}`}>
                  <span className="material-icons text-4xl mb-2">psychology</span>
                  <span className="text-sm font-medium text-center">Excellent Scholar</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 text-center">Achieve 80%+ average score</span>
                </div>
                
                <div className={`flex flex-col items-center ${notesGenerated >= 3 ? 'text-primary-600 dark:text-primary-400' : 'text-gray-400 dark:text-gray-600'}`}>
                  <span className="material-icons text-4xl mb-2">summarize</span>
                  <span className="text-sm font-medium text-center">Note Taker</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 text-center">Generate 3+ summaries</span>
                </div>
                
                <div className={`flex flex-col items-center ${totalStudyTimeInSeconds >= 3600 ? 'text-primary-600 dark:text-primary-400' : 'text-gray-400 dark:text-gray-600'}`}>
                  <span className="material-icons text-4xl mb-2">hourglass_top</span>
                  <span className="text-sm font-medium text-center">Dedicated Learner</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 text-center">Study for 1+ hour</span>
                </div>
                
                <div className={`flex flex-col items-center text-gray-400 dark:text-gray-600`}>
                  <span className="material-icons text-4xl mb-2">auto_awesome</span>
                  <span className="text-sm font-medium text-center">Perfect Score</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 text-center">Get 100% on a quiz</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Account info */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden mt-6">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">Account Information</h3>
            </div>
            <div className="px-4 py-5 sm:p-6">
              <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Account Created</dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-white">June 8, 2023</dd>
                </div>
                
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Account Type</dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                      Free
                    </span>
                  </dd>
                </div>
                
                <div className="sm:col-span-2">
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Upgrade to Premium</dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                    <button 
                      className="inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                      onClick={() => {
                        toast({
                          title: "Premium coming soon",
                          description: "Premium features will be available in a future update",
                        });
                      }}
                    >
                      <span className="material-icons text-sm mr-2">star</span>
                      Upgrade Now
                    </button>
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
