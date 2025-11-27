import React, { useState, useEffect } from 'react';
import StatCard from '../../../components/UI/cards/StatCard';
import QuickActions from '../widgets/QuickActions';
import RecentActivity from '../widgets/RecentActivity';
import { 
  UserGroupIcon, 
  ChartBarIcon, 
  ExclamationTriangleIcon,
  CogIcon,
  CheckCircleIcon,
} from '../../../components/UI/icons';
import { adminAPI, analyticsAPI } from '../../../services/api/endpoints';
import type { SystemAlert, DashboardStats } from '../../../types';

interface AdminProps {
  role: string | null;
}

interface SystemHealth {
  status: 'healthy' | 'degraded' | 'down';
  message: string;
  uptime: number;
  responseTime: number;
}

const AdminDashboard: React.FC<AdminProps> = ({ role }) => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [systemAlerts, setSystemAlerts] = useState<SystemAlert[]>([]);
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch all data in parallel
      const [statsResponse, healthResponse, analyticsResponse] = await Promise.all([
        adminAPI.getStats(),
        adminAPI.getSystemHealth(),
        analyticsAPI.getOverview({ timeframe: 'week' })
      ]);

      setStats(statsResponse.data);
      setSystemHealth(healthResponse.data);
      
      // Transform analytics data into system alerts
      const alerts = transformAnalyticsToAlerts(analyticsResponse.data);
      setSystemAlerts(alerts);

    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      setError('Failed to load dashboard data. Please try again.');
      
      // Set fallback data for demo purposes
      setSystemAlerts([
        { 
          id: 1, 
          message: 'Unable to fetch real-time data. Using demo data.', 
          severity: 'warning',
          timestamp: new Date().toISOString()
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const transformAnalyticsToAlerts = (analytics: any): SystemAlert[] => {
    const alerts: SystemAlert[] = [];

    // Check for high error rates
    if (analytics.errorRate > 5) {
      alerts.push({
        id: 1,
        message: `High error rate detected: ${analytics.errorRate}%`,
        severity: 'warning',
        timestamp: new Date().toISOString()
      });
    }

    // Check for slow response times
    if (analytics.avgResponseTime > 1000) {
      alerts.push({
        id: 2,
        message: `Slow response time: ${analytics.avgResponseTime}ms`,
        severity: 'warning',
        timestamp: new Date().toISOString()
      });
    }

    // Check for pending user approvals
    if (analytics.pendingRegistrations > 0) {
      alerts.push({
        id: 3,
        message: `${analytics.pendingRegistrations} user registrations pending review`,
        severity: 'info',
        timestamp: new Date().toISOString()
      });
    }

    // System health alerts
    if (systemHealth?.status === 'degraded') {
      alerts.push({
        id: 4,
        message: systemHealth.message,
        severity: 'warning',
        timestamp: new Date().toISOString()
      });
    }

    // Add positive alerts for good metrics
    if (analytics.uptime > 99.9) {
      alerts.push({
        id: 5,
        message: `System uptime: ${analytics.uptime}% - Excellent performance`,
        severity: 'success',
        timestamp: new Date().toISOString()
      });
    }

    return alerts.length > 0 ? alerts : [
      {
        id: 1,
        message: 'All systems operational. No issues detected.',
        severity: 'success',
        timestamp: new Date().toISOString()
      }
    ];
  };

  const getHealthStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-500';
      case 'degraded': return 'text-yellow-500';
      case 'down': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getHealthStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return CheckCircleIcon;
      case 'degraded': return ExclamationTriangleIcon;
      case 'down': return ExclamationTriangleIcon;
      default: return CogIcon;
    }
  };

  const getAlertIcon = (severity: string) => {
    switch (severity) {
      case 'warning': return ExclamationTriangleIcon;
      case 'error': return ExclamationTriangleIcon;
      case 'success': return CheckCircleIcon;
      default: return CogIcon;
    }
  };

  const getAlertStyles = (severity: string) => {
    const baseStyles = "p-4 rounded-lg border";
    
    switch (severity) {
      case 'warning':
        return `${baseStyles} bg-yellow-50 border-yellow-200 text-yellow-800`;
      case 'error':
        return `${baseStyles} bg-red-50 border-red-200 text-red-800`;
      case 'success':
        return `${baseStyles} bg-green-50 border-green-200 text-green-800`;
      case 'info':
      default:
        return `${baseStyles} bg-blue-50 border-blue-200 text-blue-800`;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-purple-600 to-indigo-700 rounded-2xl p-6 text-white">
          <div className="animate-pulse">
            <div className="h-6 bg-purple-500 rounded w-1/3 mb-2"></div>
            <div className="h-4 bg-purple-500 rounded w-2/3"></div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error && !stats) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="w-6 h-6 text-red-500 mr-3" />
            <div>
              <h2 className="text-lg font-semibold text-red-800">Error Loading Dashboard</h2>
              <p className="text-red-600">{error}</p>
              <button
                onClick={loadDashboardData}
                className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-700 rounded-2xl p-6 text-white">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold mb-2">Welcome back, Admin!</h1>
            <p className="text-purple-100">
              {systemHealth ? 
                `System is ${systemHealth.status}. ${systemHealth.responseTime}ms avg response time.` :
                'Your actions keep everything functioning efficiently — let\'s get started.'
              }
            </p>
          </div>
          {systemHealth && (
            <div className="flex items-center space-x-2 bg-white/20 rounded-lg px-3 py-2">
              {React.createElement(getHealthStatusIcon(systemHealth.status), {
                className: `w-5 h-5 ${getHealthStatusColor(systemHealth.status)}`
              })}
              <span className="text-sm font-medium capitalize">
                {systemHealth.status}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value={stats?.totalUsers?.toLocaleString() || '0'}
          icon={UserGroupIcon}
          trend={stats?.userGrowth}
          
        />
        <StatCard
          title="Active Issues"
          value={stats?.activeIssues?.toLocaleString() || '0'}
          icon={ExclamationTriangleIcon}
          trend={stats?.issueTrend}
          
        />
        <StatCard
          title="Resolved This Week"
          value={stats?.resolvedThisWeek?.toLocaleString() || '0'}
          icon={ChartBarIcon}
          trend={stats?.resolutionRate}
          
        />
        <StatCard
          title="System Health"
          value={systemHealth ? `${systemHealth.uptime}%` : 'N/A'}
          icon={systemHealth ? getHealthStatusIcon(systemHealth.status) : CogIcon}
          
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="lg:col-span-1">
          <QuickActions userRole={role} />
        </div>

        {/* System Alerts */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">System Alerts</h2>
              <button
                onClick={loadDashboardData}
                className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
              >
                Refresh
              </button>
            </div>
            <div className="space-y-3">
              {systemAlerts.map(alert => {
                const AlertIcon = getAlertIcon(alert.severity);
                return (
                  <div
                    key={alert.id}
                    className={getAlertStyles(alert.severity)}
                  >
                    <div className="flex items-start">
                      <AlertIcon className="w-5 h-5 mt-0.5 mr-3 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{alert.message}</p>
                        {alert.timestamp && (
                          <p className="text-xs opacity-75 mt-1">
                            {new Date(alert.timestamp).toLocaleTimeString()}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <RecentActivity />
    </div>
  );
};

export default AdminDashboard;