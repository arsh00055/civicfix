// 'use client';

// import React, { useState, useEffect } from 'react';
// import { useRouter, useParams } from 'next/navigation';
// import { ArrowLeftIcon, CheckCircleIcon, ClockIcon, ExclamationTriangleIcon, MapPinIcon, CalendarIcon, UserIcon, DocumentTextIcon } from '@/components/UI/icons';
// import PrimaryButton from '@/components/UI/buttons/PrimaryButton';
// import SecondaryButton from '@/components/UI/buttons/SecondaryButton';
// import { issuesAPI } from '@/lib/services/api/endpoints';
// import type { Issue } from '@/types';
// import { PhotoIcon, TagIcon } from '@heroicons/react/16/solid';

// type AssignmentStatus = 'reported' | 'in_review' | 'assigned' | 'in_progress' | 'resolved' | 'closed';

// interface Task {
//   id: string;
//   description: string;
//   completed: boolean;
// }

// interface Update {
//   id: string;
//   date: string;
//   text: string;
//   by: string;
// }

// const AssignmentDetailPage = () => {
//   const router = useRouter();
//   const params = useParams();
//   const assignmentId = params.id as string;

//   const [assignment, setAssignment] = useState<Issue | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [isUpdating, setIsUpdating] = useState(false);
//   const [showUpdateModal, setShowUpdateModal] = useState(false);
//   const [newStatus, setNewStatus] = useState<AssignmentStatus>('in_progress');
//   const [updateMessage, setUpdateMessage] = useState('');

//   // Mock data for tasks and updates (you should fetch this from your API)
//   const [tasks, setTasks] = useState<Task[]>([
//     { id: '1', description: 'Collect trash and debris', completed: true },
//     { id: '2', description: 'Trim overgrown bushes', completed: true },
//     { id: '3', description: 'Repaint park benches', completed: false },
//     { id: '4', description: 'Fix broken playground equipment', completed: false },
//   ]);

//   const [updates, setUpdates] = useState<Update[]>([
//     { id: '1', date: '2024-01-18T09:15:00Z', text: 'Claimed the assignment and visited the site for initial assessment.', by: 'You' },
//     { id: '2', date: '2024-01-19T14:30:00Z', text: 'Completed trash collection and bush trimming. Progress at 60%.', by: 'You' },
//   ]);

//   useEffect(() => {
//     fetchAssignment();
//   }, [assignmentId]);

//   const fetchAssignment = async () => {
//     try {
//       setLoading(true);
//       // Replace with your actual API call
//       // const data = await issuesAPI.getIssue(assignmentId);
//       // setAssignment(data);
      
//       // Mock data for now
//       setAssignment({
//           id: assignmentId,
//           title: 'Park Cleanup',
//           description: 'Clean up the community park, remove trash, trim bushes, and repair equipment',
//           status: 'in_progress',
//           priority: 'medium',
//           location: 'Central Park, Main Entrance Area',
//           category: 'Infrastructure',
//           createdAt: '2024-01-15T10:30:00Z',
//           updatedAt: '2024-01-20T14:45:00Z',
//           reporter: { id: '1', name: 'Emma Wilson' },
//           volunteer: { id: '2', name: 'John Smith' },
//           images: []
//       } as unknown as Issue);
//     } catch (error) {
//       console.error('Failed to fetch assignment:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const getStatusIcon = (status: AssignmentStatus) => {
//     switch (status) {
//       case 'resolved': 
//         return <CheckCircleIcon className="h-6 w-6 text-green-500" />;
//       case 'in_progress': 
//         return <ClockIcon className="h-6 w-6 text-blue-500" />;
//       case 'assigned': 
//         return <ClockIcon className="h-6 w-6 text-yellow-500" />;
//       case 'reported': 
//         return <ExclamationTriangleIcon className="h-6 w-6 text-orange-500" />;
//       case 'closed': 
//         return <ExclamationTriangleIcon className="h-6 w-6 text-gray-500" />;
//       default: 
//         return <ExclamationTriangleIcon className="h-6 w-6 text-gray-500" />;
//     }
//   };

