'use client';

import React from 'react';
import { FilterIcon, RefreshIcon, MapPinIcon, ClockIcon } from '@/components/UI/icons';

interface FindTasksHeaderProps {
  onRefresh: () => void;
  totalTasks?: number;
  filteredTasks?: number;
  hasFilters?: boolean;
}

const FindTasksHeader: React.FC<FindTasksHeaderProps> = ({ 
  onRefresh, 
  totalTasks = 0,
  filteredTasks = 0,
  hasFilters = false 
}) => {
  return (
    <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg shadow-sm p-6 mb-6">
      <div className="flex flex-col lg:flex-row justify-between items-start gap-6">
        {/* Left side - Main header */}
        <div className="flex-1">
          <div className="flex items-center space-x-4 mb-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <FilterIcon className="h-8 w-8 text-green-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Find & Claim Tasks</h1>
              <p className="text-gray-600 mt-1">
                Discover volunteer opportunities that match your skills and location
              </p>
            </div>
          </div>
          
          {/* Stats and tips */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
            <div className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-green-100">
              <div className="p-2 bg-green-50 rounded-md">
                <FilterIcon className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Smart Filters</p>
                <p className="text-xs text-gray-600">Find tasks by priority, distance & urgency</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-green-100">
              <div className="p-2 bg-green-50 rounded-md">
                <MapPinIcon className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Nearby Tasks</p>
                <p className="text-xs text-gray-600">Tasks sorted by distance from you</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-green-100">
              <div className="p-2 bg-green-50 rounded-md">
                <ClockIcon className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Quick Claim</p>
                <p className="text-xs text-gray-600">One-click task claiming</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Right side - Actions and stats */}
        <div className="lg:w-64 space-y-4">
          {/* Stats card */}
          <div className="bg-white rounded-lg border border-green-200 p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-600">Tasks Found</span>
              {hasFilters && (
                <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">
                  Filtered
                </span>
              )}
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-bold text-gray-900">
                {hasFilters && filteredTasks !== totalTasks ? `${filteredTasks}/` : ''}
                {totalTasks}
              </span>
              <span className="text-sm text-gray-500">tasks</span>
            </div>
            {hasFilters && filteredTasks !== totalTasks && (
              <p className="text-xs text-gray-500 mt-1">
                {filteredTasks} match your filters
              </p>
            )}
          </div>
          
          {/* Refresh button */}
          <button
            onClick={onRefresh}
            className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 active:bg-green-800 transition-colors shadow-sm hover:shadow"
          >
            <RefreshIcon className="h-5 w-5" />
            <span className="font-medium">Refresh Tasks</span>
          </button>
          
          {/* Help text */}
          <p className="text-xs text-gray-500 text-center">
            Tasks update in real-time. New opportunities appear as they're reported.
          </p>
        </div>
      </div>
    </div>
  );
};

export default FindTasksHeader;