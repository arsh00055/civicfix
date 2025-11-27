import React, { Suspense } from 'react';
import { useAuth } from '../../features/auth/hooks/useAuth';
import MainLayout from '../../components/layout/MainLayout';
import ContentLoader from '../../components/UI/loading/ContentLoader';
import SkeletonLoader from '../../components/UI/loading/SkeletonLoader';
import PageLoader from '../../components/UI/loading/PageLoader';

const CitizenDashboard = React.lazy(() => import('../../features/dashboard/components/CitizenDashboard'));
const VolunteerDashboard = React.lazy(() => import('../../features/dashboard/components/VolunteerDashboard'));
const AdminDashboard = React.lazy(() => import('../../features/dashboard/components/AdminDashboard'));

const DashboardPage: React.FC = () => {
  const { userRole, isLoading } = useAuth();

  const renderDashboard = () => {
    switch (userRole) {
      case 'citizen':
        return <CitizenDashboard role={userRole} />;
      case 'volunteer':
        return <VolunteerDashboard role={userRole} />;
      case 'admin':
        return <AdminDashboard role={userRole} />;
      default:
        return (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Welcome to CommunityFix</h2>
            <p className="text-gray-600">Please log in to access your dashboard.</p>
          </div>
        );
    }
  };

  const skeleton = (
    <div className="space-y-6">
      <SkeletonLoader type="card" count={1} />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <SkeletonLoader type="card" count={4} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <SkeletonLoader type="card" count={2} />
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <MainLayout role={userRole}>
        <PageLoader />
      </MainLayout>
    );
  }

  return (
    <MainLayout role={userRole}>
      <ContentLoader
        isLoading={false}
        skeleton={skeleton}
      >
        <Suspense fallback={skeleton}>
          {renderDashboard()}
        </Suspense>
      </ContentLoader>
    </MainLayout>
  );
};

export default DashboardPage;