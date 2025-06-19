import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { User, Material, Quiz, Summary } from '../types';
import { useToast } from '@/hooks/use-toast';

const Admin: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'users' | 'materials' | 'quizzes' | 'summaries'>('users');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [actionItem, setActionItem] = useState<any>(null);
  const [actionType, setActionType] = useState<'suspend' | 'delete' | 'restore'>('suspend');
  const [newSubject, setNewSubject] = useState('');
  const [isAddingSubject, setIsAddingSubject] = useState(false);
  const [subjects, setSubjects] = useState<string[]>([
    'Mathematics', 'Biology', 'Chemistry', 'Physics', 'History', 'English', 'Computer Science'
  ]);

  // Check if user is admin
  useEffect(() => {
    if (user && !user.isAdmin) {
      // Redirect non-admin users
      window.location.href = '/dashboard';
    }
  }, [user]);

  // Fetch all users
  const { data: users = [], isLoading: isLoadingUsers } = useQuery<User[]>({
    queryKey: ['/api/admin/users'],
    queryFn: async () => {
      // In a real app, this would call an admin API
      // For now, we'll simulate some mock data
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return [
        {
          id: 1,
          username: 'sarahthompson',
          email: 'sarah@university.edu',
          displayName: 'Sarah Thompson',
          photoURL: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
          isAdmin: false,
          provider: 'email',
          createdAt: new Date('2023-06-08').toISOString(),
        },
        {
          id: 2,
          username: 'michaelroberts',
          email: 'michael@university.edu',
          displayName: 'Michael Roberts',
          photoURL: undefined,
          isAdmin: false,
          provider: 'google.com',
          createdAt: new Date('2023-07-15').toISOString(),
        },
        {
          id: 3,
          username: 'jenniferbrown',
          email: 'jennifer@university.edu',
          displayName: 'Jennifer Brown',
          photoURL: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
          isAdmin: false,
          provider: 'email',
          createdAt: new Date('2023-08-22').toISOString(),
        },
      ];
    },
    enabled: !!user && user.isAdmin,
  });

  // Fetch all materials
  const { data: materials = [], isLoading: isLoadingMaterials } = useQuery<Material[]>({
    queryKey: ['/api/admin/materials'],
    queryFn: async () => {
      // In a real app, this would call an admin API
      await new Promise(resolve => setTimeout(resolve, 800));
      
      return [
        {
          id: 1,
          userId: 1,
          title: 'Advanced Mathematics Notes',
          description: 'College algebra and calculus notes',
          fileType: 'pdf',
          subject: 'Mathematics',
          createdAt: new Date('2023-09-10').toISOString(),
        },
        {
          id: 2,
          userId: 2,
          title: 'Biology Fundamentals',
          description: 'First year biology course notes',
          fileType: 'docx',
          subject: 'Biology',
          createdAt: new Date('2023-09-15').toISOString(),
        },
        {
          id: 3,
          userId: 3,
          title: 'Introduction to Psychology',
          description: 'Psychology 101 lecture notes',
          fileType: 'pdf',
          subject: 'Psychology',
          createdAt: new Date('2023-09-18').toISOString(),
        },
      ];
    },
    enabled: !!user && user.isAdmin,
  });

  // Fetch all quizzes
  const { data: quizzes = [], isLoading: isLoadingQuizzes } = useQuery<Quiz[]>({
    queryKey: ['/api/admin/quizzes'],
    queryFn: async () => {
      // In a real app, this would call an admin API
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      return [
        {
          id: 1,
          userId: 1,
          materialId: 1,
          title: 'Advanced Mathematics Quiz',
          difficulty: 'hard',
          totalQuestions: 15,
          questionType: 'multiple-choice',
          createdAt: new Date('2023-09-12').toISOString(),
        },
        {
          id: 2,
          userId: 2,
          materialId: 2,
          title: 'Biology Fundamentals',
          difficulty: 'medium',
          totalQuestions: 10,
          questionType: 'multiple-choice',
          createdAt: new Date('2023-09-16').toISOString(),
        },
        {
          id: 3,
          userId: 3,
          materialId: 3,
          title: 'Introduction to Psychology',
          difficulty: 'easy',
          totalQuestions: 12,
          questionType: 'true-false',
          createdAt: new Date('2023-09-20').toISOString(),
        },
      ];
    },
    enabled: !!user && user.isAdmin,
  });

  // Fetch all summaries
  const { data: summaries = [], isLoading: isLoadingSummaries } = useQuery<Summary[]>({
    queryKey: ['/api/admin/summaries'],
    queryFn: async () => {
      // In a real app, this would call an admin API
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      return [
        {
          id: 1,
          userId: 1,
          materialId: 1,
          title: 'Summary: Advanced Mathematics Notes',
          content: 'Summarized content of advanced mathematics...',
          createdAt: new Date('2023-09-12').toISOString(),
        },
        {
          id: 2,
          userId: 2,
          materialId: 2,
          title: 'Summary: Biology Fundamentals',
          content: 'Summarized content of biology fundamentals...',
          createdAt: new Date('2023-09-16').toISOString(),
        },
        {
          id: 3,
          userId: 3,
          materialId: 3,
          title: 'Summary: Introduction to Psychology',
          content: 'Summarized content of introduction to psychology...',
          createdAt: new Date('2023-09-20').toISOString(),
        },
      ];
    },
    enabled: !!user && user.isAdmin,
  });

  const isLoading = isLoadingUsers || isLoadingMaterials || isLoadingQuizzes || isLoadingSummaries;

  const handleAction = (item: any, action: 'suspend' | 'delete' | 'restore') => {
    setActionItem(item);
    setActionType(action);
    setShowConfirmDialog(true);
  };

  const confirmAction = async () => {
    try {
      // In a real app, this would call an admin API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      let successMessage = '';
      
      if (actionType === 'suspend') {
        successMessage = `User ${actionItem.email} has been suspended`;
      } else if (actionType === 'delete') {
        successMessage = `${activeTab === 'users' ? 'User' : activeTab === 'materials' ? 'Material' : activeTab === 'quizzes' ? 'Quiz' : 'Summary'} has been deleted`;
      } else if (actionType === 'restore') {
        successMessage = `User ${actionItem.email} has been restored`;
      }
      
      toast({
        title: "Action successful",
        description: successMessage,
      });
      
      // In a real app, you would refresh the data
      // queryClient.invalidateQueries({ queryKey: [`/api/admin/${activeTab}`] });
    } catch (error) {
      toast({
        title: "Action failed",
        description: "There was an error performing this action",
        variant: "destructive",
      });
    } finally {
      setShowConfirmDialog(false);
      setActionItem(null);
    }
  };

  const handleAddSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newSubject.trim()) {
      toast({
        title: "Validation error",
        description: "Subject name cannot be empty",
        variant: "destructive",
      });
      return;
    }
    
    if (subjects.includes(newSubject.trim())) {
      toast({
        title: "Validation error",
        description: "Subject already exists",
        variant: "destructive",
      });
      return;
    }
    
    setIsAddingSubject(true);
    
    try {
      // In a real app, this would call an admin API
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setSubjects(prev => [...prev, newSubject.trim()]);
      setNewSubject('');
      
      toast({
        title: "Subject added",
        description: `Subject "${newSubject.trim()}" has been added`,
      });
    } catch (error) {
      toast({
        title: "Failed to add subject",
        description: "There was an error adding the subject",
        variant: "destructive",
      });
    } finally {
      setIsAddingSubject(false);
    }
  };

  if (!user || !user.isAdmin) {
    return (
      <div className="py-6 px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 text-center">
          <span className="material-icons text-red-500 text-4xl mb-2">error</span>
          <h2 className="text-xl font-medium text-gray-900 dark:text-white mb-2">Access Denied</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            You don't have permission to access this page.
          </p>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Panel</h2>
        <div className="mt-3 md:mt-0 inline-flex rounded-md shadow-sm">
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 text-sm font-medium rounded-l-md ${
              activeTab === 'users'
                ? 'bg-primary-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
            } border border-gray-300 dark:border-gray-600`}
          >
            Users
          </button>
          <button
            onClick={() => setActiveTab('materials')}
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === 'materials'
                ? 'bg-primary-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
            } border-t border-b border-gray-300 dark:border-gray-600`}
          >
            Materials
          </button>
          <button
            onClick={() => setActiveTab('quizzes')}
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === 'quizzes'
                ? 'bg-primary-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
            } border-t border-b border-gray-300 dark:border-gray-600`}
          >
            Quizzes
          </button>
          <button
            onClick={() => setActiveTab('summaries')}
            className={`px-4 py-2 text-sm font-medium rounded-r-md ${
              activeTab === 'summaries'
                ? 'bg-primary-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
            } border border-gray-300 dark:border-gray-600`}
          >
            Summaries
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
          {/* Users Table */}
          {activeTab === 'users' && (
            <>
              <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Manage Users</h3>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                  Total: {users.length}
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">User</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Email</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Created At</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {users.map((user) => (
                      <tr key={user.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              {user.photoURL ? (
                                <img className="h-10 w-10 rounded-full" src={user.photoURL} alt={user.displayName} />
                              ) : (
                                <div className="h-10 w-10 rounded-full bg-primary-100 dark:bg-primary-800 flex items-center justify-center">
                                  <span className="text-primary-600 dark:text-primary-400 font-semibold">
                                    {user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'}
                                  </span>
                                </div>
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900 dark:text-white">{user.displayName}</div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">@{user.username}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white">{user.email}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {user.provider === 'google.com' ? 'Google' : 'Email/Password'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {formatDate(user.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                            Active
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => handleAction(user, 'suspend')}
                            className="text-yellow-600 hover:text-yellow-900 dark:text-yellow-500 dark:hover:text-yellow-300 mr-3"
                          >
                            Suspend
                          </button>
                          <button
                            onClick={() => handleAction(user, 'delete')}
                            className="text-red-600 hover:text-red-900 dark:text-red-500 dark:hover:text-red-300"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* Materials Table */}
          {activeTab === 'materials' && (
            <>
              <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Manage Materials</h3>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                  Total: {materials.length}
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Title</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Subject</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Type</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Uploaded By</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date</th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {materials.map((material) => {
                      const materialUser = users.find(u => u.id === material.userId);
                      return (
                        <tr key={material.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">{material.title}</div>
                            {material.description && (
                              <div className="text-sm text-gray-500 dark:text-gray-400">{material.description}</div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {material.subject || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                              {material.fileType.toUpperCase()}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {materialUser?.displayName || `User ${material.userId}`}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {formatDate(material.createdAt)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={() => handleAction(material, 'delete')}
                              className="text-red-600 hover:text-red-900 dark:text-red-500 dark:hover:text-red-300"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* Quizzes Table */}
          {activeTab === 'quizzes' && (
            <>
              <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Manage Quizzes</h3>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                  Total: {quizzes.length}
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Title</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Difficulty</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Questions</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Created By</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date</th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {quizzes.map((quiz) => {
                      const quizUser = users.find(u => u.id === quiz.userId);
                      return (
                        <tr key={quiz.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">{quiz.title}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              Type: {quiz.questionType.replace(/-/g, ' ')}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              quiz.difficulty === 'easy' 
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                                : quiz.difficulty === 'medium'
                                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                            }`}>
                              {quiz.difficulty.charAt(0).toUpperCase() + quiz.difficulty.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {quiz.totalQuestions}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {quizUser?.displayName || `User ${quiz.userId}`}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {formatDate(quiz.createdAt)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={() => handleAction(quiz, 'delete')}
                              className="text-red-600 hover:text-red-900 dark:text-red-500 dark:hover:text-red-300"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* Summaries Table */}
          {activeTab === 'summaries' && (
            <>
              <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Manage Summaries</h3>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                  Total: {summaries.length}
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Title</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Material ID</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Created By</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date</th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {summaries.map((summary) => {
                      const summaryUser = users.find(u => u.id === summary.userId);
                      return (
                        <tr key={summary.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">{summary.title}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {summary.materialId}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {summaryUser?.displayName || `User ${summary.userId}`}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {formatDate(summary.createdAt)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={() => handleAction(summary, 'delete')}
                              className="text-red-600 hover:text-red-900 dark:text-red-500 dark:hover:text-red-300"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}

      {/* Subject Management */}
      <div className="mt-6 bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Manage Subjects</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
            Add or remove subject categories for the platform
          </p>
        </div>
        <div className="px-4 py-5 sm:p-6">
          <form onSubmit={handleAddSubject} className="flex items-center space-x-4 mb-6">
            <div className="flex-1">
              <label htmlFor="subject-name" className="sr-only">Subject Name</label>
              <input
                type="text"
                id="subject-name"
                className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 dark:border-gray-700 dark:bg-gray-700 dark:text-white rounded-md"
                placeholder="New subject name"
                value={newSubject}
                onChange={(e) => setNewSubject(e.target.value)}
                disabled={isAddingSubject}
              />
            </div>
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
              disabled={isAddingSubject}
            >
              {isAddingSubject ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Adding...
                </>
              ) : (
                <>
                  <span className="material-icons text-sm mr-2">add</span>
                  Add Subject
                </>
              )}
            </button>
          </form>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {subjects.map((subject, index) => (
              <div key={index} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{subject}</span>
                <button
                  onClick={() => {
                    setSubjects(subjects.filter((_, i) => i !== index));
                    toast({
                      title: "Subject removed",
                      description: `Subject "${subject}" has been removed`,
                    });
                  }}
                  className="text-gray-400 hover:text-red-500 dark:hover:text-red-400"
                >
                  <span className="material-icons text-sm">delete</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="fixed z-10 inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div 
              className="fixed inset-0 bg-gray-500 bg-opacity-75 dark:bg-gray-900 dark:bg-opacity-75 transition-opacity" 
              aria-hidden="true"
              onClick={() => setShowConfirmDialog(false)}
            ></div>
            
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            
            <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900 sm:mx-0 sm:h-10 sm:w-10">
                    <span className="material-icons text-red-600 dark:text-red-400">warning</span>
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white" id="modal-title">
                      Confirm {actionType === 'suspend' ? 'Suspension' : actionType === 'delete' ? 'Deletion' : 'Restoration'}
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {actionType === 'suspend' && `Are you sure you want to suspend ${actionItem?.email}? They will not be able to log in until restored.`}
                        {actionType === 'delete' && `Are you sure you want to delete this ${activeTab.slice(0, -1)}? This action cannot be undone.`}
                        {actionType === 'restore' && `Are you sure you want to restore ${actionItem?.email}? They will regain full access to the platform.`}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button 
                  type="button" 
                  className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 ${
                    actionType === 'restore'
                      ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
                      : 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                  } text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm`}
                  onClick={confirmAction}
                >
                  {actionType === 'suspend' ? 'Suspend' : actionType === 'delete' ? 'Delete' : 'Restore'}
                </button>
                <button 
                  type="button" 
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-800 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => setShowConfirmDialog(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;
