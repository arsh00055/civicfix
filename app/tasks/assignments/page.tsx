// 'use client';

// import React, { useState, useEffect } from 'react';
// import { useRouter } from 'next/navigation';
// import MainLayout from '@/components/layout/MainLayout';
// import Loading from '@/app/loading';
// import Error from '@/app/error';
// import { useAuth } from '@/features/auth/hooks/useAuth';
// import apiClient from '@/lib/services/api/client';

// const AssignmentsPage: React.FC = () => {
//   const router = useRouter();
//   const { user } = useAuth();
//   const [assignments, setAssignments] = useState<any[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     if (user) {
//       fetchAssignments();
//     }
//   }, [user]);

//   const fetchAssignments = async () => {
//     try {
//       setLoading(true);
//       setError(null);
      
//       if (!user || user.role !== 'volunteer') {
//         setError('Only volunteers can view assignments');
//         return;
//       }

//       const response = await apiClient.get('/volunteers/assignments');
//       const data = response.data || response;
//       setAssignments(data.assignments || []);
      
//     } catch (err) {
//       console.error('Failed to fetch assignments:', err);
//       setError('Failed to load your assignments. Please try again.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleRetry = () => {
//     fetchAssignments();
//   };

//   if (!user || user.role !== 'volunteer') {
//     return (
//       <MainLayout role={user?.role ?? null}>
//         <div className="container mx-auto px-4 py-8">
//           <div className="max-w-4xl mx-auto text-center">
//             <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
//               <h2 className="text-2xl font-bold text-gray-900 mb-4">Volunteer Access Required</h2>
//               <p className="text-gray-600 mb-6">
//                 This page is only accessible to volunteers. If you're a volunteer, please log in with your volunteer account.
//               </p>
//               <button
//                 onClick={() => router.push('/')}
//                 className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
//               >
//                 Back to Dashboard
//               </button>
//             </div>
//           </div>
//         </div>
//       </MainLayout>
//     );
//   }

//   return (
//     <MainLayout role={user?.role}>
//       <div className="container mx-auto px-4 py-8">
//         <div className="max-w-6xl mx-auto">
//           {/* Header */}
//           <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
//             <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
//               <div className="flex items-center space-x-4">
//                 <div className="p-3 bg-green-100 rounded-lg">
//                   <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
//                   </svg>
//                 </div>
//                 <div>
//                   <h1 className="text-2xl font-bold text-gray-900">My Assignments</h1>
//                   <p className="text-gray-600 mt-1">
//                     {assignments.length > 0 
//                       ? `${assignments.length} active assignment${assignments.length !== 1 ? 's' : ''}`
//                       : 'No active assignments'
//                     }
//                   </p>
//                 </div>
//               </div>
              
//               <button
//                 onClick={handleRetry}
//                 className="flex items-center justify-center space-x-2 bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors w-full sm:w-auto"
//               >
//                 <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
//                 </svg>
//                 <span>Refresh</span>
//               </button>
//             </div>
//           </div>

//           {/* Loading State */}
//           {loading && assignments.length === 0 && (<Loading />)}

//           {/* Error State */}
//           {error && !loading && (<Error error={error as unknown as Error & { digest?: string | undefined }} reset={() => {}} />)}

//           {/* Empty State */}
//           {!loading && !error && assignments.length === 0 && (
//             <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
//               <svg className="h-16 w-16 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
//               </svg>
//               <h3 className="text-lg font-medium text-gray-900 mb-2">No active assignments</h3>
//               <p className="text-gray-600 max-w-md mx-auto mb-6">
//                 You don't have any active assignments. Browse available tasks to find work that needs to be done.
//               </p>
//               <button
//                 onClick={() => router.push('/tasks/available')}
//                 className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
//               >
//                 Browse Available Tasks
//               </button>
//             </div>
//           )}

//           {/* Assignments List */}
//           {!loading && !error && assignments.length > 0 && (
//             <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
//               <div className="divide-y divide-gray-200">
//                 {assignments.map(assignment => (
//                   <div key={assignment.id} className="p-6 hover:bg-gray-50 transition-colors">
//                     <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
//                       <div className="flex-1">
//                         <h3 className="text-lg font-medium text-gray-900 mb-2">{assignment.title}</h3>
//                         <p className="text-gray-600 mb-4">{assignment.description}</p>
                        
//                         <div className="flex flex-wrap gap-3 mb-4">
//                           <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
//                             assignment.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
//                             assignment.status === 'completed' ? 'bg-green-100 text-green-800' :
//                             'bg-yellow-100 text-yellow-800'
//                           }`}>
//                             {assignment.status.replace('_', ' ').toUpperCase()}
//                           </span>
//                           <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
//                             {assignment.location}
//                           </span>
//                           {assignment.progress && (
//                             <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
//                               {assignment.progress}% Complete
//                             </span>
//                           )}
//                         </div>
                        
