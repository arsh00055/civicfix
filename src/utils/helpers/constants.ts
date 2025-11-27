import process from "process";

export const APP_CONFIG = {
  NAME: 'CommunityFix',
  VERSION: '1.0.0',
  DESCRIPTION: 'Community problem-solving platform',
  API_BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:3000/api',
};

export const USER_ROLES = {
  CITIZEN: 'citizen',
  VOLUNTEER: 'volunteer',
  ADMIN: 'admin',
} as const;

export const ISSUE_STATUS = {
  REPORTED: 'reported',
  IN_REVIEW: 'in_review',
  ASSIGNED: 'assigned',
  IN_PROGRESS: 'in_progress',
  RESOLVED: 'resolved',
  CLOSED: 'closed',
} as const;

export const ISSUE_PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
} as const;

export const ISSUE_CATEGORIES = [
  { value: 'infrastructure', label: 'Infrastructure', color: '#3B82F6' },
  { value: 'safety', label: 'Safety', color: '#EF4444' },
  { value: 'environment', label: 'Environment', color: '#10B981' },
  { value: 'public_services', label: 'Public Services', color: '#F59E0B' },
  { value: 'other', label: 'Other', color: '#6B7280' },
];

export const ACHIEVEMENTS = {
  FIRST_ISSUE: 'first_issue_reported',
  ISSUE_RESOLVED: 'first_issue_resolved',
  COMMUNITY_HELPER: 'community_helper',
  VOLUNTEER_STAR: 'volunteer_star',
  ADMIN_EXPERT: 'admin_expert',
} as const;

export const LOCAL_STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_ROLE: 'user_role',
  THEME: 'theme',
  LANGUAGE: 'language',
} as const;