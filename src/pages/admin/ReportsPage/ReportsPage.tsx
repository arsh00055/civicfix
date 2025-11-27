import React, { useState, useEffect, Suspense } from 'react';
import { adminAPI, analyticsAPI } from '../../../services/api/endpoints';
import { useAppSelector } from '../../../app/store/hooks';
import Sidebar from '../../../components/layout/sidebar/Sidebar';
import Header from '../../../components/layout/Header/Header';
import type { Report, ReportType, ReportFormat } from '../../../types/reports.type';

// Lazy-loaded components
import {
  ReportsHeader,
  ErrorBanner,
  ReportGenerator,
  ReportsList,
  LoadingState,
  ErrorState
} from './components/lazy';

interface ReportsProps {
  role: string | null;
}

const ReportsPage: React.FC<ReportsProps> = ({ role }) => {
  const sidebarOpen = useAppSelector((state) => state.ui.sidebarOpen);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await adminAPI.getReports();
      setReports(response.data);
      
    } catch (err) {
      console.error('Failed to fetch reports:', err);
      setError('Failed to load reports. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async (type: ReportType, format: ReportFormat) => {
    const reportId = `${type}-${format}-${Date.now()}`;
    setGenerating(reportId);
    setError(null);

    try {
      // Generate report using analytics API
      const response = await analyticsAPI.exportAnalytics(format);
      const reportData = response.data;

      const newReport: Report = {
        id: reportId,
        title: `${type.charAt(0).toUpperCase() + type.slice(1)} Report`,
        description: getReportDescription(type),
        type,
        format,
        generatedAt: new Date().toISOString(),
        period: getReportPeriod(),
        downloadUrl: reportData.downloadUrl,
        status: 'completed',
        fileSize: reportData.fileSize
      };

      setReports(prev => [newReport, ...prev]);

    } catch (err) {
      console.error('Failed to generate report:', err);
      setError(`Failed to generate ${type} report. Please try again.`);
      
      // Add failed report to list
      const failedReport: Report = {
        id: reportId,
        title: `${type.charAt(0).toUpperCase() + type.slice(1)} Report`,
        description: getReportDescription(type),
        type,
        format,
        generatedAt: new Date().toISOString(),
        period: getReportPeriod(),
        status: 'failed'
      };
      
      setReports(prev => [failedReport, ...prev]);
    } finally {
      setGenerating(null);
    }
  };

  const getReportDescription = (type: ReportType): string => {
    switch (type) {
      case 'issues':
        return 'Comprehensive overview of all issues reported, resolved, and in progress';
      case 'users':
        return 'Detailed analysis of user registration, activity patterns, and demographics';
      case 'performance':
        return 'Platform performance metrics and volunteer performance statistics';
      case 'financial':
        return 'Financial overview and resource allocation analysis';
      case 'system':
        return 'System health metrics and platform usage statistics';
      default:
        return 'Automatically generated system report';
    }
  };

  const getReportPeriod = (): string => {
    const now = new Date();
    const month = now.toLocaleString('default', { month: 'long' });
    const year = now.getFullYear();
    return `${month} ${year}`;
  };

  const handleRetry = () => {
    fetchReports();
  };

  const handleDownload = async (report: Report) => {
    if (!report.downloadUrl) return;

    try {
      // Trigger download
      const link = document.createElement('a');
      link.href = report.downloadUrl;
      link.download = `${report.title.toLowerCase().replace(/\s+/g, '-')}.${report.format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Failed to download report:', err);
      setError('Failed to download report. Please try again.');
    }
  };

  const handleRegenerate = (report: Report) => {
    generateReport(report.type, report.format);
  };

  // Loading state
  if (loading && !reports.length) {
    return (
      <div className="flex h-screen bg-gray-50">
        {sidebarOpen && <Sidebar />}
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header userRole={role} />
          <main className="flex-1 overflow-auto p-6">
            <Suspense fallback={<div>Loading...</div>}>
              <LoadingState />
            </Suspense>
          </main>
        </div>
      </div>
    );
  }

  // Error state (when no data exists)
  if (error && !reports.length) {
    return (
      <div className="flex h-screen bg-gray-50">
        {sidebarOpen && <Sidebar />}
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header userRole={role} />
          <main className="flex-1 overflow-auto p-6">
            <Suspense fallback={<div>Loading...</div>}>
              <ErrorState error={error} onRetry={handleRetry} />
            </Suspense>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {sidebarOpen && <Sidebar />}
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header userRole={role} />
        <main className="flex-1 overflow-auto p-6">
          <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {/* Header */}
              <Suspense fallback={<div>Loading header...</div>}>
                <ReportsHeader onRefresh={handleRetry} />
              </Suspense>

              {/* Error Banner */}
              <Suspense fallback={<div>Loading error banner...</div>}>
                <ErrorBanner error={error} onDismiss={() => setError(null)} />
              </Suspense>

              {/* Report Generation */}
              <Suspense fallback={<div>Loading report generator...</div>}>
                <ReportGenerator 
                  generating={generating} 
                  onGenerateReport={generateReport} 
                />
              </Suspense>

              {/* Reports List */}
              <Suspense fallback={<div>Loading reports list...</div>}>
                <ReportsList 
                  reports={reports} 
                  onDownload={handleDownload}
                  onRegenerate={handleRegenerate}
                />
              </Suspense>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ReportsPage;