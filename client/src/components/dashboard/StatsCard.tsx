import React from 'react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: string;
  color: 'primary' | 'indigo' | 'green' | 'purple' | 'blue' | 'yellow' | 'red';
}

const colorClasses = {
  primary: {
    bg: 'bg-primary-100 dark:bg-primary-700/30',
    text: 'text-primary-600 dark:text-primary-500',
  },
  indigo: {
    bg: 'bg-indigo-100 dark:bg-indigo-700/30',
    text: 'text-indigo-600 dark:text-indigo-500',
  },
  green: {
    bg: 'bg-green-100 dark:bg-green-700/30',
    text: 'text-green-600 dark:text-green-500',
  },
  purple: {
    bg: 'bg-purple-100 dark:bg-purple-700/30',
    text: 'text-purple-600 dark:text-purple-500',
  },
  blue: {
    bg: 'bg-blue-100 dark:bg-blue-700/30',
    text: 'text-blue-600 dark:text-blue-500',
  },
  yellow: {
    bg: 'bg-yellow-100 dark:bg-yellow-700/30',
    text: 'text-yellow-600 dark:text-yellow-500',
  },
  red: {
    bg: 'bg-red-100 dark:bg-red-700/30',
    text: 'text-red-600 dark:text-red-500',
  },
};

const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon, color }) => {
  const colorClass = colorClasses[color];

  return (
    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
      <div className="p-5">
        <div className="flex items-center">
          <div className={`flex-shrink-0 ${colorClass.bg} rounded-md p-3`}>
            <span className={`material-icons ${colorClass.text}`}>{icon}</span>
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                {title}
              </dt>
              <dd>
                <div className="text-lg font-semibold text-gray-900 dark:text-white">{value}</div>
              </dd>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsCard;
