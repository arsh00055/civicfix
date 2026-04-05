// Application Configuration
export const APP_CONFIG = {
  NAME: 'CIVICFIX',
  VERSION: '1.0.0',
  DESCRIPTION: 'Community Issue Reporting and Resolution Platform',
  COMPANY: 'CommunityFix Inc.',
  COPYRIGHT: `© ${new Date().getFullYear()} CIVICFIX. All rights reserved.`,
  SUPPORT_EMAIL: 'support@civicfix.com',
  SUPPORT_PHONE: '+1 (555) 123-4567',
};

// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || '/api',
  TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
};

// Authentication & Security
export const AUTH_CONFIG = {
  TOKEN_KEY: 'civicfix_auth_token',
  USER_KEY: 'civicfix_user_data',
  REFRESH_TOKEN_KEY: 'civicfix_refresh_token',
  SESSION_DURATION: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_REGEX: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
};

// User Roles
export const USER_ROLES = {
  CITIZEN: 'citizen',
  VOLUNTEER: 'volunteer',
  ADMIN: 'admin',
} as const;

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];

// Issue Management
export const ISSUE_STATUS = {
  REPORTED: 'reported',
  IN_REVIEW: 'in_review',
  ASSIGNED: 'assigned',
  IN_PROGRESS: 'in_progress',
  RESOLVED: 'resolved',
  CLOSED: 'closed',
} as const;

export type IssueStatus = typeof ISSUE_STATUS[keyof typeof ISSUE_STATUS];

export const ISSUE_PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
} as const;

export type IssuePriority = typeof ISSUE_PRIORITY[keyof typeof ISSUE_PRIORITY];

export const ISSUE_CATEGORIES = [
  { 
    value: 'infrastructure', 
    label: 'Infrastructure', 
    color: '#3B82F6',
    icon: '🏗️',
    description: 'Roads, bridges, public buildings, utilities'
  },
  { 
    value: 'safety', 
    label: 'Safety & Security', 
    color: '#EF4444',
    icon: '🛡️',
    description: 'Crime, accidents, hazardous conditions'
  },
  { 
    value: 'environment', 
    label: 'Environment', 
    color: '#10B981',
    icon: '🌳',
    description: 'Pollution, waste management, green spaces'
  },
  { 
    value: 'public_services', 
    label: 'Public Services', 
    color: '#F59E0B',
    icon: '🏛️',
    description: 'Schools, hospitals, transportation, utilities'
  },
  { 
    value: 'community', 
    label: 'Community', 
    color: '#8B5CF6',
    icon: '👥',
    description: 'Events, facilities, community programs'
  },
  { 
    value: 'other', 
    label: 'Other', 
    color: '#6B7280',
    icon: '📋',
    description: 'Other community issues'
  },
] as const;

// Map Configuration
export const MAP_CONFIG = {
  DEFAULT_CENTER: [30.708335, 76.690041] as [number, number],
  DEFAULT_ZOOM: 13,
  MIN_ZOOM: 8,
  MAX_ZOOM: 18,
  TILE_LAYER: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  ATTRIBUTION: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  MAX_CLUSTER_RADIUS: 80,
  MAX_CLUSTER_ZOOM: 15,
};

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 50,
  DEFAULT_PAGE: 1,
};

// Search & Filter
export const SEARCH = {
  DEBOUNCE_DELAY: 300,
  MIN_QUERY_LENGTH: 2,
  MAX_SUGGESTIONS: 10,
};

// Upload Limits
export const UPLOAD = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  MAX_TOTAL_SIZE: 20 * 1024 * 1024, // 20MB
  ACCEPTED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  ACCEPTED_VIDEO_TYPES: ['video/mp4', 'video/webm', 'video/ogg'],
  MAX_FILES: 5,
  COMPRESSION_QUALITY: 0.8,
};

// Notifications
export const NOTIFICATION = {
  AUTO_HIDE_DELAY: 5000,
  MAX_VISIBLE: 5,
  POLL_INTERVAL: 30000, // 30 seconds
  STORAGE_KEY: 'civicfix_notifications',
};

// Performance & Optimization
export const PERFORMANCE = {
  LAZY_LOAD_THRESHOLD: 100,
  INFINITE_SCROLL_THRESHOLD: 200,
  DEBOUNCE_RESIZE: 250,
  IMAGE_LAZY_LOAD_OFFSET: 200,
};

