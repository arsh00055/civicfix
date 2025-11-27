import React from 'react';

const IssueHeatmap: React.FC = () => {
  const areas = [
    { name: 'Downtown', issues: 15, intensity: 'high' },
    { name: 'North District', issues: 8, intensity: 'medium' },
    { name: 'South District', issues: 3, intensity: 'low' },
    { name: 'East Side', issues: 12, intensity: 'high' },
    { name: 'West Side', issues: 6, intensity: 'medium' },
  ];

  const getIntensityColor = (intensity: string) => {
    switch (intensity) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-orange-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-300';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Issue Heatmap</h2>
      <div className="space-y-3">
        {areas.map(area => (
          <div key={area.name} className="flex items-center justify-between">
            <span className="text-sm text-gray-700">{area.name}</span>
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${getIntensityColor(area.intensity)}`} />
              <span className="text-sm text-gray-600">{area.issues} issues</span>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Low</span>
          <span>Medium</span>
          <span>High</span>
        </div>
        <div className="flex space-x-1 mt-1">
          <div className="flex-1 h-2 bg-green-500 rounded"></div>
          <div className="flex-1 h-2 bg-orange-500 rounded"></div>
          <div className="flex-1 h-2 bg-red-500 rounded"></div>
        </div>
      </div>
    </div>
  );
};

export default IssueHeatmap;