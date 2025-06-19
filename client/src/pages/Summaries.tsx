import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { generateSummary } from '../openai';
import { Material, Summary } from '../types';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';

const Summaries: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [selectedMaterialId, setSelectedMaterialId] = React.useState<number | null>(null);

  // Fetch user's summaries
  const { data: summaries = [], isLoading: isLoadingSummaries, refetch: refetchSummaries } = useQuery<Summary[]>({
    queryKey: ['/api/users', user?.id, 'summaries'],
    queryFn: async () => {
      if (!user) return [];
      const res = await fetch(`/api/users/${user.id}/summaries`);
      const data = await res.json();
      return data;
    },
    enabled: !!user,
  });

  // Fetch user's materials
  const { data: materials = [], isLoading: isLoadingMaterials } = useQuery<Material[]>({
    queryKey: ['/api/users', user?.id, 'materials'],
    queryFn: async () => {
      if (!user) return [];
      const res = await fetch(`/api/users/${user.id}/materials`);
      const data = await res.json();
      return data;
    },
    enabled: !!user,
  });

  const isLoading = isLoadingSummaries || isLoadingMaterials;

  const handleGenerateSummary = async (materialId: number) => {
    try {
      setSelectedMaterialId(materialId);
      setIsGenerating(true);
      
      await generateSummary(materialId);
      
      toast({
        title: "Summary generated",
        description: "Your summary has been successfully generated",
      });
      
      refetchSummaries();
    } catch (error) {
      toast({
        title: "Error generating summary",
        description: error.message || "There was an error generating the summary",
        variant: "destructive",
      });
    } finally {
      setSelectedMaterialId(null);
      setIsGenerating(false);
    }
  };

  const handleDownloadSummary = async (summaryId: number) => {
    try {
      window.open(`/api/summaries/${summaryId}/pdf`, '_blank');
    } catch (error) {
      toast({
        title: "Download failed",
        description: "Failed to download the summary PDF",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch (error) {
      return 'Unknown date';
    }
  };

  // Group summaries by material for easier viewing
  const summariesByMaterial = summaries.reduce<Record<number, Summary[]>>((acc, summary) => {
    if (!acc[summary.materialId]) {
      acc[summary.materialId] = [];
    }
    acc[summary.materialId].push(summary);
    return acc;
  }, {});

  // Materials without summaries
  const materialsWithoutSummaries = materials.filter(
    (material) => !summariesByMaterial[material.id]
  );

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Notes & Summaries</h2>
        <button
          onClick={() => setLocation('/materials')}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          <span className="material-icons text-sm mr-2">upload_file</span>
          Upload New Material
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : summaries.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 text-center">
          <span className="material-icons text-gray-400 text-4xl mb-2">description</span>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">No summaries generated yet</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            {materials.length === 0 
              ? "Upload study materials first to generate summaries."
              : "Generate summaries from your uploaded study materials."}
          </p>
          {materials.length === 0 ? (
            <button
              onClick={() => setLocation('/materials')}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <span className="material-icons text-sm mr-2">upload_file</span>
              Upload Materials
            </button>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
              {materials.map((material) => (
                <div key={material.id} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <h3 className="text-md font-medium text-gray-900 dark:text-white mb-2">{material.title}</h3>
                  <button
                    onClick={() => handleGenerateSummary(material.id)}
                    disabled={isGenerating}
                    className="w-full inline-flex justify-center items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isGenerating && selectedMaterialId === material.id ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Generating...
                      </>
                    ) : (
                      <>
                        <span className="material-icons text-sm mr-2">summarize</span>
                        Generate Summary
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-8">
          {/* Existing summaries */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {summaries.map((summary) => {
              const material = materials.find(m => m.id === summary.materialId);
              
              return (
                <div key={summary.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
                  <div className="p-6">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 bg-indigo-100 dark:bg-indigo-900 rounded-lg p-3">
                        <span className="material-icons text-indigo-600 dark:text-indigo-400">description</span>
                      </div>
                      <div className="ml-4 flex-1">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">{summary.title}</h3>
                        {material && (
                          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                            Based on: {material.title}
                          </p>
                        )}
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Created on {formatDate(summary.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 flex justify-end">
                      <button
                        onClick={() => handleDownloadSummary(summary.id)}
                        className="inline-flex items-center px-3 py-1.5 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                      >
                        <span className="material-icons text-sm mr-1">file_download</span>
                        Download PDF
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Materials without summaries */}
          {materialsWithoutSummaries.length > 0 && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Generate More Summaries</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {materialsWithoutSummaries.map((material) => (
                  <div key={material.id} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <h3 className="text-md font-medium text-gray-900 dark:text-white mb-2">{material.title}</h3>
                    <button
                      onClick={() => handleGenerateSummary(material.id)}
                      disabled={isGenerating}
                      className="w-full inline-flex justify-center items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isGenerating && selectedMaterialId === material.id ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Generating...
                        </>
                      ) : (
                        <>
                          <span className="material-icons text-sm mr-2">summarize</span>
                          Generate Summary
                        </>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Summaries;
