import { useState, useEffect } from 'react';
import { useAuth } from '../../auth/hooks/useAuth';
import { issuesAPI, adminAPI, volunteersAPI } from '../../../services/api/endpoints';

export const useDashboardData = () => {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { userRole } = useAuth();

  useEffect(() => {
    fetchDashboardData();
  }, [userRole]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      let data;

      switch (userRole) {
        case 'citizen':
          data = await fetchCitizenData();
          break;
        case 'volunteer':
          data = await fetchVolunteerData();
          break;
        case 'admin':
          data = await fetchAdminData();
          break;
        default:
          throw new Error('Unknown user role');
      }

      setDashboardData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const fetchCitizenData = async () => {
    const [issuesResponse, statsResponse] = await Promise.all([
      issuesAPI.getIssues({ limit: 5, sort: 'createdAt:desc' }),
      issuesAPI.getIssues({ stats: true })
    ]);

    return {
      recentIssues: issuesResponse.data.items || [],
      stats: {
        reported: statsResponse.data.total || 0,
        resolved: statsResponse.data.resolved || 0,
        inProgress: statsResponse.data.inProgress || 0,
      },
      quickActions: [
        { label: 'Report Issue', href: '/report', icon: '➕' },
        { label: 'View Map', href: '/map', icon: '🗺️' },
        { label: 'My Reports', href: '/my-issues', icon: '📋' },
      ]
    };
  };

  const fetchVolunteerData = async () => {
    const [tasksResponse, assignmentsResponse, statsResponse] = await Promise.all([
      issuesAPI.getIssues({ status: 'reported', limit: 5 }),
      volunteersAPI.getMyAssignments(),
      volunteersAPI.getAvailableTasks()
    ]);

    return {
      availableTasks: tasksResponse.data.items || [],
      myAssignments: assignmentsResponse.data || [],
      stats: {
        completed: statsResponse.data.completed || 0,
        active: statsResponse.data.active || 0,
        rating: statsResponse.data.rating || 0,
      },
      quickActions: [
        { label: 'Find Tasks', href: '/tasks', icon: '🔍' },
        { label: 'My Assignments', href: '/assignments', icon: '📝' },
        { label: 'Update Skills', href: '/profile', icon: '⚡' },
      ]
    };
  };

  const fetchAdminData = async () => {
    const [statsResponse, usersResponse, systemResponse] = await Promise.all([
      adminAPI.getStats(),
      adminAPI.getUsers({ limit: 5 }),
      adminAPI.getSystemHealth()
    ]);

    return {
      stats: statsResponse.data,
      recentUsers: usersResponse.data.items || [],
      systemHealth: systemResponse.data,
      alerts: systemResponse.data.alerts || [],
      quickActions: [
        { label: 'User Management', href: '/admin/users', icon: '👥' },
        { label: 'System Settings', href: '/admin/settings', icon: '⚙️' },
        { label: 'View Reports', href: '/admin/reports', icon: '📊' },
      ]
    };
  };

  const refreshData = () => {
    fetchDashboardData();
  };

  return {
    dashboardData,
    loading,
    error,
    refreshData
  };
};