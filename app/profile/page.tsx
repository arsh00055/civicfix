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
      setEmailVerified(
        fetchedUser.verification?.email || fetchedUser.isEmailVerified || false,
      );

      try {
        const res = await apiClient.get('/users/stats');
        const data = res.data || res;
        if (currentUser?.role === 'admin') {
          setStats({
            issuesReported: data.totalIssues || 0,
            issuesResolved: data.resolvedIssues || 0,
            achievements: data.totalUsers || 0,
            communityScore: data.points || 0,
          });
        } else if (currentUser?.role === 'volunteer') {
          setStats({
            issuesReported: data.tasksCompleted || 0,
            issuesResolved: data.totalClaimed || 0,
            achievements: data.totalRatings || 0,
            communityScore: data.points || 0,
          });
        } else {
          setStats({
            issuesReported: data.totalReports || 0,
            issuesResolved: data.resolvedReports || 0,
            achievements: data.unlockedAchievements || 0,
            communityScore: data.points || 0,
          });
        }
      } catch {
        console.warn('Could not fetch stats');
      }
    } catch {
      setError('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading />;
  if (error || !user)
    return (
      <Error
        error={error as unknown as Error & { digest?: string }}
        reset={() => {}}
      />
    );

  const isAdmin = currentUser?.role === 'admin';
  const updatedUser = {
    ...user,
    verification: { ...user?.verification, email: emailVerified },
  };

  return (
    <MainLayout role={user?.role}>
      <div className="min-h-screen bg-gray-50/80">
        <div className="max-w-6xl mx-auto px-4 py-6 space-y-5">

          {/* ── Profile Header (stats live here for ALL roles) ── */}
          <ProfileHeader
            user={updatedUser}
            stats={{
              issuesReported: stats.issuesReported,
              issuesResolved: stats.issuesResolved,
              communityScore: stats.communityScore ?? 0,
              achievements: stats.achievements,
            }}
          />

          {/* ── Email verification banner (non-admin, unverified only) ── */}
          {!isAdmin && !emailVerified && (
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 p-4">
              <div className="absolute -right-4 -top-4 w-20 h-20 bg-amber-100 rounded-full opacity-40 pointer-events-none" />
              <div className="relative flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center text-lg shadow-sm shrink-0">
                    ✉️
                  </div>
                  <div>
                    <p className="font-bold text-amber-900 text-sm">Verify your email</p>
                    <p className="text-xs text-amber-600 mt-0.5">
                      {user.email} — Unlock all features
                    </p>
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

          {/* ── Two-column layout ── */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <ProfileSidebar user={updatedUser} />
            </div>

            {/* Main content */}
            <div className="lg:col-span-3 space-y-5">

              {/* ── Profile Overview card (all roles) ── */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <h2 className="text-base font-extrabold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="text-lg">👤</span> Profile Overview
                </h2>

                {/* About / bio */}
                {user.bio ? (
                  <div className="mb-4">
                    <h3 className="text-xs font-extrabold text-gray-400 uppercase tracking-widest mb-1.5">
                      About
                    </h3>
                    <p className="text-sm text-gray-700 leading-relaxed">{user.bio}</p>
                  </div>
                ) : (
                  <div className="mb-4 p-3 bg-gray-50 rounded-xl border border-dashed border-gray-200 text-center">
                    <p className="text-xs text-gray-400 font-medium">
                      No bio added yet.{' '}
                      <button
                        className="text-blue-500 hover:underline font-semibold"
                        onClick={() => window.location.href = '/profile/edit'}
                      >
                        Add one
                      </button>
                    </p>
                  </div>
                )}

                {/* Info grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <InfoRow
                    icon="✉️"
                    label="Email"
                    value={user.email}
                    extra={
                      emailVerified ? (
                        <span className="text-xs bg-green-100 text-green-700 font-bold px-2 py-0.5 rounded-full border border-green-200">
                          Verified
                        </span>
                      ) : (
                        <button
                          onClick={() => setShowEmailModal(true)}
                          className="text-xs bg-amber-100 text-amber-700 font-bold px-2 py-0.5 rounded-full border border-amber-200 hover:bg-amber-200 transition-colors"
                        >
                          Verify
                        </button>
                      )
                    }
                  />
                  {user.phone && <InfoRow icon="📞" label="Phone" value={user.phone} />}
                  {user.address?.city && (
                    <InfoRow
                      icon="📍"
                      label="Location"
                      value={[user.address.street, user.address.city]
                        .filter(Boolean)
                        .join(', ')}
                    />
                  )}
                  {user.joinDate && (
                    <InfoRow
                      icon="📅"
                      label="Member since"
                      value={new Date(user.joinDate).toLocaleDateString('en-US', {
                        month: 'long',
                        year: 'numeric',
                      })}
                    />
                  )}
                </div>
              </div>

              {/* ── Achievements (citizen/volunteer only) ── */}
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

/* ── Small helper component ── */
const InfoRow: React.FC<{
  icon: string;
  label: string;
  value: string;
  extra?: React.ReactNode;
}> = ({ icon, label, value, extra }) => (
  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
    <span className="text-base shrink-0">{icon}</span>
    <div className="min-w-0 flex-1">
      <div className="text-xs font-semibold text-gray-400">{label}</div>
      <div className="text-sm font-bold text-gray-800 truncate">{value}</div>
    </div>
    {extra && <div className="shrink-0">{extra}</div>}
  </div>
);

export default ProfilePage;