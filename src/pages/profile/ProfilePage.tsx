import React from 'react';
import MainLayout from '../../components/layout/MainLayout';
import ProfileHeader from '../../features/profile/components/ProfileHeader';
import ProfileSidebar from '../../features/profile/components/ProfileSidebar';
import AchievementsSection from '../../features/profile/components/AchievementsSection';
import ActivityTimeline from '../../features/profile/components/ActitivityTimeline';

const ProfilePage: React.FC = () => {
  const user = {
    id: 'user-12345',
    name: 'John Doe',
    email: 'john.doe@example.com',
    role: 'citizen' as const,
    avatar: '/images/avatar-placeholder.png',
    bio: 'Active community member passionate about improving our neighborhood.',
    phone: '+1 (555) 123-4567',
    address: '123 Main Street, Apt 4B, New York, NY 10001',
    skills: [], // Citizens typically don't have skills
    availability: [], // Citizens typically don't have availability
    organization: undefined, // Citizens don't belong to organizations
    joinDate: '2023-01-15',
    reputation: 85,
    completedIssues: 12,
    responseTime: undefined, // Only for volunteers
    verification: {
      email: true,
      phone: true,
      identity: false
    },
    preferences: {
      notifications: {
        email: true,
        push: true,
        sms: false,
        issueUpdates: true,
        communityNews: true,
        volunteerOpportunities: false,
        digestFrequency: 'daily' as const
      },
      location: {
        shareLocation: true,
        notificationRadius: 5,
        preferredAreas: ["Fatehgarsh Sahib", "Chandigarh"]
      },
      privacy: {
        profileVisible: true,
        activityPublic: true,
        showEmail: false,
        showPhone: false
      }
    }
  };

  const stats = {
    issuesReported: 12,
    issuesResolved: 8,
    communityScore: 85,
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Profile Header */}
        <ProfileHeader user={user} stats={stats} />
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <ProfileSidebar user={user} />
          </div>
          
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            <AchievementsSection />
            <ActivityTimeline />
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default ProfilePage;