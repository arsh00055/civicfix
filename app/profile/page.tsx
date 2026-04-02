// // 'use client';

// // import React, { useState, useEffect } from 'react';
// // import MainLayout from '@/components/layout/MainLayout';
// // import ProfileHeader from './components/ProfileHeader';
// // import ProfileSidebar from './components/ProfileSidebar';
// // import Loading from '@/app/loading'
// // import Error from '@/app/error'
// // import AchievementsSection from './components/AchievementsSection';
// // import { useAuth } from '@/features/auth/hooks/useAuth';
// // import apiClient from '@/lib/services/api/client';

// // interface UserStats {
// //   communityScore: number;
// //   issuesReported: number;
// //   issuesResolved: number;
// //   achievements: number;
// // }

// // const ProfilePage: React.FC = () => {

// //   const { user: currentUser, refreshUser } = useAuth();
// //   const [user, setUser] = useState<any>(null);
// //   const [stats, setStats] = useState<UserStats>({
// //     communityScore: 0,
// //     issuesReported: 0,
// //     issuesResolved: 0,
// //     achievements: 0
// //   });
// //   const [achievements, setAchievements] = useState<any[]>([]);
// //   const [loading, setLoading] = useState(true);
// //   const [error, setError] = useState<string | null>(null);

// //   useEffect(() => {
// //     if (currentUser) {
// //       fetchUserData();
// //     }
// //   }, [currentUser]);

// //   const fetchUserData = async () => {
// //     try {
// //       setLoading(true);
// //       setError(null);

// //       if (!currentUser?.id) {
// //         setError('User not authenticated');
// //         setLoading(false);
// //         return;
// //       }

// //       const userResponse = await apiClient.get('/users/profile');
// //       const userData = userResponse.data || userResponse;
// //       setUser(userData.user || userData);

// //       try {
// //         const userDetailResponse = await apiClient.get(`/users/${currentUser.id}`);
// //         const userDetail = userDetailResponse.data || userDetailResponse;
// //         if (userDetail.user?.stats) {
// //           setStats({
// //             issuesReported: userDetail.user.stats.issuesReported || 0,
// //             issuesResolved: userDetail.user.stats.issuesResolved || 0,
// //             achievements: userDetail.user.stats.achievements || 0,
// //             communityScore: userDetail.user.stats.communityScore || 0
// //           });
// //         }
// //       } catch (err) {
// //         console.warn('Could not fetch user details, using default stats');
// //       }

// //       try {
// //         const achievementsResponse = await apiClient.get('/achievements');
// //         const achievementsData = achievementsResponse.data || achievementsResponse;
// //         setAchievements(achievementsData.achievements || achievementsData || []);
// //       } catch (err) {
// //         console.warn('Could not fetch achievements');
// //       }

