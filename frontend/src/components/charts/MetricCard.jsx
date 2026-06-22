import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

const MetricCard = ({ 
  title, 
  value, 
  change = null, 
  changeType = 'positive', 
  icon: Icon = null,
  color = 'blue',
  unit = '',
  subtext = null,
}) => {
  const colorMap = {
    blue: 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400',
    green: 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400',
    red: 'bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400',
    yellow: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-600 dark:text-yellow-400',
    purple: 'bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400',
  };

  const borderColorMap = {
    blue: 'border-blue-200 dark:border-blue-800',
    green: 'border-green-200 dark:border-green-800',
    red: 'border-red-200 dark:border-red-800',
    yellow: 'border-yellow-200 dark:border-yellow-800',
    purple: 'border-purple-200 dark:border-purple-800',
  };

  return (
    <div className={`p-6 rounded-lg border-2 ${borderColorMap[color]} bg-white dark:bg-gray-800`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">{title}</p>
          <div className="mt-2 flex items-baseline gap-2">
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
            {unit && <span className="text-gray-500 dark:text-gray-400">{unit}</span>}
          </div>
          {subtext && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{subtext}</p>}
        </div>
        
        <div className="flex items-center gap-3">
          {change !== null && (
            <div className="flex items-center gap-1">
              {changeType === 'positive' ? (
                <TrendingUp className="w-4 h-4 text-green-500" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-500" />
              )}
              <span className={changeType === 'positive' ? 'text-green-500' : 'text-red-500'}>
                {Math.abs(change)}%
              </span>
            </div>
          )}
          
          {Icon && (
            <div className={`p-3 rounded-lg ${colorMap[color]}`}>
              <Icon className="w-6 h-6" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MetricCard;
