// 'use client';

// import React, { useState, useEffect } from 'react';
// import MainLayout from '@/components/layout/MainLayout';
// import ProfileHeader from './components/ProfileHeader';
// import ProfileSidebar from './components/ProfileSidebar';
// import Loading from '@/app/loading';
// import Error from '@/app/error';
// import AchievementsSection from './components/AchievementsSection';
// import { useAuth } from '@/features/auth/hooks/useAuth';
// import apiClient from '@/lib/services/api/client';
// import VerificationModal from './components/VerificationModal';

// interface UserStats {
//   communityScore: number;
//   issuesReported: number;
//   issuesResolved: number;
//   achievements: number;
// }

// const ProfilePage: React.FC = () => {
//   const { user: currentUser } = useAuth();
//   const [user, setUser] = useState<any>(null);
//   const [stats, setStats] = useState<UserStats>({ communityScore: 0, issuesReported: 0, issuesResolved: 0, achievements: 0 });
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [emailVerified, setEmailVerified] = useState(false);
//   const [showEmailModal, setShowEmailModal] = useState(false);

//   useEffect(() => { if (currentUser) fetchUserData(); }, [currentUser]);

//   const fetchUserData = async () => {
//     try {
//       setLoading(true); setError(null);
//       if (!currentUser?.id) { setError('User not authenticated'); setLoading(false); return; }
//       const userResponse = await apiClient.get('/users/profile');
//       const userData = userResponse.data || userResponse;
//       const fetchedUser = userData.user || userData;
//       setUser(fetchedUser);
//       setEmailVerified(fetchedUser.verification?.email || fetchedUser.isEmailVerified || false);
//       try {
//         const res = await apiClient.get('/users/stats');
//         const data = res.data || res;
//         if (currentUser?.role === 'admin') {
//           setStats({ issuesReported: data.totalIssues || 0, issuesResolved: data.resolvedIssues || 0, achievements: data.totalUsers || 0, communityScore: data.points || 0 });
//         } else if (currentUser?.role === 'volunteer') {
//           setStats({ issuesReported: data.tasksCompleted || 0, issuesResolved: data.totalClaimed || 0, achievements: data.totalRatings || 0, communityScore: data.points || 0 });
//         } else {
//           setStats({ issuesReported: data.totalReports || 0, issuesResolved: data.resolvedReports || 0, achievements: data.unlockedAchievements || 0, communityScore: data.points || 0 });
//         }
//       } catch { console.warn('Could not fetch stats'); }
//     } catch (err) {
//       setError('Failed to load profile data');
//     } finally { setLoading(false); }
//   };

//   if (loading) return <Loading />;
//   if (error || !user) return <Error error={error as unknown as Error & { digest?: string }} reset={() => {}} />;

//   const isAdmin = currentUser?.role === 'admin';
//   const updatedUser = { ...user, verification: { ...user?.verification, email: emailVerified } };

//   return (
//     <MainLayout role={user?.role}>
//       {/* FIX: px-3 on mobile */}
//       <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8">
//         <div className="max-w-6xl mx-auto">
//           <ProfileHeader
//             user={updatedUser}
//             stats={{ issuesReported: stats.issuesReported, issuesResolved: stats.issuesResolved, communityScore: stats.communityScore ?? 0, achievements: stats.achievements }}
//           />

//           <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6 mt-4 sm:mt-6">
//             {/* Sidebar */}
//             <div className="lg:col-span-1">
//               <ProfileSidebar user={updatedUser} />
//             </div>

//             {/* Main Content */}
//             <div className="lg:col-span-3 space-y-4 sm:space-y-6">
//               {!isAdmin && <AchievementsSection />}

