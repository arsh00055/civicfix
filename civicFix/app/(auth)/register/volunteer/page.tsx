'use client';

import VolunteerRegistration from '../components/VolunteerRegistration';
import { useRouter } from 'next/navigation';

export default function VolunteerRegisterPage() {
  const router = useRouter();

  const handleSuccess = () => {
    router.push('/login?message=pending_approval');
  };

  const handleSwitchToLogin = () => {
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-4xl">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <button
            onClick={() => router.push('/login')}
            className="flex items-center text-sm text-gray-600 hover:text-gray-800 mb-6"
          >
            ← Back to Login
          </button>
          
          <VolunteerRegistration
            onSuccess={handleSuccess}
            onSwitchToLogin={handleSwitchToLogin}
          />
        </div>
      </div>
    </div>
  );
}