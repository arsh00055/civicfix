import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.FC<{ className?: string }>;
  trend?: {
    value: number;
    isPositive: boolean;
    label?: string;
  };
  description?: string;
  className?: string;
  loading?: boolean;
  formatValue?: (value: string | number) => string;
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'indigo';
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  trend,
  description,
  className = '',
  loading = false,
  formatValue = (val) => val.toString(),
  color = 'blue',
}) => {
  const colorClasses = {
    blue: {
      bg: 'bg-blue-50',
      text: 'text-blue-600',
      trendUp: 'text-green-600',
      trendDown: 'text-red-600',
    },
    green: {
      bg: 'bg-green-50',
      text: 'text-green-600',
      trendUp: 'text-green-600',
      trendDown: 'text-red-600',
    },
    purple: {
      bg: 'bg-purple-50',
      text: 'text-purple-600',
      trendUp: 'text-green-600',
      trendDown: 'text-red-600',
    },
    orange: {
      bg: 'bg-orange-50',
      text: 'text-orange-600',
      trendUp: 'text-green-600',
      trendDown: 'text-red-600',
    },
    red: {
      bg: 'bg-red-50',
      text: 'text-red-600',
      trendUp: 'text-green-600',
      trendDown: 'text-red-600',
    },
    indigo: {
      bg: 'bg-indigo-50',
      text: 'text-indigo-600',
      trendUp: 'text-green-600',
      trendDown: 'text-red-600',
    },
  };

  const colors = colorClasses[color];

  if (loading) {
    return (
      <div className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse ${className}`}>
        <div className="flex items-center justify-between">
          <div className="space-y-3 flex-1">
            <div className="h-4 bg-gray-200 rounded w-24"></div>
            <div className="h-8 bg-gray-200 rounded w-16"></div>
            {description && <div className="h-3 bg-gray-200 rounded w-32"></div>}
          </div>
          <div className="h-12 w-12 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  const formattedValue = typeof value === 'number' && value > 999 
    ? value >= 1000000 
      ? `${(value / 1000000).toFixed(1)}M`
      : `${(value / 1000).toFixed(1)}K`
    : formatValue(value);

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow ${className}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{formattedValue}</p>
          
          {description && (
            <p className="text-xs text-gray-500 mt-1">{description}</p>
          )}
          
          {trend && (
            <div className={`flex items-center mt-2 text-xs ${
              trend.isPositive ? colors.trendUp : colors.trendDown
            }`}>
              <span className="font-medium">
                {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
              </span>
              <span className="ml-1 text-gray-500">
                {trend.label || 'from last week'}
              </span>
            </div>
          )}
        </div>
        
        <div className={`p-3 ${colors.bg} rounded-lg`}>
          <Icon className={`h-6 w-6 ${colors.text}`} />
        </div>
      </div>
    </div>
  );
};

export default StatCard;