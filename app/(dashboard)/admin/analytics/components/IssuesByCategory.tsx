'use client'

import React from 'react'

interface CategoryItem {
  category: string
  count: number
}

interface IssuesByCategoryProps {
  items: CategoryItem[]
  totalIssues: number
}

export default function IssuesByCategory({ items, totalIssues }: IssuesByCategoryProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Issues by Category</h3>
        <span className="text-sm text-gray-500">
          Total: {totalIssues}
        </span>
      </div>
      <div className="space-y-3">
        {items.length > 0 ? items.map((item) => (
          <div key={item.category} className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700 capitalize flex-1">
              {item.category}
            </span>
            <div className="flex items-center space-x-3 flex-1 max-w-xs">
              <span className="text-sm text-gray-600 w-12 text-right">
                {item.count}
              </span>
              <div className="w-24 bg-gray-200 rounded-full h-2 flex-1" aria-hidden="true">
                <div
                  className="h-2 rounded-full bg-blue-500"
                  style={{
                    width: `${totalIssues > 0 ? (item.count / totalIssues) * 100 : 0}%`
                  }}
                ></div>
              </div>
            </div>
          </div>
        )) : (
          <div className="text-center py-4 text-gray-500">
            No category data available
          </div>
        )}
      </div>
    </div>
  )
}