//   const getStatusColor = (status: AssignmentStatus) => {
//     switch (status) {
//       case 'resolved': return 'bg-green-100 text-green-800 border-green-200';
//       case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-200';
//       case 'assigned': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
//       case 'reported': return 'bg-orange-100 text-orange-800 border-orange-200';
//       case 'closed': return 'bg-gray-100 text-gray-800 border-gray-200';
//       default: return 'bg-gray-100 text-gray-800 border-gray-200';
//     }
//   };

//   const getPriorityColor = (priority: string) => {
//     switch (priority) {
//       case 'critical': return 'bg-red-100 text-red-800 border-red-200';
//       case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
//       case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
//       case 'low': return 'bg-green-100 text-green-800 border-green-200';
//       default: return 'bg-gray-100 text-gray-800 border-gray-200';
//     }
//   };

//   const getProgressPercentage = (): number => {
//     if (!assignment) return 0;
//     const completedTasks = tasks.filter(t => t.completed).length;
//     return Math.round((completedTasks / tasks.length) * 100);
//   };

//   const handleUpdateStatus = async () => {
//     if (!assignment || !newStatus) return;

//     setIsUpdating(true);
//     try {
//       // Call your API to update status
//       // await issuesAPI.updateIssueStatus(assignment.id, newStatus, updateMessage);
      
//       // Update local state
//       setAssignment({
//         ...assignment,
//         status: newStatus,
//         updatedAt: new Date().toISOString()
//       });

//       // Add update to history
//       const newUpdate: Update = {
//         id: (updates.length + 1).toString(),
//         date: new Date().toISOString(),
//         text: updateMessage || `Status updated to ${newStatus.replace('_', ' ')}`,
//         by: 'You'
//       };
//       setUpdates([newUpdate, ...updates]);

//       // Close modal and reset
//       setShowUpdateModal(false);
//       setUpdateMessage('');
//       alert('Status updated successfully!');
//     } catch (error) {
//       console.error('Failed to update status:', error);
//       alert('Failed to update status. Please try again.');
//     } finally {
//       setIsUpdating(false);
//     }
//   };

//   const toggleTaskCompletion = (taskId: string) => {
//     setTasks(tasks.map(task => 
//       task.id === taskId ? { ...task, completed: !task.completed } : task
//     ));
//   };

