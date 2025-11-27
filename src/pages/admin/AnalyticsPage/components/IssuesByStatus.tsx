import React from 'react';

interface StatusItem {
  status: string;
  count: number;
}

interface IssuesByStatusProps {
  items: StatusItem[];
  totalIssues: number;
}

const IssuesByStatus: React.FC<IssuesByStatusProps> = ({ items, totalIssues }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved': return 'bg-green-500';
      case 'in_progress': return 'bg-blue-500';
      case 'assigned': return 'bg-yellow-500';
      case 'in_review': return 'bg-purple-500';
      case 'reported': return 'bg-gray-500';
      default: return 'bg-red-500';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Issues by Status</h3>
        <span className="text-sm text-gray-500">
          Total: {totalIssues}
        </span>
      </div>
      <div className="space-y-3">
        {items.length > 0 ? items.map((item) => (
          <div key={item.status} className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700 capitalize flex-1">
              {item.status.replace('_', ' ')}
            </span>
            <div className="flex items-center space-x-3 flex-1 max-w-xs">
              <span className="text-sm text-gray-600 w-12 text-right">
                {item.count}
              </span>
              <div className="w-24 bg-gray-200 rounded-full h-2 flex-1">
                <div
                  className={`h-2 rounded-full ${getStatusColor(item.status)}`}
                  style={{
                    width: `${totalIssues > 0 ? (item.count / totalIssues) * 100 : 0}%`
                  }}
                ></div>
              </div>
            </div>
          </div>
        )) : (
          <div className="text-center py-4 text-gray-500">
            No status data available
          </div>
        )}
      </div>
    </div>
  );
};

export default IssuesByStatus;