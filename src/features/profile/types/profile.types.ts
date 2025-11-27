import type { UserProfile } from '../../../types';

export interface ProfileStats {
  issuesReported: number;
  issuesResolved: number;
  commentsPosted: number;
  votesCast: number;
  communityScore: number;
  responseTime?: number; // For volunteers
  completionRate?: number; // For volunteers
}

export interface Skill {
  name: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  category: string;
}

export interface VolunteerInfo {
  skills: Skill[];
  availability: string[];
  organization?: string;
  experienceLevel: 'new' | 'experienced' | 'expert';
  completedTasks: number;
  rating: number;
  responseTime: number; // in hours
}

export interface ProfileUpdateData {
  name?: string;
  email?: string;
  bio?: string;
  phone?: string;
  address?: string;
  avatar?: string;
  skills?: string[];
  availability?: string[];
}

export interface PreferenceUpdateData {
  notifications?: Partial<UserProfile['preferences']['notifications']>;
  location?: Partial<UserProfile['preferences']['location']>;
  privacy?: Partial<UserProfile['preferences']['privacy']>;
}