'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { statsAPI } from '@/lib/services/api/endpoints';

const StatsVisualization = dynamic(
  () => import('@/components/three/StatsVisualization'),
  { 
    ssr: false,
    loading: () => (
      <div className="h-32 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }
);

interface Metrics {
  responseTime: number[];
  completionRate: number[];
  userSatisfaction: number[];
}

const PerformanceMetrics: React.FC = () => {
  const [metrics, setMetrics] = useState<Metrics>({
    responseTime: [2.1, 2.4, 1.9, 2.0, 1.8, 2.1, 1.7],
    completionRate: [85, 88, 92, 90, 87, 91, 94],
    userSatisfaction: [4.2, 4.3, 4.5, 4.4, 4.6, 4.5, 4.7],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPerformanceMetrics();
  }, []);

  const fetchPerformanceMetrics = async () => {
    try {
      setLoading(true);
      const response = await statsAPI.getPerformanceMetrics();
      if (response.data) {
        setMetrics(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch performance metrics:', error);
      // Keep default metrics on error
    } finally {
      setLoading(false);
    }
  };

  const calculateAverage = (arr: number[]): number => {
    return arr.reduce((a, b) => a + b, 0) / arr.length;
  };

  const avgResponseTime = calculateAverage(metrics.responseTime).toFixed(1);
  const avgCompletionRate = Math.round(calculateAverage(metrics.completionRate));
  const avgSatisfaction = calculateAverage(metrics.userSatisfaction).toFixed(1);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Performance Metrics</h2>
        <button
          onClick={fetchPerformanceMetrics}
          className="text-sm text-blue-600 hover:text-blue-700"
          disabled={loading}
        >
          {loading ? 'Loading...' : 'Refresh'}
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="text-center">
          <div className="h-32 flex items-center justify-center">
            {loading ? (
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            ) : (
              <StatsVisualization data={metrics.responseTime} colors={[0x3b82f6]} />
            )}
          </div>
          <h3 className="font-medium text-gray-900 mt-2">Avg Response Time</h3>
          <p className="text-2xl font-bold text-blue-600">{avgResponseTime}h</p>
          <p className="text-sm text-green-600">↓ 12% from last week</p>
        </div>
        
        <div className="text-center">
          <div className="h-32 flex items-center justify-center">
            {loading ? (
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            ) : (
              <StatsVisualization data={metrics.completionRate} colors={[0x10b981]} />
            )}
          </div>
          <h3 className="font-medium text-gray-900 mt-2">Completion Rate</h3>
          <p className="text-2xl font-bold text-green-600">{avgCompletionRate}%</p>
          <p className="text-sm text-green-600">↑ 3% from last week</p>
        </div>
        
        <div className="text-center">
          <div className="h-32 flex items-center justify-center">
            {loading ? (
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
            ) : (
              <StatsVisualization 
                data={metrics.userSatisfaction.map(x => x * 20)} 
                colors={[0xf59e0b]} 
              />
            )}
          </div>
          <h3 className="font-medium text-gray-900 mt-2">User Satisfaction</h3>
          <p className="text-2xl font-bold text-orange-600">{avgSatisfaction}/5</p>
          <p className="text-sm text-green-600">↑ 0.2 from last week</p>
        </div>
      </div>
    </div>
  );
};

export default PerformanceMetrics;