//                         <div className="flex items-center space-x-4 text-sm text-gray-500">
//                           <span>Claimed: {new Date(assignment.claimedAt).toLocaleDateString()}</span>
//                           <span>Priority: {assignment.priority?.toUpperCase()}</span>
//                         </div>
//                       </div>
                      
//                       <div className="flex space-x-3">
//                         <button
//                           onClick={() => router.push(`/issues/${assignment.taskId || assignment.id}?role=` + (user?.role || ''))}
//                           className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
//                         >
//                           View Details
//                         </button>
//                         <button
//                           onClick={() => router.push(`/issues/${assignment.taskId || assignment.id}?role=` + (user?.role || ''))}
//                           className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
//                         >
//                           Update Status
//                         </button>
//                       </div>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           )}
//         </div>
//       </div>
//     </MainLayout>
//   );
// };

// export default AssignmentsPage;

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import Loading from '@/app/loading';
import Error from '@/app/error';
import { useAuth } from '@/features/auth/hooks/useAuth';
import apiClient from '@/lib/services/api/client';

const AssignmentsPage: React.FC = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchAssignments();
    }
  }, [user]);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!user || user.role !== 'volunteer') {
        setError('Only volunteers can view assignments');
        return;
      }

      const response = await apiClient.get('/volunteers/assignments');
      const data = response.data || response;
      setAssignments(data.assignments || []);
      
    } catch (err) {
      console.error('Failed to fetch assignments:', err);
      setError('Failed to load your assignments. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    fetchAssignments();
  };

  if (!user || user.role !== 'volunteer') {
    return (
      <MainLayout role={user?.role ?? null}>
        <div className="min-h-screen bg-gray-50"> {/* Added background */}
          <div className="container mx-auto px-4 py-8">
            <div className="max-w-4xl mx-auto text-center">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Volunteer Access Required</h2>
                <p className="text-gray-600 mb-6">
                  This page is only accessible to volunteers. If you're a volunteer, please log in with your volunteer account.
                </p>
                <button
                  onClick={() => router.push('/')}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Back to Dashboard
                </button>
              </div>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout role={user?.role}>
      {/* Add full-page background container */}
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">My Assignments</h1>
                    <p className="text-gray-600 mt-1">
                      {assignments.length > 0 
                        ? `${assignments.length} active assignment${assignments.length !== 1 ? 's' : ''}`
                        : 'No active assignments'
                      }
                    </p>
                  </div>
                </div>
                
                <button
                  onClick={handleRetry}
                  className="flex items-center justify-center space-x-2 bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors w-full sm:w-auto"
                  disabled={loading}
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>Refresh</span>
                </button>
              </div>
            </div>

            {/* Loading State */}
            {loading && assignments.length === 0 && (
              <div className="flex justify-center items-center py-20">
                <Loading />
              </div>
            )}

            {/* Error State */}
            {error && !loading && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-6">
                <Error error={error as unknown as Error & { digest?: string | undefined }} reset={() => {}} />
                <div className="text-center mt-4">
                  <button
                    onClick={handleRetry}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            )}

            {/* Empty State */}
            {!loading && !error && assignments.length === 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                <svg className="h-16 w-16 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No active assignments</h3>
                <p className="text-gray-600 max-w-md mx-auto mb-6">
                  You don't have any active assignments. Browse available tasks to find work that needs to be done.
                </p>
                <button
                  onClick={() => router.push('/tasks/available')}
                  className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Browse Available Tasks
                </button>
              </div>
            )}

            {/* Assignments List */}
            {!loading && !error && assignments.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="divide-y divide-gray-200">
                  {assignments.map(assignment => (
                    <div key={assignment.id} className="p-6 hover:bg-gray-50 transition-colors">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-medium text-gray-900 mb-2">{assignment.title}</h3>
                          <p className="text-gray-600 mb-4">{assignment.description}</p>
                          
                          <div className="flex flex-wrap gap-3 mb-4">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                              assignment.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                              assignment.status === 'completed' ? 'bg-green-100 text-green-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {assignment.status.replace('_', ' ').toUpperCase()}
                            </span>
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                              {assignment.location}
                            </span>
                            {assignment.progress && (
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                                {assignment.progress}% Complete
                              </span>
                            )}
                          </div>
                          
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span>Claimed: {new Date(assignment.claimedAt).toLocaleDateString()}</span>
                            <span>Priority: {assignment.priority?.toUpperCase()}</span>
                          </div>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
                          <button
                            onClick={() => router.push(`/tasks/assignments/${assignment.taskId || assignment.id}`)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            View Details
                          </button>
                          <button
                            onClick={() => router.push(`/issues/${assignment.taskId || assignment.id}?role=` + (user?.role || ''))}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                          >
                            Update Status
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default AssignmentsPage;