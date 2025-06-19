import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { generateSummary } from '../openai';
import { Material } from '../types';
import LoadingModal from '../components/modals/LoadingModal';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

const Materials: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedMaterialId, setSelectedMaterialId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const queryClient = useQueryClient();

  // Fetch user's materials
  const { data: materials = [], isLoading: isFetchingMaterials } = useQuery<Material[]>({
    queryKey: ['/api/users', user?.id, 'materials'],
    queryFn: async () => {
      if (!user) return [];
      const res = await fetch(`/api/users/${user.id}/materials`);
      const data = await res.json();
      return data;
    },
    enabled: !!user,
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadFile(file);
      setTitle(file.name);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!uploadFile || !user) {
      toast({
        title: "Upload error",
        description: "Please select a file to upload",
        variant: "destructive",
      });
      return;
    }

    const formData = new FormData();
    formData.append('file', uploadFile);
    formData.append('userId', user.id.toString());
    formData.append('title', title);
    if (subject) formData.append('subject', subject);

    try {
      setIsLoading(true);
      
      const response = await fetch('/api/materials', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to upload file');
      }

      await response.json();
      toast({
        title: "Upload successful",
        description: `${uploadFile.name} has been uploaded and processed`,
      });
      
      // Reset form and close dialog
      setUploadFile(null);
      setTitle('');
      setSubject('');
      setIsUploadDialogOpen(false);
      
      // Refresh materials list
      queryClient.invalidateQueries({ queryKey: ['/api/users', user.id, 'materials'] });
    } catch (error) {
      toast({
        title: "Upload failed",
        description: error.message || "There was an error uploading your file",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateSummary = async (materialId: number) => {
    try {
      setSelectedMaterialId(materialId);
      setIsLoading(true);
      
      await generateSummary(materialId);
      
      toast({
        title: "Summary generated",
        description: "Your summary has been successfully generated",
      });
      
      // Refresh summaries list
      queryClient.invalidateQueries({ queryKey: ['/api/users', user?.id, 'summaries'] });
    } catch (error) {
      toast({
        title: "Error generating summary",
        description: error.message || "There was an error generating the summary",
        variant: "destructive",
      });
    } finally {
      setSelectedMaterialId(null);
      setIsLoading(false);
    }
  };

  const getFileTypeIcon = (fileType: string) => {
    const iconMap: Record<string, { icon: string, bg: string, text: string }> = {
      'pdf': { 
        icon: 'picture_as_pdf', 
        bg: 'bg-red-100 dark:bg-red-900', 
        text: 'text-red-600 dark:text-red-300' 
      },
      'docx': { 
        icon: 'description', 
        bg: 'bg-blue-100 dark:bg-blue-900', 
        text: 'text-blue-600 dark:text-blue-300' 
      },
      'doc': { 
        icon: 'description', 
        bg: 'bg-blue-100 dark:bg-blue-900', 
        text: 'text-blue-600 dark:text-blue-300' 
      },
      'txt': { 
        icon: 'article', 
        bg: 'bg-gray-100 dark:bg-gray-700', 
        text: 'text-gray-600 dark:text-gray-300' 
      },
      'jpg': { 
        icon: 'image', 
        bg: 'bg-green-100 dark:bg-green-900', 
        text: 'text-green-600 dark:text-green-300' 
      },
      'jpeg': { 
        icon: 'image', 
        bg: 'bg-green-100 dark:bg-green-900', 
        text: 'text-green-600 dark:text-green-300' 
      },
      'png': { 
        icon: 'image', 
        bg: 'bg-green-100 dark:bg-green-900', 
        text: 'text-green-600 dark:text-green-300' 
      },
      'ppt': { 
        icon: 'slideshow', 
        bg: 'bg-orange-100 dark:bg-orange-900', 
        text: 'text-orange-600 dark:text-orange-300' 
      },
      'pptx': { 
        icon: 'slideshow', 
        bg: 'bg-orange-100 dark:bg-orange-900', 
        text: 'text-orange-600 dark:text-orange-300' 
      },
      'ppx': { 
        icon: 'slideshow', 
        bg: 'bg-orange-100 dark:bg-orange-900', 
        text: 'text-orange-600 dark:text-orange-300' 
      },
      'default': { 
        icon: 'insert_drive_file', 
        bg: 'bg-gray-100 dark:bg-gray-700', 
        text: 'text-gray-600 dark:text-gray-300' 
      },
    };
    
    return iconMap[fileType] || iconMap.default;
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch (error) {
      return 'Unknown date';
    }
  };

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Study Materials</h2>
        <button
          onClick={() => setIsUploadDialogOpen(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          <span className="material-icons text-sm mr-2">upload_file</span>
          Upload Material
        </button>
      </div>

      {isFetchingMaterials ? (
        <div className="flex justify-center items-center h-64">
          <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : materials.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 text-center">
          <span className="material-icons text-gray-400 text-4xl mb-2">description</span>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">No materials uploaded yet</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Upload your study materials to generate quizzes and summaries.
          </p>
          <button
            onClick={() => setIsUploadDialogOpen(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <span className="material-icons text-sm mr-2">upload_file</span>
            Upload Material
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {materials.map((material) => {
            const fileIcon = getFileTypeIcon(material.fileType);
            return (
              <div key={material.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start">
                    <div className={`flex-shrink-0 ${fileIcon.bg} rounded-lg p-3`}>
                      <span className={`material-icons ${fileIcon.text}`}>{fileIcon.icon}</span>
                    </div>
                    <div className="ml-4 flex-1">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">{material.title}</h3>
                      {material.subject && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                          Subject: {material.subject}
                        </p>
                      )}
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Uploaded on {formatDate(material.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 flex justify-end space-x-2">
                    <button
                      onClick={() => handleGenerateSummary(material.id)}
                      disabled={isLoading && selectedMaterialId === material.id}
                      className="inline-flex items-center px-3 py-1.5 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading && selectedMaterialId === material.id ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-700 dark:text-gray-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Processing...
                        </>
                      ) : (
                        <>
                          <span className="material-icons text-sm mr-1">summarize</span>
                          Generate Summary
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Upload Dialog */}
      {isUploadDialogOpen && (
        <div className="fixed z-10 inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div 
              className="fixed inset-0 bg-gray-500 bg-opacity-75 dark:bg-gray-900 dark:bg-opacity-75 transition-opacity" 
              aria-hidden="true"
              onClick={() => !isLoading && setIsUploadDialogOpen(false)}
            ></div>
            
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            
            <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleUpload}>
                <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-primary-100 dark:bg-primary-900 sm:mx-0 sm:h-10 sm:w-10">
                      <span className="material-icons text-primary-600 dark:text-primary-400">upload_file</span>
                    </div>
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                      <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white" id="modal-title">
                        Upload Study Material
                      </h3>
                      <div className="mt-4 space-y-4">
                        <div>
                          <label htmlFor="file-upload" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            File
                          </label>
                          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-700 border-dashed rounded-lg">
                            <div className="space-y-1 text-center">
                              <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                              <div className="flex text-sm text-gray-600 dark:text-gray-400">
                                <label htmlFor="file-upload" className="relative cursor-pointer bg-white dark:bg-gray-800 rounded-md font-medium text-primary-600 dark:text-primary-500 hover:text-primary-500 dark:hover:text-primary-400 focus-within:outline-none">
                                  <span>Upload a file</span>
                                  <input 
                                    id="file-upload" 
                                    name="file" 
                                    type="file" 
                                    className="sr-only"
                                    onChange={handleFileChange}
                                    accept=".pdf,.docx,.doc,.txt,.jpg,.jpeg,.png,.ppt,.pptx,.ppx"
                                    disabled={isLoading}
                                  />
                                </label>
                                <p className="pl-1">or drag and drop</p>
                              </div>
                              <p className="text-xs text-gray-500">
                                PDF, DOCX, TXT, PPX, JPG, PNG up to 10MB
                              </p>
                              {uploadFile && (
                                <p className="text-sm text-primary-600 dark:text-primary-500 mt-2">
                                  Selected: {uploadFile.name}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <label htmlFor="material-title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Title
                          </label>
                          <input 
                            type="text" 
                            id="material-title" 
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-700 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                            disabled={isLoading}
                          />
                        </div>
                        
                        <div>
                          <label htmlFor="material-subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Subject (Optional)
                          </label>
                          <input 
                            type="text" 
                            id="material-subject" 
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-700 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            disabled={isLoading}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button 
                    type="submit" 
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isLoading || !uploadFile}
                  >
                    {isLoading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Uploading...
                      </>
                    ) : "Upload & Process"}
                  </button>
                  <button 
                    type="button" 
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-800 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={() => setIsUploadDialogOpen(false)}
                    disabled={isLoading}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Loading Modal */}
      <LoadingModal 
        isOpen={isLoading} 
        message="AI is processing your content"
        progress={75}
      />
    </div>
  );
};

export default Materials;