//               {isAdmin && (
//                 <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
//                   <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-5 flex items-center gap-4">
//                     <div className="w-10 sm:w-12 h-10 sm:h-12 rounded-xl bg-blue-100 flex items-center justify-center text-xl sm:text-2xl flex-shrink-0">📋</div>
//                     <div className="min-w-0">
//                       <div className="text-xl sm:text-2xl font-bold text-gray-900">{stats.issuesReported}</div>
//                       <div className="text-xs sm:text-sm text-gray-500">Total Issues</div>
//                     </div>
//                   </div>
//                   <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-5 flex items-center gap-4">
//                     <div className="w-10 sm:w-12 h-10 sm:h-12 rounded-xl bg-green-100 flex items-center justify-center text-xl sm:text-2xl flex-shrink-0">✅</div>
//                     <div className="min-w-0">
//                       <div className="text-xl sm:text-2xl font-bold text-gray-900">{stats.issuesResolved}</div>
//                       <div className="text-xs sm:text-sm text-gray-500">Resolved Issues</div>
//                     </div>
//                   </div>
//                   <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-5 flex items-center gap-4">
//                     <div className="w-10 sm:w-12 h-10 sm:h-12 rounded-xl bg-purple-100 flex items-center justify-center text-xl sm:text-2xl flex-shrink-0">👥</div>
//                     <div className="min-w-0">
//                       <div className="text-xl sm:text-2xl font-bold text-gray-900">{stats.achievements}</div>
//                       <div className="text-xs sm:text-sm text-gray-500">Total Citizens</div>
//                     </div>
//                   </div>
//                 </div>
//               )}

//               {!isAdmin && !emailVerified && (
//                 <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
//                   <div className="flex items-center gap-3 sm:gap-4">
//                     <div className="text-2xl sm:text-3xl p-2 sm:p-3 rounded-full bg-yellow-100 flex-shrink-0">✉️</div>
//                     <div className="min-w-0">
//                       <p className="font-semibold text-sm sm:text-base text-yellow-800">Verify your Email</p>
//                       <p className="text-xs sm:text-sm mt-0.5 text-yellow-700 truncate">{user.email} — Please verify to access all features</p>
//                     </div>
//                   </div>
//                   <button
//                     onClick={() => setShowEmailModal(true)}
//                     className="flex-shrink-0 px-4 sm:px-5 py-2 sm:py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors w-full sm:w-auto text-center"
//                   >
//                     Verify Now →
//                   </button>
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       </div>

//       {showEmailModal && (
//         <VerificationModal
//           type="email"
//           onClose={() => setShowEmailModal(false)}
//           onSuccess={(type) => { if (type === 'email') setEmailVerified(true); setShowEmailModal(false); }}
//           userEmail={user.email}
//           userPhone={user.phone}
//           phoneVerified={user.verification?.phone || false}
//         />
//       )}
//     </MainLayout>
//   );
// };

// export default ProfilePage;



'use client';

import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import ProfileHeader from './components/ProfileHeader';
import ProfileSidebar from './components/ProfileSidebar';
import Loading from '@/app/loading';
import Error from '@/app/error';
import AchievementsSection from './components/AchievementsSection';
import { useAuth } from '@/features/auth/hooks/useAuth';
import apiClient from '@/lib/services/api/client';
import VerificationModal from './components/VerificationModal';

interface UserStats {
  communityScore: number;
  issuesReported: number;
  issuesResolved: number;
  achievements: number;
}

