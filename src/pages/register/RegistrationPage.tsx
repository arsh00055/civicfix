import React, { useState, Suspense } from 'react';
import PageLoader from '../../components/UI/loading/PageLoader';

const CitizenRegistration = React.lazy(() => import('./components/CitizenRegistration'));
const VolunteerRegistration = React.lazy(() => import('./components/VolunteerRegistration'));

const RegistrationPage: React.FC = () => {
  const [selectedRole, setSelectedRole] = useState<'citizen' | 'volunteer' | null>(null);

  const renderRegistrationForm = () => {
    if (!selectedRole) {
      return (
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Create Your Account</h1>
          <p className="text-gray-600 mb-8">Choose how you want to participate in the community</p>
          
          <div className="grid gap-6 md:grid-cols-2 max-w-2xl mx-auto">
            <div 
              className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow cursor-pointer"
              onClick={() => setSelectedRole('citizen')}
            >
              <div className="text-4xl mb-4">👥</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Citizen</h3>
              <p className="text-gray-600 text-sm mb-4">
                Report issues and stay informed about your community
              </p>
              <ul className="text-sm text-gray-500 space-y-1 mb-4">
                <li>✓ Report local issues</li>
                <li>✓ Track issue progress</li>
                <li>✓ Vote on important matters</li>
                <li>✓ Receive updates</li>
              </ul>
              <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg cursor-pointer hover:bg-blue-700 transition-colors">
                Join as Citizen
              </button>
            </div>

            <div 
              className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow cursor-pointer"
              onClick={() => setSelectedRole('volunteer')}
            >
              <div className="text-4xl mb-4">🛠️</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Volunteer</h3>
              <p className="text-gray-600 text-sm mb-4">
                Help resolve community issues and make a difference
              </p>
              <ul className="text-sm text-gray-500 space-y-1 mb-4">
                <li>✓ Claim tasks</li>
                <li>✓ Earn recognition</li>
                <li>✓ Build skills</li>
                <li>✓ Help your community</li>
              </ul>
              <button className="w-full bg-green-600 text-white py-2 px-4 rounded-lg cursor-pointer hover:bg-green-700 transition-colors">
                Become Volunteer
              </button>
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="text-gray-600">
              Already have an account?{' '}
              <a href="/login" className="text-blue-600 hover:text-blue-500 font-medium">
                Sign in here
              </a>
            </p>
          </div>
        </div>
      );
    }

    return (
      <Suspense fallback={<PageLoader />}>
        {selectedRole === 'citizen' && (
          <CitizenRegistration
            onSuccess={() => window.location.href = '/login?message=registration_success'}
            onSwitchToLogin={() => window.location.href = '/login'}
          />
        )}
        {selectedRole === 'volunteer' && (
          <VolunteerRegistration
            onSuccess={() => window.location.href = '/login?message=registration_success'}
            onSwitchToLogin={() => window.location.href = '/login'}
          />
        )}
      </Suspense>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-4xl">
        {selectedRole && (
          <button
            onClick={() => setSelectedRole(null)}
            className="flex items-center text-sm text-gray-600 hover:text-gray-800 mb-6"
          >
            ← Back to role selection
          </button>
        )}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {renderRegistrationForm()}
        </div>
      </div>
    </div>
  );
};

export default RegistrationPage;