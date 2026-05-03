'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { issuesAPI } from '@/lib/services/api/endpoints'; // Use issuesAPI since heatmap relates to issues

interface Area {
  name: string;
  issues: number;
  intensity: 'high' | 'medium' | 'low';
}

const IssueHeatmap: React.FC = () => {
  const router = useRouter();
  const [areas, setAreas] = useState<Area[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHeatmapData();
  }, []);

  const fetchHeatmapData = async () => {
    try {
      setLoading(true);
      // Use issuesAPI to get issues and then analyze locations
      const response = await issuesAPI.getIssues();
      const issues = response.data || [];
      
      // Group issues by location and create heatmap data
      const areaMap = new Map<string, number>();
      
      issues.forEach((issue: any) => {
        if (issue.location) {
          const areaName = issue.location.area || issue.location.city || 'Unknown';
          areaMap.set(areaName, (areaMap.get(areaName) || 0) + 1);
        }
      });
      
      // Convert to Area array
      const areaData: Area[] = Array.from(areaMap.entries()).map(([name, issuesCount]) => ({
        name,
        issues: issuesCount,
        intensity: getIntensity(issuesCount)
      }));
      
      // Sort by issues count (descending)
      areaData.sort((a, b) => b.issues - a.issues);
      
      // Take top 5 areas
      setAreas(areaData.slice(0, 5));
      
    } catch (error) {
      console.error('Failed to fetch heatmap data:', error);
      // Fallback to sample data if API fails
      setAreas([
        { name: 'Downtown', issues: 15, intensity: 'high' },
        { name: 'North District', issues: 8, intensity: 'medium' },
        { name: 'South District', issues: 3, intensity: 'low' },
        { name: 'East Side', issues: 12, intensity: 'high' },
        { name: 'West Side', issues: 6, intensity: 'medium' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getIntensity = (issuesCount: number): 'high' | 'medium' | 'low' => {
    if (issuesCount > 10) return 'high';
    if (issuesCount > 5) return 'medium';
    return 'low';
  };

  const getIntensityColor = (intensity: string) => {
    switch (intensity) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-orange-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-300';
    }
  };

  const handleAreaClick = (areaName: string) => {
    router.push(`/issues?location=${encodeURIComponent(areaName)}`);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Issue Heatmap</h2>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="flex items-center justify-between">
              <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-gray-200 rounded-full animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-8 animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Issue Heatmap</h2>
        <button
          onClick={fetchHeatmapData}
          className="text-sm cursor-pointer text-blue-600 hover:text-blue-700"
        >
          Refresh
        </button>
      </div>
      <div className="space-y-3">
        {areas.map(area => (
          <button
            key={area.name}
            onClick={() => handleAreaClick(area.name)}
            className="w-full flex items-center cursor-pointer justify-between hover:bg-gray-50 p-2 rounded-lg transition-colors text-left"
          >
            <span className="text-sm text-gray-700">{area.name}</span>
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${getIntensityColor(area.intensity)}`} />
              <span className="text-sm text-gray-600">{area.issues} issues</span>
            </div>
          </button>
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