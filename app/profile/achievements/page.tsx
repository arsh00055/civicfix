'use client';
import { JSX, useState, useEffect } from "react";
import { UserStats } from "@/types/user.types";
import { useAuth } from "@/features/auth/hooks/useAuth";
import MainLayout from "@/components/layout/MainLayout";
import { achievementsAPI } from "@/lib/services/api/endpoints";
import { TrophyIcon, FireIcon, StarIcon, SparklesIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

interface Achievement {
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
  current: number;
  progress: number;
  unlocked: boolean;
  unlockedAt?: string | null;
}

interface AchievementsResponse {
  achievements: Achievement[];
  summary: {
    total: number;
    unlocked: number;
    locked: number;
    totalPoints: number;
    completion: number;
  };
}

const TIER_STYLES: Record<string, { bg: string; text: string; border: string; icon: JSX.Element }> = {
  bronze: { 
    bg: "bg-orange-100", 
    text: "text-orange-800", 
    border: "border-orange-200",
    icon: <FireIcon className="w-4 h-4" />
  },
  silver: { 
    bg: "bg-gray-100", 
    text: "text-gray-700", 
    border: "border-gray-200",
    icon: <StarIcon className="w-4 h-4" />
  },
  gold: { 
    bg: "bg-yellow-100", 
    text: "text-yellow-800", 
    border: "border-yellow-200",
    icon: <TrophyIcon className="w-4 h-4" />
  },
  platinum: { 
    bg: "bg-purple-100", 
    text: "text-purple-800", 
    border: "border-purple-200",
    icon: <SparklesIcon className="w-4 h-4" />
  },
};

const CATEGORY_STYLES: Record<string, string> = {
  reporting: "bg-blue-100 text-blue-800 border-blue-200",
  community: "bg-green-100 text-green-800 border-green-200",
  volunteering: "bg-teal-100 text-teal-800 border-teal-200",
  milestone: "bg-indigo-100 text-indigo-800 border-indigo-200",
};

export default function AchievementsPage() {
  const [tab, setTab] = useState<"all" | "unlocked" | "locked">("all");
  const [search, setSearch] = useState("");
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [summary, setSummary] = useState<AchievementsResponse['summary']>({
    total: 0,
    unlocked: 0,
    locked: 0,
    totalPoints: 0,
    completion: 0,
  });
  const [userLevel, setUserLevel] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    fetchAchievements();
  }, []);

  const fetchAchievements = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await achievementsAPI.getAchievements();
      const data = response.data;
      setAchievements(data.achievements);
      setSummary(data.summary);
      
      const levelAchievement = data.achievements.find((a: Achievement) => 
        a.requirement.type === 'level' && a.current > 0
      );
      if (levelAchievement) {
        setUserLevel(levelAchievement.current);
      }
    } catch (err) {
      console.error('Failed to fetch achievements:', err);
      setError('Failed to load achievements. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const allAchievements = achievements;
  const unlocked = achievements.filter(a => a.unlocked);
  const locked = achievements.filter(a => !a.unlocked);
  
  let visible = tab === "unlocked" ? unlocked : tab === "locked" ? locked : allAchievements;
  if (search) {
    visible = visible.filter(a =>
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.description.toLowerCase().includes(search.toLowerCase())
    );
  }

  if (loading) {
    return (
      <MainLayout role={user?.role || null}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
            <p className="mt-4 text-gray-500">Loading achievements...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout role={user?.role || null}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <p className="text-red-600">{error}</p>
            <button
              onClick={fetchAchievements}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout role={user?.role || null}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 rounded-xl">
              <TrophyIcon className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Achievements</h1>
              <p className="text-sm text-gray-500">
                {user?.role === "volunteer" ? "Volunteer" : "Citizen"} · Level {userLevel}
              </p>
            </div>
          </div>

          {/* Progress Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 mt-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">
                {summary.unlocked} of {summary.total} unlocked
              </span>
              <span className="text-sm font-semibold text-blue-600">{summary.completion}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 rounded-full h-2 transition-all duration-300"
                style={{ width: `${summary.completion}%` }}
              />
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Unlocked", value: summary.unlocked, color: "text-amber-600" },
            { label: "Points", value: summary.totalPoints.toLocaleString(), color: "text-emerald-600" },
            { label: "Level", value: userLevel, color: "text-purple-600" },
            { label: "Completion", value: `${summary.completion}%`, color: "text-blue-600" },
          ].map((stat, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 text-center">
              <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
              <div className="text-xs text-gray-500 uppercase tracking-wide mt-1">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs & Search */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex gap-2">
            {(["all", "unlocked", "locked"] as const).map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-4 py-2 text-sm cursor-pointer font-medium rounded-lg transition-colors ${
                  tab === t
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {t === "all" ? `All (${summary.total})`
                  : t === "unlocked" ? `✓ Unlocked (${summary.unlocked})`
                  : `Locked (${summary.locked})`}
              </button>
            ))}
          </div>
        </div>

        {/* Achievements Grid */}
        {visible.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <TrophyIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No achievements found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {visible.map((achievement) => {
              const tierStyle = TIER_STYLES[achievement.tier];
              const categoryStyle = CATEGORY_STYLES[achievement.category] || "bg-gray-100 text-gray-800 border-gray-200";
              const pct = Math.round(achievement.progress * 100);
              
              return (
                <div
                  key={achievement.id}
                  className={`bg-white rounded-xl border transition-all duration-200 ${
                    achievement.unlocked 
                      ? "border-gray-200 hover:shadow-md" 
                      : "border-gray-200 opacity-75 hover:opacity-100"
                  }`}
                >
                  <div className="p-5">
                    {/* Icon */}
                    <div className="text-3xl mb-3">{achievement.icon}</div>
                    
                    {/* Badges */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${tierStyle.bg} ${tierStyle.text} border ${tierStyle.border}`}>
                        {tierStyle.icon}
                        {achievement.tier.charAt(0).toUpperCase() + achievement.tier.slice(1)}
                      </span>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${categoryStyle}`}>
                        {achievement.category}
                      </span>
                    </div>
                    
                    {/* Title & Description */}
                    <h3 className={`font-semibold text-gray-900 mb-1 ${achievement.unlocked ? '' : 'text-gray-600'}`}>
                      {achievement.name}
                    </h3>
                    <p className="text-sm text-gray-500 mb-4">{achievement.description}</p>
                    
                    {/* Progress Bar */}
                    {!achievement.unlocked && (
                      <div className="mb-4">
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                          <span>Progress</span>
                          <span>{achievement.current}/{achievement.requirement.target}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div 
                            className="bg-blue-600 rounded-full h-1.5 transition-all"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    )}
                    
                    {/* Footer */}
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <span className={`text-sm font-mono ${achievement.unlocked ? 'text-amber-600' : 'text-gray-400'}`}>
                        +{achievement.points} pts
                      </span>
                      {achievement.unlocked ? (
                        <span className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                          <CheckCircleIcon className="w-3 h-3" />
                          Unlocked
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">{pct}% done</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </MainLayout>
  );
}