const ProfilePage: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<UserStats>({
    communityScore: 0,
    issuesReported: 0,
    issuesResolved: 0,
    achievements: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [emailVerified, setEmailVerified] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);

  useEffect(() => {
    if (currentUser) fetchUserData();
  }, [currentUser]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      setError(null);
      if (!currentUser?.id) { setError('User not authenticated'); setLoading(false); return; }

      const userResponse = await apiClient.get('/users/profile');
      const userData = userResponse.data || userResponse;
      const fetchedUser = userData.user || userData;
      setUser(fetchedUser);
      setEmailVerified(fetchedUser.verification?.email || fetchedUser.isEmailVerified || false);

      try {
        const res = await apiClient.get('/users/stats');
        const data = res.data || res;
        if (currentUser?.role === 'admin') {
          setStats({ issuesReported: data.totalIssues || 0, issuesResolved: data.resolvedIssues || 0, achievements: data.totalUsers || 0, communityScore: data.points || 0 });
        } else if (currentUser?.role === 'volunteer') {
          setStats({ issuesReported: data.tasksCompleted || 0, issuesResolved: data.totalClaimed || 0, achievements: data.totalRatings || 0, communityScore: data.points || 0 });
        } else {
          setStats({ issuesReported: data.totalReports || 0, issuesResolved: data.resolvedReports || 0, achievements: data.unlockedAchievements || 0, communityScore: data.points || 0 });
        }
      } catch { console.warn('Could not fetch stats'); }

    } catch (err) {
      setError('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading />;
  if (error || !user) return <Error error={error as unknown as Error & { digest?: string }} reset={() => {}} />;

  const isAdmin = currentUser?.role === 'admin';
  const updatedUser = { ...user, verification: { ...user?.verification, email: emailVerified } };

  return (
    <MainLayout role={user?.role}>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">

          {/* Profile Header Card */}
          <ProfileHeader
            user={updatedUser}
            stats={{
              issuesReported: stats.issuesReported,
              issuesResolved: stats.issuesResolved,
              communityScore: stats.communityScore ?? 0,
              achievements: stats.achievements,
            }}
          />

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <ProfileSidebar user={updatedUser} />
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3 space-y-5">

              {/* Email Verification Banner */}
              {!isAdmin && !emailVerified && (
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 p-5">
                  <div className="absolute -right-6 -top-6 w-24 h-24 bg-amber-100 rounded-full opacity-60" />
                  <div className="relative flex items-center justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 bg-amber-100 rounded-xl flex items-center justify-center text-xl shadow-sm shrink-0">
                        ✉️
                      </div>
                      <div>
                        <p className="font-bold text-amber-900 text-sm">Verify your Email</p>
                        <p className="text-xs text-amber-600 mt-0.5">{user.email} — Unlock all features</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowEmailModal(true)}
                      className="shrink-0 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-bold rounded-xl transition-all shadow-sm hover:shadow-md active:scale-95"
                    >
                      Verify Now →
                    </button>
                  </div>
                </div>
              )}

              {/* Admin Stats */}
              {isAdmin && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    { icon: '📋', value: stats.issuesReported, label: 'Total Issues', gradient: 'from-blue-500 to-blue-600', light: 'bg-blue-50 border-blue-100' },
                    { icon: '✅', value: stats.issuesResolved, label: 'Resolved', gradient: 'from-emerald-500 to-green-600', light: 'bg-emerald-50 border-emerald-100' },
                    { icon: '👥', value: stats.achievements, label: 'Citizens', gradient: 'from-purple-500 to-purple-600', light: 'bg-purple-50 border-purple-100' },
                  ].map((item) => (
                    <div key={item.label} className={`${item.light} rounded-2xl border p-5 flex items-center gap-4`}>
                      <div className={`w-12 h-12 bg-gradient-to-br ${item.gradient} rounded-xl flex items-center justify-center text-xl shadow-sm`}>
                        {item.icon}
                      </div>
                      <div>
                        <div className="text-2xl font-black text-gray-900">{item.value}</div>
                        <div className="text-xs font-medium text-gray-500 mt-0.5">{item.label}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Achievements */}
              {!isAdmin && <AchievementsSection />}

            </div>
          </div>
        </div>
      </div>

      {showEmailModal && (
        <VerificationModal
          type="email"
          onClose={() => setShowEmailModal(false)}
          onSuccess={(type) => {
            if (type === 'email') setEmailVerified(true);
            setShowEmailModal(false);
          }}
          userEmail={user.email}
          userPhone={user.phone}
          phoneVerified={user.verification?.phone || false}
        />
      )}
    </MainLayout>
  );
};

export default ProfilePage;