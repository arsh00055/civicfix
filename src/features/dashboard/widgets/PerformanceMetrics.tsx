import React from 'react';
import StatsVisualization from '../../../components/three/StatsVisualization';

const PerformanceMetrics: React.FC = () => {
  const metrics = {
    responseTime: [2.1, 2.4, 1.9, 2.0, 1.8, 2.1, 1.7],
    completionRate: [85, 88, 92, 90, 87, 91, 94],
    userSatisfaction: [4.2, 4.3, 4.5, 4.4, 4.6, 4.5, 4.7],
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Performance Metrics</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="text-center">
          <div className="h-32 flex items-center justify-center">
            <StatsVisualization data={metrics.responseTime} colors={[0x3b82f6]} />
          </div>
          <h3 className="font-medium text-gray-900 mt-2">Avg Response Time</h3>
          <p className="text-2xl font-bold text-blue-600">1.9h</p>
          <p className="text-sm text-green-600">↓ 12% from last week</p>
        </div>
        
        <div className="text-center">
          <div className="h-32 flex items-center justify-center">
            <StatsVisualization data={metrics.completionRate} colors={[0x10b981]} />
          </div>
          <h3 className="font-medium text-gray-900 mt-2">Completion Rate</h3>
          <p className="text-2xl font-bold text-green-600">91%</p>
          <p className="text-sm text-green-600">↑ 3% from last week</p>
        </div>
        
        <div className="text-center">
          <div className="h-32 flex items-center justify-center">
            <StatsVisualization data={metrics.userSatisfaction.map(x => x * 20)} colors={[0xf59e0b]} />
          </div>
          <h3 className="font-medium text-gray-900 mt-2">User Satisfaction</h3>
          <p className="text-2xl font-bold text-orange-600">4.5/5</p>
          <p className="text-sm text-green-600">↑ 0.2 from last week</p>
        </div>
      </div>
    </div>
  );
};

export default PerformanceMetrics;