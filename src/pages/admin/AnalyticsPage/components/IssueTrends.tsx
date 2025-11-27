import React from 'react';

interface TrendItem {
  date: string;
  reported: number;
  resolved: number;
}

interface IssueTrendsProps {
  trends: TrendItem[];
  timeRange: string;
}

const IssueTrends: React.FC<IssueTrendsProps> = ({ trends, timeRange }) => {
  if (!trends || trends.length === 0) return null;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-8">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Issue Trends ({timeRange})
      </h3>
      <div className="space-y-4">
        {trends.map((trend) => (
          <div key={trend.date} className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700 w-20 flex-shrink-0">
              {trend.date}
            </span>
            <div className="flex-1 mx-4">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Reported: {trend.reported}</span>
                <span>Resolved: {trend.resolved}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="h-3 rounded-full bg-green-500"
                  style={{
                    width: `${trend.reported > 0 ? (trend.resolved / trend.reported) * 100 : 0}%`
                  }}
                ></div>
              </div>
            </div>
            <span className="text-sm font-medium text-gray-900 w-12 text-right">
              {trend.reported > 0 ? Math.round((trend.resolved / trend.reported) * 100) : 0}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default IssueTrends;