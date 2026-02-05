'use client';

import React from 'react';

interface MapLegendProps {
  visible: boolean;
  onToggle: () => void;
}

const MapLegend: React.FC<MapLegendProps> = ({ visible, onToggle }) => {
  const legendItems = [
    { color: '#1890FF', label: 'Reported Issues', status: 'reported' },
    { color: '#FF4D4F', label: 'In Progress', status: 'in_progress' },
    { color: '#28a745', label: 'Resolved', status: 'resolved' },
    { color: '#ffc107', label: 'Assigned', status: 'assigned' },
  ];

  const priorityItems = [
    { color: '#dc3545', label: 'Critical', priority: 'critical' },
    { color: '#fd7e14', label: 'High', priority: 'high' },
    { color: '#ffc107', label: 'Medium', priority: 'medium' },
    { color: '#28a745', label: 'Low', priority: 'low' },
  ];

  if (!visible) {
    return (
      <button
        onClick={onToggle}
        className="absolute bottom-4 left-4 bg-white rounded-lg shadow-sm border border-gray-200 px-3 py-2 hover:bg-gray-50 transition-colors z-10"
      >
        Show Legend
      </button>
    );
  }

  return (
    <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-sm border border-gray-200 p-4 max-w-xs z-10">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-semibold text-gray-900">Map Legend</h3>
        <button
          onClick={onToggle}
          className="text-gray-400 hover:text-gray-600 transition-colors text-xl"
        >
          ×
        </button>
      </div>

      <div className="space-y-3">
        {/* Status Legend */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Issue Status</h4>
          <div className="space-y-2">
            {legendItems.map(item => (
              <div key={item.status} className="flex items-center space-x-2">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm text-gray-600">{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Priority Legend */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Priority Levels</h4>
          <div className="space-y-2">
            {priorityItems.map(item => (
              <div key={item.priority} className="flex items-center space-x-2">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm text-gray-600">{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Cluster Info */}
        <div className="pt-2 border-t border-gray-200">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-medium">
              5
            </div>
            <span>Number shows issues in area</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapLegend;