import React, { useState, Suspense } from 'react';
import { useAuth } from '../../features/auth/hooks/useAuth';
import LoginHeader from './components/LoginHeader';
import LoginRoleSelector from './components/LoginRoleSelector';
import LoginFormContainer from './components/LoginFormContainer';
import PageLoader from '../../components/UI/loading/PageLoader';

const CitizenLogin = React.lazy(() => import('../../features/auth/components/CitizenLogin'));
const VolunteerLogin = React.lazy(() => import('../../features/auth/components/VolunteerLogin'));
const AdminLogin = React.lazy(() => import('../../features/auth/components/AdminLogin'));

const LoginPage: React.FC = () => {
  const [selectedRole, setSelectedRole] = useState<'citizen' | 'volunteer' | 'admin' | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const { isLoading } = useAuth();

  const handleRoleSelect = (role: 'citizen' | 'volunteer' | 'admin') => {
    setIsTransitioning(true);
    setTimeout(() => {
      setSelectedRole(role);
      setIsTransitioning(false);
    }, 300);
  };

  const handleBack = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setSelectedRole(null);
      setIsTransitioning(false);
    }, 300);
  };

  const renderLoginForm = () => {
    if (!selectedRole) return null;

    return (
      <Suspense fallback={
        <div className="flex items-center justify-center py-8">
          <div className="relative">
            <PageLoader />
          </div>
        </div>
      }>
        <div className={`transform transition-all duration-500 ${isTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
          {selectedRole === 'citizen' && <CitizenLogin />}
          {selectedRole === 'volunteer' && <VolunteerLogin />}
          {selectedRole === 'admin' && <AdminLogin />}
        </div>
      </Suspense>
    );
  };

  if (isLoading) {
    return (
      <div className="h-screen bg-white flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-50/50 via-white to-purple-50/50"></div>
        <div className="relative z-10 text-center">
          <PageLoader />
          <p className="mt-6 text-gray-600 font-medium">Preparing your experience...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-white flex relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-50/60 via-white to-purple-50/60"></div>
      
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -left-20 top-1/4 w-80 h-80 bg-blue-200/40 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute -left-32 bottom-1/4 w-64 h-64 bg-cyan-200/30 rounded-full blur-3xl animate-pulse-slower"></div>
        
        <div className="absolute -right-20 top-1/3 w-80 h-80 bg-purple-200/40 rounded-full blur-3xl animate-pulse-slow delay-1000"></div>
        <div className="absolute -right-32 bottom-1/3 w-64 h-64 bg-pink-200/30 rounded-full blur-3xl animate-pulse-slower delay-1500"></div>
      
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gray-100/20 rounded-full blur-3xl"></div>
      </div>

      <style>{`
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.6; }
        }
        @keyframes pulse-slower {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.5; }
        }
        .animate-pulse-slow {
          animation: pulse-slow 4s ease-in-out infinite;
        }
        .animate-pulse-slower {
          animation: pulse-slower 6s ease-in-out infinite;
        }
      `}</style>

      <div className="flex-1 flex flex-col relative z-10">
        {!selectedRole && (
          <div className="pt-8 px-6">
            <LoginHeader />
          </div>
        )}

        <div className="flex-1 flex items-center justify-center px-6 pb-8">
          <div className="w-full max-w-4xl mx-auto">
            <div className={`transform transition-all duration-500 ease-out ${
              isTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
            }`}>
              {!selectedRole ? (
                <LoginRoleSelector onRoleSelect={handleRoleSelect} />
              ) : (
                <LoginFormContainer 
                  onBack={handleBack}
                  form={renderLoginForm()}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;