// Cache Configuration
export const CACHE = {
  DEFAULT_TTL: 5 * 60 * 1000, // 5 minutes
  LONG_TTL: 30 * 60 * 1000, // 30 minutes
  SHORT_TTL: 60 * 1000, // 1 minute
  MAX_ITEMS: 100,
};

// Local Storage Keys
export const LOCAL_STORAGE_KEYS = {
  AUTH_TOKEN: 'civicfix_auth_token',
  USER_DATA: 'civicfix_user_data',
  USER_ROLE: 'civicfix_user_role',
  THEME: 'civicfix_theme',
  LANGUAGE: 'civicfix_language',
  RECENT_SEARCHES: 'civicfix_recent_searches',
  NOTIFICATION_PREFERENCES: 'civicfix_notification_prefs',
} as const;

// Achievement System
export const ACHIEVEMENTS = {
  FIRST_ISSUE: {
    id: 'first_issue_reported',
    title: 'First Issue',
    description: 'Report your first community issue',
    points: 50,
    icon: '🎯',
    tier: 'bronze',
  },
  ISSUE_RESOLVED: {
    id: 'first_issue_resolved',
    title: 'Problem Solver',
    description: 'Get your first issue resolved',
    points: 100,
    icon: '✅',
    tier: 'silver',
  },
  COMMUNITY_HELPER: {
    id: 'community_helper',
    title: 'Community Helper',
    description: 'Report 10 issues',
    points: 250,
    icon: '🌟',
    tier: 'gold',
  },
  VOLUNTEER_STAR: {
    id: 'volunteer_star',
    title: 'Volunteer Star',
    description: 'Resolve 10 issues as a volunteer',
    points: 500,
    icon: '⭐',
    tier: 'platinum',
  },
  ADMIN_EXPERT: {
    id: 'admin_expert',
    title: 'Admin Expert',
    description: 'Manage 100 issues as an admin',
    points: 1000,
    icon: '👑',
    tier: 'diamond',
  },
} as const;

// Date & Time Formats
export const DATE_FORMATS = {
  DISPLAY_DATE: 'MMM dd, yyyy',
  DISPLAY_TIME: 'hh:mm a',
  DISPLAY_DATETIME: 'MMM dd, yyyy hh:mm a',
  API_DATE: 'yyyy-MM-dd',
  API_DATETIME: "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'",
};

// Validation Rules
export const VALIDATION = {
  USERNAME_MIN: 3,
  USERNAME_MAX: 30,
  PASSWORD_MIN: 8,
  PASSWORD_MAX: 100,
  TITLE_MIN: 5,
  TITLE_MAX: 100,
  DESCRIPTION_MIN: 10,
  DESCRIPTION_MAX: 2000,
  LOCATION_MIN: 5,
  LOCATION_MAX: 200,
};

// API Endpoints (Base URLs only - full URLs should be built using API_CONFIG.BASE_URL)
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    PROFILE: '/auth/profile',
  },
  ISSUES: {
    BASE: '/issues',
    MY_REPORTS: '/issues/my-reports',
    ASSIGNED: '/issues/assigned',
    STATS: '/issues/stats',
    CATEGORIES: '/issues/categories',
  },
  USERS: {
    BASE: '/users',
    PROFILE: '/users/profile',
    ACHIEVEMENTS: '/users/achievements',
    STATS: '/users/stats',
  },
  NOTIFICATIONS: {
    BASE: '/notifications',
    UNREAD: '/notifications/unread',
    MARK_READ: '/notifications/mark-read',
  },
} as const;

// Feature Flags
export const FEATURE_FLAGS = {
  ENABLE_ACHIEVEMENTS: true,
  ENABLE_NOTIFICATIONS: true,
  ENABLE_REAL_TIME_UPDATES: true,
  ENABLE_OFFLINE_MODE: false,
  ENABLE_SOCIAL_SHARING: true,
};

// Color Scheme
export const COLORS = {
  PRIMARY: '#3B82F6',
  SECONDARY: '#10B981',
  ACCENT: '#8B5CF6',
  SUCCESS: '#10B981',
  WARNING: '#F59E0B',
  ERROR: '#EF4444',
  INFO: '#3B82F6',
  LIGHT: {
    BACKGROUND: '#FFFFFF',
    SURFACE: '#F9FAFB',
    BORDER: '#E5E7EB',
    TEXT: '#111827',
    TEXT_SECONDARY: '#6B7280',
  },
  DARK: {
    BACKGROUND: '#111827',
    SURFACE: '#1F2937',
    BORDER: '#374151',
    TEXT: '#F9FAFB',
    TEXT_SECONDARY: '#9CA3AF',
  },
};