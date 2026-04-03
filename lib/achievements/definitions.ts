export interface AchievementDefinition {
    id: string;
    name: string;
    description: string;
    icon: string;
    category: string;
    tier: 'bronze' | 'silver' | 'gold' | 'platinum';
    points: number;
    requirement: {
      type: string;
      target: number;
    };
    rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  }
  
  export const CITIZEN_ACHIEVEMENTS: AchievementDefinition[] = [
    { 
      id: "first_report", 
      name: "First Step", 
      description: "Submit your first issue report", 
      icon: "📍", 
      category: "reporting", 
      tier: "bronze", 
      points: 50, 
      rarity: "common",
      requirement: { type: "totalReports", target: 1 } 
    },
    { 
      id: "reporter_5", 
      name: "Local Voice", 
      description: "Submit 5 issue reports", 
      icon: "🗣️", 
      category: "reporting", 
      tier: "silver", 
      points: 150, 
      rarity: "uncommon",
      requirement: { type: "totalReports", target: 5 } 
    },
    { 
      id: "reporter_25", 
      name: "Community Champion", 
      description: "Submit 25 issue reports", 
      icon: "🏅", 
      category: "reporting", 
      tier: "gold", 
      points: 500, 
      rarity: "rare",
      requirement: { type: "totalReports", target: 25 } 
    },
    { 
      id: "reporter_100", 
      name: "City Guardian", 
      description: "Submit 100 issue reports", 
      icon: "🛡️", 
      category: "reporting", 
      tier: "platinum", 
      points: 2000, 
      rarity: "epic",
      requirement: { type: "totalReports", target: 100 } 
    },
    // Voting
    { 
      id: "first_vote", 
      name: "Your Voice Counts", 
      description: "Upvote your first issue", 
      icon: "👍", 
      category: "community", 
      tier: "bronze", 
      points: 25, 
      rarity: "common",
      requirement: { type: "totalVotes", target: 1 } 
    },
    { 
      id: "voter_10", 
      name: "Active Voter", 
      description: "Upvote 10 issues", 
      icon: "🗳️", 
      category: "community", 
      tier: "silver", 
      points: 100, 
      rarity: "uncommon",
      requirement: { type: "totalVotes", target: 10 } 
    },
    { 
      id: "voter_50", 
      name: "Democracy Advocate", 
      description: "Upvote 50 issues", 
      icon: "⚡", 
      category: "community", 
      tier: "gold", 
      points: 300, 
      rarity: "rare",
      requirement: { type: "totalVotes", target: 50 } 
    },
    // Comments
    { 
      id: "first_comment", 
      name: "Speak Up", 
      description: "Leave your first comment", 
      icon: "💬", 
      category: "community", 
      tier: "bronze", 
      points: 30, 
      rarity: "common",
      requirement: { type: "totalComments", target: 1 } 
    },
    { 
      id: "commenter_20", 
      name: "Engaged Citizen", 
      description: "Leave 20 comments", 
      icon: "📢", 
      category: "community", 
      tier: "silver", 
      points: 200, 
      rarity: "uncommon",
      requirement: { type: "totalComments", target: 20 } 
    },
    // Resolved issues
    { 
      id: "issue_resolved", 
      name: "Problem Solved!", 
      description: "Have your first reported issue resolved", 
      icon: "✅", 
      category: "reporting", 
      tier: "silver", 
      points: 200, 
      rarity: "uncommon",
      requirement: { type: "resolvedReports", target: 1 } 
    },
    { 
      id: "resolved_10", 
      name: "Change Maker", 
      description: "Have 10 of your reported issues resolved", 
      icon: "🌟", 
      category: "reporting", 
      tier: "gold", 
      points: 750, 
      rarity: "rare",
      requirement: { type: "resolvedReports", target: 10 } 
    },
    // Level milestones
    { 
      id: "level_5", 
      name: "Rising Star", 
      description: "Reach level 5", 
      icon: "⭐", 
      category: "milestone", 
      tier: "bronze", 
      points: 100, 
      rarity: "common",
      requirement: { type: "level", target: 5 } 
    },
    { 
      id: "level_10", 
      name: "Civic Hero", 
      description: "Reach level 10", 
      icon: "🦸", 
      category: "milestone", 
      tier: "gold", 
      points: 500, 
      rarity: "rare",
      requirement: { type: "level", target: 10 } 
    },
    // Points milestones
    { 
      id: "points_500", 
      name: "Point Collector", 
      description: "Accumulate 500 points", 
      icon: "💎", 
      category: "milestone", 
      tier: "bronze", 
      points: 0, 
      rarity: "common",
      requirement: { type: "points", target: 500 } 
    },
    { 
      id: "points_5000", 
      name: "Point Master", 
      description: "Accumulate 5,000 points", 
      icon: "🏆", 
      category: "milestone", 
      tier: "gold", 
      points: 0, 
      rarity: "rare",
      requirement: { type: "points", target: 5000 } 
    },
  ];
  
  export const VOLUNTEER_ACHIEVEMENTS: AchievementDefinition[] = [
    // Task completion
    { 
      id: "first_claim", 
      name: "On It!", 
      description: "Claim your first task", 
      icon: "🤝", 
      category: "volunteering", 
      tier: "bronze", 
      points: 75, 
      rarity: "common",
      requirement: { type: "totalClaimed", target: 1 } 
    },
    { 
      id: "tasks_5", 
      name: "Dependable", 
      description: "Complete 5 tasks", 
      icon: "💪", 
      category: "volunteering", 
      tier: "silver", 
      points: 250, 
      rarity: "uncommon",
      requirement: { type: "tasksCompleted", target: 5 } 
    },
    { 
      id: "tasks_25", 
      name: "Powerhouse", 
      description: "Complete 25 tasks", 
      icon: "🔥", 
      category: "volunteering", 
      tier: "gold", 
      points: 1000, 
      rarity: "rare",
      requirement: { type: "tasksCompleted", target: 25 } 
    },
    { 
      id: "tasks_100", 
      name: "Legend", 
      description: "Complete 100 tasks", 
      icon: "👑", 
      category: "volunteering", 
      tier: "platinum", 
      points: 5000, 
      rarity: "epic",
      requirement: { type: "tasksCompleted", target: 100 } 
    },
    // Efficiency
    { 
      id: "fast_responder", 
      name: "Swift Response", 
      description: "Claim a task within 1 hour of it being posted", 
      icon: "⚡", 
      category: "volunteering", 
      tier: "silver", 
      points: 150, 
      rarity: "uncommon",
      requirement: { type: "fastResponse", target: 1 } 
    },
    // Breadth
    { 
      id: "multi_category", 
      name: "Jack of All Trades", 
      description: "Complete tasks in 3 different categories", 
      icon: "🧰", 
      category: "volunteering", 
      tier: "gold", 
      points: 400, 
      rarity: "rare",
      requirement: { type: "categoriesCompleted", target: 3 } 
    },
    // Quality
    { 
      id: "top_rated", 
      name: "5-Star Volunteer", 
      description: "Maintain a 4.8+ rating across 10+ tasks", 
      icon: "🌠", 
      category: "volunteering", 
      tier: "platinum", 
      points: 2500, 
      rarity: "epic",
      requirement: { type: "rating", target: 4.8 } 
    },
    // Consistency
    { 
      id: "streak_7", 
      name: "Week Warrior", 
      description: "Complete at least one task every day for 7 days", 
      icon: "📆", 
      category: "volunteering", 
      tier: "gold", 
      points: 600, 
      rarity: "rare",
      requirement: { type: "streak", target: 7 } 
    },
    // Milestones
    { 
      id: "vol_level_5", 
      name: "Rising Volunteer", 
      description: "Reach level 5 as a volunteer", 
      icon: "⭐", 
      category: "milestone", 
      tier: "bronze", 
      points: 100, 
      rarity: "common",
      requirement: { type: "level", target: 5 } 
    },
    { 
      id: "vol_points_1000", 
      name: "Contributor", 
      description: "Accumulate 1,000 points", 
      icon: "💎", 
      category: "milestone", 
      tier: "silver", 
      points: 0, 
      rarity: "uncommon",
      requirement: { type: "points", target: 1000 } 
    },
  ];

export const ADMIN_ACHIEVEMENTS: AchievementDefinition[] = [
  // Review milestones
  { 
    id: "first_review", 
    name: "First Review", 
    description: "Review your first issue resolution", 
    icon: "📋", 
    category: "administration", 
    tier: "bronze", 
    points: 50, 
    rarity: "common",
    requirement: { type: "issuesReviewed", target: 1 } 
  },
  { 
    id: "reviewer_10", 
    name: "Diligent Admin", 
    description: "Review 10 issue resolutions", 
    icon: "✅", 
    category: "administration", 
    tier: "silver", 
    points: 200, 
    rarity: "uncommon",
    requirement: { type: "issuesReviewed", target: 10 } 
  },
  { 
    id: "reviewer_50", 
    name: "Review Master", 
    description: "Review 50 issue resolutions", 
    icon: "🏆", 
    category: "administration", 
    tier: "gold", 
    points: 800, 
    rarity: "rare",
    requirement: { type: "issuesReviewed", target: 50 } 
  },
  { 
    id: "reviewer_200", 
    name: "Legendary Admin", 
    description: "Review 200 issue resolutions", 
    icon: "👑", 
    category: "administration", 
    tier: "platinum", 
    points: 3000, 
    rarity: "epic",
    requirement: { type: "issuesReviewed", target: 200 } 
  },
  // Report generation
  { 
    id: "admin_first_report", 
    name: "Data Enthusiast", 
    description: "Generate your first analytics report", 
    icon: "📊", 
    category: "analytics", 
    tier: "bronze", 
    points: 30, 
    rarity: "common",
    requirement: { type: "reportsGenerated", target: 1 } 
  },
  { 
    id: "reporter_20", 
    name: "Insight Provider", 
    description: "Generate 20 analytics reports", 
    icon: "📈", 
    category: "analytics", 
    tier: "silver", 
    points: 150, 
    rarity: "uncommon",
    requirement: { type: "reportsGenerated", target: 20 } 
  },
  // User management
  { 
    id: "user_manager", 
    name: "People Manager", 
    description: "Manage 50 different users", 
    icon: "👥", 
    category: "management", 
    tier: "silver", 
    points: 250, 
    rarity: "uncommon",
    requirement: { type: "usersManaged", target: 50 } 
  },
  { 
    id: "user_master", 
    name: "Community Leader", 
    description: "Manage 200 different users", 
    icon: "🌟", 
    category: "management", 
    tier: "gold", 
    points: 1000, 
    rarity: "rare",
    requirement: { type: "usersManaged", target: 200 } 
  },
  // System uptime
  { 
    id: "uptime_99", 
    name: "Reliable", 
    description: "Maintain 99% system uptime for a month", 
    icon: "🔒", 
    category: "system", 
    tier: "silver", 
    points: 500, 
    rarity: "uncommon",
    requirement: { type: "systemUptime", target: 99 } 
  },
  { 
    id: "uptime_999", 
    name: "Five Nines", 
    description: "Maintain 99.99% system uptime for a quarter", 
    icon: "⚡", 
    category: "system", 
    tier: "platinum", 
    points: 5000, 
    rarity: "epic",
    requirement: { type: "systemUptime", target: 99.99 } 
  },
  // Level milestones
  { 
    id: "admin_level_5", 
    name: "Rising Admin", 
    description: "Reach level 5 as an admin", 
    icon: "📈", 
    category: "milestone", 
    tier: "bronze", 
    points: 100, 
    rarity: "common",
    requirement: { type: "level", target: 5 } 
  },
  { 
    id: "admin_level_10", 
    name: "Elite Admin", 
    description: "Reach level 10 as an admin", 
    icon: "🏅", 
    category: "milestone", 
    tier: "gold", 
    points: 1000, 
    rarity: "rare",
    requirement: { type: "level", target: 10 } 
  },
];