// //     } catch (err) {
// //       console.error('Failed to fetch user data:', err);
// //       setError('Failed to load profile data');
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   if (loading) {
// //     return (<Loading />);
// //   }

// //   if (error || !user) {
// //     return (<Error error={error as unknown as Error & { digest?: string | undefined }} reset={() => {}} />);
// //   }

// //   return (
// //     <MainLayout role={user?.role}>
// //       <div className="container mx-auto px-4 py-8">
// //         <div className="max-w-6xl mx-auto">
// //           <ProfileHeader user={user} stats={{ 
// //             issuesReported: stats.issuesReported, 
// //             issuesResolved: stats.issuesResolved, 
// //             communityScore: stats.communityScore ?? 0 
// //           }} />
          
// //           <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mt-6">
// //             <div className="lg:col-span-1">
// //               <ProfileSidebar user={user} />
// //             </div>
            
// //             <div className="lg:col-span-3 space-y-6">
// //               <AchievementsSection />
// //             </div>
// //           </div>
// //         </div>
// //       </div>
// //     </MainLayout>
// //   );
// // };

// // export default ProfilePage;



// 'use client';

// import React, { useState, useEffect } from 'react';
// import MainLayout from '@/components/layout/MainLayout';
// import ProfileHeader from './components/ProfileHeader';
// import ProfileSidebar from './components/ProfileSidebar';
// import Loading from '@/app/loading'
// import Error from '@/app/error'
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
//   const { user: currentUser, refreshUser } = useAuth();
//   const [user, setUser] = useState<any>(null);
//   const [stats, setStats] = useState<UserStats>({
//     communityScore: 0,
//     issuesReported: 0,
//     issuesResolved: 0,
//     achievements: 0
//   });
//   const [achievements, setAchievements] = useState<any[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [emailVerified, setEmailVerified] = useState(false);
//   const [showEmailModal, setShowEmailModal] = useState(false);

//   useEffect(() => {
//     if (currentUser) {
//       fetchUserData();
//     }
//   }, [currentUser]);

//   const fetchUserData = async () => {
//     try {
//       setLoading(true);
//       setError(null);

//       if (!currentUser?.id) {
//         setError('User not authenticated');
//         setLoading(false);
//         return;
//       }

//       const userResponse = await apiClient.get('/users/profile');
//       const userData = userResponse.data || userResponse;
//       const fetchedUser = userData.user || userData;
//       setUser(fetchedUser);
//       setEmailVerified(fetchedUser.verification?.email || false);

//       try {
//         const userDetailResponse = await apiClient.get(`/users/${currentUser.id}`);
//         const userDetail = userDetailResponse.data || userDetailResponse;
//         if (userDetail.user?.stats) {
//           setStats({
//             issuesReported: userDetail.user.stats.issuesReported || 0,
//             issuesResolved: userDetail.user.stats.issuesResolved || 0,
//             achievements: userDetail.user.stats.achievements || 0,
//             communityScore: userDetail.user.stats.communityScore || 0
//           });
//         }
//       } catch (err) {
//         console.warn('Could not fetch user details');
//       }

//       try {
//         const achievementsResponse = await apiClient.get('/achievements');
//         const achievementsData = achievementsResponse.data || achievementsResponse;
//         setAchievements(achievementsData.achievements || achievementsData || []);
//       } catch (err) {
//         console.warn('Could not fetch achievements');
//       }

//     } catch (err) {
//       console.error('Failed to fetch user data:', err);
//       setError('Failed to load profile data');
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (loading) return <Loading />;
//   if (error || !user) return <Error error={error as unknown as Error & { digest?: string }} reset={() => {}} />;

//   return (
//     <MainLayout role={user?.role}>
//       <div className="container mx-auto px-4 py-8">
//         <div className="max-w-6xl mx-auto">
//           <ProfileHeader user={user} stats={{ 
//             issuesReported: stats.issuesReported, 
//             issuesResolved: stats.issuesResolved, 
//             communityScore: stats.communityScore ?? 0 
//           }} />
          
//           <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mt-6">
//             {/* Sidebar */}
//             <div className="lg:col-span-1">
//               <ProfileSidebar user={user} />
//             </div>
            
//             {/* Main Content */}
//             <div className="lg:col-span-3 space-y-6">
//               <AchievementsSection />

//               {/* Email Verification Banner */}
//               <div className={`rounded-xl border p-5 flex items-center justify-between gap-4 ${
//                 emailVerified 
//                   ? 'bg-green-50 border-green-200' 
//                   : 'bg-yellow-50 border-yellow-200'
//               }`}>
//                 <div className="flex items-center gap-4">
//                   <div className={`text-3xl p-3 rounded-full ${
//                     emailVerified ? 'bg-green-100' : 'bg-yellow-100'
//                   }`}>
//                     {emailVerified ? '✅' : '✉️'}
//                   </div>
//                   <div>
//                     <p className={`font-semibold text-base ${
//                       emailVerified ? 'text-green-800' : 'text-yellow-800'
//                     }`}>
//                       {emailVerified ? 'Email Verified' : 'Verify your Email'}
//                     </p>
//                     <p className={`text-sm mt-0.5 ${
//                       emailVerified ? 'text-green-600' : 'text-yellow-700'
//                     }`}>
//                       {emailVerified 
//                         ? `${user.email} is verified ✓` 
//                         : `${user.email} — Please verify to access all features`
//                       }
//                     </p>
//                   </div>
//                 </div>

//                 {!emailVerified && (
//                   <button
//                     onClick={() => setShowEmailModal(true)}
//                     className="shrink-0 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors"
//                   >
//                     Verify Now →
//                   </button>
//                 )}
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Email Verification Modal */}
//       {showEmailModal && (
//         <VerificationModal
//           type="email"
//           onClose={() => setShowEmailModal(false)}
//           onSuccess={(type) => {
//             if (type === 'email') {
//               setEmailVerified(true);
//             }
//             setShowEmailModal(false);
//           }}
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

      if (!currentUser?.id) {
        setError('User not authenticated');
        setLoading(false);
        return;
      }

      const userResponse = await apiClient.get('/users/profile');
      const userData = userResponse.data || userResponse;
      const fetchedUser = userData.user || userData;
      setUser(fetchedUser);

      // ✅ Database ਤੋਂ email verified status ਲਓ
      setEmailVerified(fetchedUser.verification?.email || false);

      try {
        const userDetailResponse = await apiClient.get(`/users/${currentUser.id}`);
        const userDetail = userDetailResponse.data || userDetailResponse;
        if (userDetail.user?.stats) {
          setStats({
            issuesReported: userDetail.user.stats.issuesReported || 0,
            issuesResolved: userDetail.user.stats.issuesResolved || 0,
            achievements: userDetail.user.stats.achievements || 0,
            communityScore: userDetail.user.stats.communityScore || 0,
          });
        }
      } catch {
        console.warn('Could not fetch user details');
      }

    } catch (err) {
      console.error('Failed to fetch user data:', err);
      setError('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading />;
  if (error || !user) return <Error error={error as unknown as Error & { digest?: string }} reset={() => {}} />;

  return (
    <MainLayout role={user?.role}>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <ProfileHeader
            user={user}
            stats={{
              issuesReported: stats.issuesReported,
              issuesResolved: stats.issuesResolved,
              communityScore: stats.communityScore ?? 0,
            }}
          />

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mt-6">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <ProfileSidebar user={user} />
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3 space-y-6">
              <AchievementsSection />

              {/* ✅ Email Verification Banner - sirf unverified ਤੇ show ਕਰੋ */}
              {!emailVerified && (
                <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="text-3xl p-3 rounded-full bg-yellow-100">✉️</div>
                    <div>
                      <p className="font-semibold text-base text-yellow-800">
                        Verify your Email
                      </p>
                      <p className="text-sm mt-0.5 text-yellow-700">
                        {user.email} — Please verify to access all features
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowEmailModal(true)}
                    className="shrink-0 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors"
                  >
                    Verify Now →
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Email Verification Modal */}
      {showEmailModal && (
        <VerificationModal
          type="email"
          onClose={() => setShowEmailModal(false)}
          onSuccess={(type) => {
            if (type === 'email') {
              setEmailVerified(true); // ✅ Banner ਤੁਰੰਤ ਹੱਟ ਜਾਵੇਗਾ
            }
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