//   const canStart = assignment?.status === 'assigned';
//   const canComplete = assignment?.status === 'in_progress';
//   const progress = getProgressPercentage();

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gray-50 p-4 md:p-6">
//         <div className="max-w-7xl mx-auto">
//           <div className="animate-pulse">
//             <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
//             <div className="bg-white rounded-lg shadow p-6">
//               <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
//               <div className="h-4 bg-gray-200 rounded w-1/2"></div>
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   if (!assignment) {
//     return (
//       <div className="min-h-screen bg-gray-50 p-4 md:p-6">
//         <div className="max-w-7xl mx-auto">
//           <div className="text-center py-12">
//             <ExclamationTriangleIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
//             <h2 className="text-2xl font-bold text-gray-900 mb-2">Assignment Not Found</h2>
//             <p className="text-gray-600 mb-6">The assignment you're looking for doesn't exist or you don't have access to it.</p>
//             <button
//               onClick={() => router.push('/assignments')}
//               className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
//             >
//               Back to My Assignments
//             </button>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-50 p-4 md:p-6">
//       <div className="max-w-7xl mx-auto">
//         {/* Header */}
//         <div className="mb-6">
//           <button
//             onClick={() => router.push('/assignments')}
//             className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
//           >
//             <ArrowLeftIcon className="h-5 w-5 mr-2" />
//             Back to My Assignments
//           </button>
//           <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
//             <div>
//               <h1 className="text-3xl font-bold text-gray-900">{assignment.title}</h1>
//               <p className="text-gray-600 mt-1">{assignment.description}</p>
//             </div>
//             <div className="flex flex-wrap gap-2">
//               <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getPriorityColor(assignment.priority)}`}>
//                 {assignment.priority.toUpperCase()}
//               </span>
//               <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(assignment.status as AssignmentStatus)} flex items-center gap-1`}>
//                 {getStatusIcon(assignment.status as AssignmentStatus)}
//                 {assignment.status.replace('_', ' ').toUpperCase()}
//               </span>
//             </div>
//           </div>
//         </div>

//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//           {/* Left Column - Main Content */}
//           <div className="lg:col-span-2 space-y-6">
//             {/* Progress Card */}
//             <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
//               <h3 className="text-lg font-semibold text-gray-900 mb-4">Progress</h3>
//               <div className="mb-6">
//                 <div className="flex justify-between text-sm text-gray-700 mb-2">
//                   <span>Task Completion</span>
//                   <span>{progress}%</span>
//                 </div>
//                 <div className="w-full bg-gray-200 rounded-full h-4">
//                   <div
//                     className="bg-blue-600 h-4 rounded-full transition-all"
//                     style={{ width: `${progress}%` }}
//                   ></div>
//                 </div>
//                 <div className="text-sm text-gray-500 mt-2">
//                   {tasks.filter(t => t.completed).length} of {tasks.length} tasks completed
//                 </div>
//               </div>

//               {/* Tasks List */}
//               <div className="space-y-3">
//                 <h4 className="font-medium text-gray-900">Tasks</h4>
//                 {tasks.map(task => (
//                   <div key={task.id} className="flex items-center">
//                     <button
//                       onClick={() => toggleTaskCompletion(task.id)}
//                       className={`w-5 h-5 rounded border mr-3 flex items-center justify-center ${task.completed ? 'bg-green-500 border-green-500' : 'border-gray-300'}`}
//                     >
//                       {task.completed && <CheckCircleIcon className="h-3 w-3 text-white" />}
//                     </button>
//                     <span className={task.completed ? 'text-gray-500 line-through' : 'text-gray-900'}>
//                       {task.description}
//                     </span>
//                   </div>
//                 ))}
//               </div>
//             </div>

//             {/* Updates History */}
//             <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
//               <h3 className="text-lg font-semibold text-gray-900 mb-4">Activity & Updates</h3>
//               <div className="space-y-4">
//                 {updates.map(update => (
//                   <div key={update.id} className="border-l-2 border-blue-500 pl-4 py-2">
//                     <div className="text-sm text-gray-500">
//                       {new Date(update.date).toLocaleDateString()} at {new Date(update.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
//                     </div>
//                     <p className="text-gray-700 mt-1">{update.text}</p>
//                     <div className="text-sm text-gray-500 mt-1">— {update.by}</div>
//                   </div>
//                 ))}
//               </div>
              
//               {/* Add Update Form */}
//               <div className="mt-6 pt-6 border-t border-gray-200">
//                 <h4 className="font-medium text-gray-900 mb-3">Add Update</h4>
//                 <textarea
//                   value={updateMessage}
//                   onChange={(e) => setUpdateMessage(e.target.value)}
//                   placeholder="What's the latest progress on this assignment?"
//                   className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                   rows={3}
//                 />
//                 <button
//                   onClick={() => {
//                     if (updateMessage.trim()) {
//                       const newUpdate: Update = {
//                         id: (updates.length + 1).toString(),
//                         date: new Date().toISOString(),
//                         text: updateMessage,
//                         by: 'You'
//                       };
//                       setUpdates([newUpdate, ...updates]);
//                       setUpdateMessage('');
//                     }
//                   }}
//                   disabled={!updateMessage.trim()}
//                   className="mt-3 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
//                 >
//                   Post Update
//                 </button>
//               </div>
//             </div>
//           </div>

//           {/* Right Column - Sidebar */}
//           <div className="space-y-6">
//             {/* Assignment Details Card */}
//             <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
//               <h3 className="text-lg font-semibold text-gray-900 mb-4">Assignment Details</h3>
              
//               <div className="space-y-4">
//                 <div className="flex items-start">
//                   <MapPinIcon className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
//                   <div>
//                     <div className="text-sm text-gray-500">Location</div>
//                     <div className="text-gray-900">{assignment.location}</div>
//                   </div>
//                 </div>

//                 <div className="flex items-start">
//                   <TagIcon className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
//                   <div>
//                     <div className="text-sm text-gray-500">Category</div>
//                     <div className="text-gray-900">{assignment.category}</div>
//                   </div>
//                 </div>

//                 <div className="flex items-start">
//                   <CalendarIcon className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
//                   <div>
//                     <div className="text-sm text-gray-500">Claimed On</div>
//                     <div className="text-gray-900">{new Date(assignment.createdAt).toLocaleDateString()}</div>
//                   </div>
//                 </div>

//                 <div className="flex items-start">
//                   <UserIcon className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
//                   <div>
//                     <div className="text-sm text-gray-500">Reported By</div>
//                     <div className="text-gray-900">{assignment.reporter?.name || 'Unknown'}</div>
//                   </div>
//                 </div>

//                 <div className="flex items-start">
//                   <ClockIcon className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
//                   <div>
//                     <div className="text-sm text-gray-500">Last Updated</div>
//                     <div className="text-gray-900">{new Date(assignment.updatedAt).toLocaleDateString()}</div>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* Actions Card */}
//             <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
//               <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>
              
//               <div className="space-y-3">
//                 {canStart && (
//                   <PrimaryButton
//                     onClick={() => {
//                       setNewStatus('in_progress');
//                       setShowUpdateModal(true);
//                     }}
//                     disabled={isUpdating}
//                     className="w-full justify-center"
//                   >
//                     {isUpdating ? 'Starting...' : 'Start Assignment'}
//                   </PrimaryButton>
//                 )}

//                 {canComplete && (
//                   <PrimaryButton
//                     onClick={() => {
//                       setNewStatus('resolved');
//                       setShowUpdateModal(true);
//                     }}
//                     disabled={isUpdating}
//                     className="w-full justify-center bg-green-600 hover:bg-green-700"
//                   >
//                     {isUpdating ? 'Completing...' : 'Mark as Complete'}
//                   </PrimaryButton>
//                 )}

//                 <SecondaryButton
//                   onClick={() => router.push(`/issues/${assignmentId}`)}
//                   className="w-full justify-center"
//                 >
//                   View Original Issue
//                 </SecondaryButton>

//                 <button className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
//                   <PhotoIcon className="h-5 w-5 mr-2" />
//                   Upload Photos
//                 </button>

//                 <button className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
//                   <DocumentTextIcon className="h-5 w-5 mr-2" />
//                   Add Notes
//                 </button>

//                 <button className="w-full flex items-center justify-center px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors">
//                   <ExclamationTriangleIcon className="h-5 w-5 mr-2" />
//                   Request Help
//                 </button>
//               </div>
//             </div>

//             {/* Materials Needed */}
//             <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
//               <h3 className="text-lg font-semibold text-gray-900 mb-4">Materials Needed</h3>
//               <div className="space-y-2">
//                 {['Trash bags', 'Gardening gloves', 'Pruners', 'Paint', 'Brushes'].map((item, index) => (
//                   <div key={index} className="flex items-center">
//                     <div className="w-2 h-2 bg-gray-400 rounded-full mr-3"></div>
//                     <span className="text-gray-700">{item}</span>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Update Status Modal */}
//       {showUpdateModal && (
//         <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
//           <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
//             <h3 className="text-lg font-semibold text-gray-900 mb-2">Update Status</h3>
//             <p className="text-gray-600 mb-4">
//               You're about to update this assignment to: <strong>{newStatus.replace('_', ' ')}</strong>
//             </p>
            
//             <textarea
//               value={updateMessage}
//               onChange={(e) => setUpdateMessage(e.target.value)}
//               placeholder="Add a note about this status update (optional)"
//               className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4"
//               rows={3}
//             />

//             <div className="flex justify-end space-x-3">
//               <button
//                 onClick={() => {
//                   setShowUpdateModal(false);
//                   setUpdateMessage('');
//                 }}
//                 className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
//                 disabled={isUpdating}
//               >
//                 Cancel
//               </button>
//               <PrimaryButton
//                 onClick={handleUpdateStatus}
//                 disabled={isUpdating}
//                 isLoading={isUpdating}
//               >
//                 {isUpdating ? 'Updating...' : 'Confirm Update'}
//               </PrimaryButton>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default AssignmentDetailPage;


'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeftIcon, CheckCircleIcon, ClockIcon, ExclamationTriangleIcon, MapPinIcon, CalendarIcon, UserIcon, DocumentTextIcon } from '@/components/UI/icons';
import PrimaryButton from '@/components/UI/buttons/PrimaryButton';
import SecondaryButton from '@/components/UI/buttons/SecondaryButton';
import apiClient from '@/lib/services/api/client';
import { PhotoIcon, TagIcon } from '@heroicons/react/16/solid';

interface Assignment {
  id: string;
  title: string;
  description: string;
  status: string;
  location: string;
  progress: number;
  progressPercentage: string;
  claimedDate: string;
  claimedDateFormatted: string;
  priority: string;
  priorityLevel: string;
  category: string;
  images: Array<{
    url: string;
    alt?: string;
  }>;
  volunteer?: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  reporter?: {
    id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
  dueDate?: string;
  estimatedHours?: number;
  actualHours?: number;
  tasks?: Array<{
    id: string;
    description: string;
    completed: boolean;
  }>;
  notes?: string;
  materialsNeeded?: string[];
  updates?: Array<{
    id: string;
    date: string;
    text: string;
    by: string;
  }>;
  attachments?: Array<{
    id: string;
    name: string;
    url: string;
    type: string;
  }>;
  stats?: {
    totalTasks: number;
    completedTasks: number;
    remainingTasks: number;
    daysRemaining: number;
  };
}

const AssignmentDetailPage = () => {
  const router = useRouter();
  const params = useParams();
  const assignmentId = params.id as string;

  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [newStatus, setNewStatus] = useState<string>('in_progress');
  const [updateMessage, setUpdateMessage] = useState('');

  useEffect(() => {
    fetchAssignment();
  }, [assignmentId]);

  const fetchAssignment = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch assignment using your apiClient
      const response = await apiClient.get(`/volunteer/assignment-1`);
      setAssignment(response.data);
    } catch (error: any) {
      console.error('Failed to fetch assignment:', error);
      setError('Failed to load assignment details. Please try again.');
      
      // Fallback to a test route if the specific ID doesn't exist
      if (assignmentId === 'assignment-1') {
        try {
          const fallbackResponse = await apiClient.get('/volunteer/assignment-1');
          setAssignment(fallbackResponse.data);
          setError(null);
        } catch (fallbackError) {
          console.error('Fallback also failed:', fallbackError);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower.includes('in_progress') || statusLower.includes('progress')) {
      return <ClockIcon className="h-6 w-6 text-blue-500" />;
    } else if (statusLower.includes('resolved') || statusLower.includes('completed')) {
      return <CheckCircleIcon className="h-6 w-6 text-green-500" />;
    } else if (statusLower.includes('assigned')) {
      return <ClockIcon className="h-6 w-6 text-yellow-500" />;
    } else if (statusLower.includes('reported')) {
      return <ExclamationTriangleIcon className="h-6 w-6 text-orange-500" />;
    } else if (statusLower.includes('closed')) {
      return <ExclamationTriangleIcon className="h-6 w-6 text-gray-500" />;
    }
    return <ExclamationTriangleIcon className="h-6 w-6 text-gray-500" />;
  };

  const getStatusColor = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower.includes('in_progress') || statusLower.includes('progress')) {
      return 'bg-blue-100 text-blue-800 border-blue-200';
    } else if (statusLower.includes('resolved') || statusLower.includes('completed')) {
      return 'bg-green-100 text-green-800 border-green-200';
    } else if (statusLower.includes('assigned')) {
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    } else if (statusLower.includes('reported')) {
      return 'bg-orange-100 text-orange-800 border-orange-200';
    } else if (statusLower.includes('closed')) {
      return 'bg-gray-100 text-gray-800 border-gray-200';
    }
    return 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getPriorityColor = (priority: string) => {
    const priorityLower = priority.toLowerCase();
    switch (priorityLower) {
      case 'critical':
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getProgressPercentage = (): number => {
    if (!assignment) return 0;
    
    // Use the progress from API if available
    if (assignment.progress !== undefined) {
      return assignment.progress;
    }
    
    // Fallback: calculate from tasks
    if (assignment.tasks && assignment.tasks.length > 0) {
      const completedTasks = assignment.tasks.filter(t => t.completed).length;
      return Math.round((completedTasks / assignment.tasks.length) * 100);
    }
    
    // Fallback: estimate from status
    switch (assignment.status.toLowerCase()) {
      case 'reported':
        return 0;
      case 'assigned':
        return 25;
      case 'in_progress':
        return assignment.progress || 60;
      case 'resolved':
      case 'completed':
        return 100;
      case 'closed':
        return 0;
      default:
        return 0;
    }
  };

  const handleUpdateStatus = async () => {
    if (!assignment || !newStatus) return;

    setIsUpdating(true);
    try {
      // Update assignment status via apiClient
      const response = await apiClient.patch(`/volunteer/assignments/${assignmentId}`, {
        status: newStatus,
        progress: newStatus.toLowerCase().includes('resolved') ? 100 : 75,
        updateMessage: updateMessage || `Status updated to ${newStatus}`,
        updatedAt: new Date().toISOString(),
      });

      const updatedData = response.data;
      setAssignment(updatedData);

      // Add update to local updates array
      if (assignment.updates) {
        const newUpdate = {
          id: (assignment.updates.length + 1).toString(),
          date: new Date().toISOString(),
          text: updateMessage || `Status updated to ${newStatus}`,
          by: 'You'
        };
        setAssignment({
          ...assignment,
          updates: [newUpdate, ...assignment.updates]
        });
      }

      // Close modal and reset
      setShowUpdateModal(false);
      setUpdateMessage('');
      alert('Status updated successfully!');
    } catch (error: any) {
      console.error('Failed to update status:', error);
      alert('Failed to update status. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  const toggleTaskCompletion = (taskId: string) => {
    if (!assignment || !assignment.tasks) return;
    
    const updatedTasks = assignment.tasks.map(task => 
      task.id === taskId ? { ...task, completed: !task.completed } : task
    );
    
    // Calculate new progress
    const completedTasks = updatedTasks.filter(t => t.completed).length;
    const newProgress = Math.round((completedTasks / updatedTasks.length) * 100);
    
    setAssignment({
      ...assignment,
      tasks: updatedTasks,
      progress: newProgress,
      progressPercentage: `${newProgress}% Complete`
    });
  };

  const addNewUpdate = async () => {
    if (!updateMessage.trim()) return;
    
    try {
      // Add update via apiClient
      const response = await apiClient.post(`/volunteer/assignments/${assignmentId}/updates`, {
        text: updateMessage,
        by: 'You',
        date: new Date().toISOString()
      });

      if (response.data) {
        const newUpdate = {
          id: (assignment?.updates?.length || 0 + 1).toString(),
          date: new Date().toISOString(),
          text: updateMessage,
          by: 'You'
        };
        setAssignment({
          ...assignment!,
          updates: [newUpdate, ...(assignment?.updates || [])]
        });
        setUpdateMessage('');
        alert('Update added successfully!');
      }
    } catch (error: any) {
      console.error('Failed to add update:', error);
      alert('Failed to add update. Please try again.');
    }
  };

  const canStart = assignment?.status.toLowerCase().includes('assigned');
  const canComplete = assignment?.status.toLowerCase().includes('in_progress') || 
                     assignment?.status.toLowerCase().includes('progress');
  const progress = getProgressPercentage();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !assignment) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <ExclamationTriangleIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {error ? 'Error Loading Assignment' : 'Assignment Not Found'}
            </h2>
            <p className="text-gray-600 mb-6">
              {error || "The assignment you're looking for doesn't exist or you don't have access to it."}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => router.push('/assignments')}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Back to My Assignments
              </button>
              <button
                onClick={fetchAssignment}
                className="border border-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.push('/assignments')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Back to My Assignments
          </button>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{assignment.title}</h1>
              <p className="text-gray-600 mt-1">{assignment.description}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getPriorityColor(assignment.priority)}`}>
                {assignment.priority.toUpperCase()}
              </span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(assignment.status)} flex items-center gap-1`}>
                {getStatusIcon(assignment.status)}
                {assignment.status.replace('_', ' ').toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Progress Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Progress</h3>
              <div className="mb-6">
                <div className="flex justify-between text-sm text-gray-700 mb-2">
                  <span>Task Completion</span>
                  <span>{assignment.progressPercentage || `${progress}%`}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div
                    className="bg-blue-600 h-4 rounded-full transition-all"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                {assignment.stats && (
                  <div className="text-sm text-gray-500 mt-2">
                    {assignment.stats.completedTasks} of {assignment.stats.totalTasks} tasks completed
                    {assignment.stats.daysRemaining > 0 && ` • ${assignment.stats.daysRemaining} days remaining`}
                  </div>
                )}
              </div>

              {/* Tasks List */}
              {assignment.tasks && assignment.tasks.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900">Tasks</h4>
                  {assignment.tasks.map(task => (
                    <div key={task.id} className="flex items-center">
                      <button
                        onClick={() => toggleTaskCompletion(task.id)}
                        className={`w-5 h-5 rounded border mr-3 flex items-center justify-center ${task.completed ? 'bg-green-500 border-green-500' : 'border-gray-300'}`}
                      >
                        {task.completed && <CheckCircleIcon className="h-3 w-3 text-white" />}
                      </button>
                      <span className={task.completed ? 'text-gray-500 line-through' : 'text-gray-900'}>
                        {task.description}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Updates History */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Activity & Updates</h3>
              {assignment.updates && assignment.updates.length > 0 ? (
                <div className="space-y-4">
                  {assignment.updates.map(update => (
                    <div key={update.id} className="border-l-2 border-blue-500 pl-4 py-2">
                      <div className="text-sm text-gray-500">
                        {new Date(update.date).toLocaleDateString()} at {new Date(update.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <p className="text-gray-700 mt-1">{update.text}</p>
                      <div className="text-sm text-gray-500 mt-1">— {update.by}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No updates yet</p>
              )}
              
              {/* Add Update Form */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="font-medium text-gray-900 mb-3">Add Update</h4>
                <textarea
                  value={updateMessage}
                  onChange={(e) => setUpdateMessage(e.target.value)}
                  placeholder="What's the latest progress on this assignment?"
                  className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                />
                <button
                  onClick={addNewUpdate}
                  disabled={!updateMessage.trim()}
                  className="mt-3 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Post Update
                </button>
              </div>
            </div>

            {/* Images Gallery */}
            {assignment.images && assignment.images.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Photos</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {assignment.images.map((image, index) => (
                    <div key={index} className="rounded-lg overflow-hidden">
                      <img 
                        src={image.url} 
                        alt={image.alt || `Assignment image ${index + 1}`}
                        className="w-full h-48 object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Assignment Details Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Assignment Details</h3>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <MapPinIcon className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                  <div>
                    <div className="text-sm text-gray-500">Location</div>
                    <div className="text-gray-900">{assignment.location}</div>
                  </div>
                </div>

                <div className="flex items-start">
                  <TagIcon className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                  <div>
                    <div className="text-sm text-gray-500">Category</div>
                    <div className="text-gray-900">{assignment.category}</div>
                  </div>
                </div>

                <div className="flex items-start">
                  <CalendarIcon className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                  <div>
                    <div className="text-sm text-gray-500">Claimed On</div>
                    <div className="text-gray-900">{assignment.claimedDateFormatted || new Date(assignment.claimedDate || assignment.createdAt).toLocaleDateString()}</div>
                  </div>
                </div>

                {assignment.reporter && (
                  <div className="flex items-start">
                    <UserIcon className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                    <div>
                      <div className="text-sm text-gray-500">Reported By</div>
                      <div className="text-gray-900">{assignment.reporter.name}</div>
                    </div>
                  </div>
                )}

                <div className="flex items-start">
                  <ClockIcon className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                  <div>
                    <div className="text-sm text-gray-500">Last Updated</div>
                    <div className="text-gray-900">{new Date(assignment.updatedAt).toLocaleDateString()}</div>
                  </div>
                </div>

                {assignment.dueDate && (
                  <div className="flex items-start">
                    <CalendarIcon className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                    <div>
                      <div className="text-sm text-gray-500">Due Date</div>
                      <div className="text-gray-900">{new Date(assignment.dueDate).toLocaleDateString()}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Actions Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>
              
              <div className="space-y-3">
                {canStart && (
                  <PrimaryButton
                    onClick={() => {
                      setNewStatus('IN_PROGRESS');
                      setShowUpdateModal(true);
                    }}
                    disabled={isUpdating}
                    className="w-full justify-center"
                  >
                    {isUpdating ? 'Starting...' : 'Start Assignment'}
                  </PrimaryButton>
                )}

                {canComplete && (
                  <PrimaryButton
                    onClick={() => {
                      setNewStatus('RESOLVED');
                      setShowUpdateModal(true);
                    }}
                    disabled={isUpdating}
                    className="w-full justify-center bg-green-600 hover:bg-green-700"
                  >
                    {isUpdating ? 'Completing...' : 'Mark as Complete'}
                  </PrimaryButton>
                )}

                <SecondaryButton
                  onClick={() => router.push(`/issues/${assignmentId.replace('assignment-', '')}`)}
                  className="w-full justify-center"
                >
                  View Original Issue
                </SecondaryButton>

                <button className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                  <PhotoIcon className="h-5 w-5 mr-2" />
                  Upload Photos
                </button>

                {assignment.notes && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <h4 className="font-medium text-gray-900 mb-2">Notes</h4>
                    <p className="text-gray-600 text-sm">{assignment.notes}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Materials Needed */}
            {assignment.materialsNeeded && assignment.materialsNeeded.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Materials Needed</h3>
                <div className="space-y-2">
                  {assignment.materialsNeeded.map((item, index) => (
                    <div key={index} className="flex items-center">
                      <div className="w-2 h-2 bg-gray-400 rounded-full mr-3"></div>
                      <span className="text-gray-700">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Update Status Modal */}
      {showUpdateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Update Status</h3>
            <p className="text-gray-600 mb-4">
              You're about to update this assignment to: <strong>{newStatus.replace('_', ' ')}</strong>
            </p>
            
            <textarea
              value={updateMessage}
              onChange={(e) => setUpdateMessage(e.target.value)}
              placeholder="Add a note about this status update (optional)"
              className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4"
              rows={3}
            />

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowUpdateModal(false);
                  setUpdateMessage('');
                }}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                disabled={isUpdating}
              >
                Cancel
              </button>
              <PrimaryButton
                onClick={handleUpdateStatus}
                disabled={isUpdating}
                isLoading={isUpdating}
              >
                {isUpdating ? 'Updating...' : 'Confirm Update'}
              </PrimaryButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssignmentDetailPage;