import React from 'react';
import { Summary } from '../../types';
import { format } from 'date-fns';

interface RecentSummaryListProps {
  summaries: Summary[];
  onViewAll: () => void;
  onDownload: (summaryId: number) => void;
}

const RecentSummaryList: React.FC<RecentSummaryListProps> = ({ summaries, onViewAll, onDownload }) => {
  const formatDate = (dateString: string) => {
    try {
      return `Created ${format(new Date(dateString), 'MMM d')}`;
    } catch (error) {
      return 'Date unknown';
    }
  };

  const getRandomColor = (title: string) => {
    const colors = [
      { bg: 'bg-indigo-100 dark:bg-indigo-900', text: 'text-indigo-600 dark:text-indigo-300' },
      { bg: 'bg-pink-100 dark:bg-pink-900', text: 'text-pink-600 dark:text-pink-300' },
      { bg: 'bg-green-100 dark:bg-green-900', text: 'text-green-600 dark:text-green-300' },
      { bg: 'bg-blue-100 dark:bg-blue-900', text: 'text-blue-600 dark:text-blue-300' },
      { bg: 'bg-purple-100 dark:bg-purple-900', text: 'text-purple-600 dark:text-purple-300' },
      { bg: 'bg-yellow-100 dark:bg-yellow-900', text: 'text-yellow-600 dark:text-yellow-300' },
      { bg: 'bg-red-100 dark:bg-red-900', text: 'text-red-600 dark:text-red-300' },
    ];

    // Use the title string to generate a deterministic color
    const index = title.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
    return colors[index];
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Recent Summaries</h3>
          <button 
            onClick={onViewAll}
            className="text-sm font-medium text-primary-600 dark:text-primary-500 hover:text-primary-700 dark:hover:text-primary-400"
          >
            View all
          </button>
        </div>
      </div>
      
      {summaries.length === 0 ? (
        <div className="px-6 py-8 text-center">
          <span className="material-icons text-gray-400 text-4xl mb-2">description</span>
          <p className="text-gray-500 dark:text-gray-400">No summaries yet</p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Upload study materials to generate summaries.</p>
        </div>
      ) : (
        <ul role="list" className="divide-y divide-gray-200 dark:divide-gray-700">
          {summaries.map((summary) => {
            const { bg, text } = getRandomColor(summary.title);
            return (
              <li key={summary.id} className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`flex-shrink-0 h-10 w-10 rounded-full ${bg} flex items-center justify-center`}>
                      <span className={`material-icons ${text}`}>description</span>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{summary.title}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{formatDate(summary.createdAt)}</div>
                    </div>
                  </div>
                  <button 
                    onClick={() => onDownload(summary.id)}
                    className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                  >
                    <span className="material-icons">file_download</span>
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default RecentSummaryList;
