
/**
 * Types for the achievement system
 */

export interface Achievement {
  id: string;
  name: string;
  description: string;
  category: string;
  rank: string;
  points: number;
  xpReward: number;
  iconName: string;
  requirements: Record<string, any>;
  isUnlocked?: boolean;
  achievedAt?: string;
}

export interface UserAchievement {
  id: string;
  userId: string;
  achievementId: string;
  achievedAt: string;
  achievement?: Achievement;
}

export interface AchievementProgress {
  id: string;
  current: number;
  total: number;
  isComplete: boolean;
}

export interface AchievementCategory {
  id: string;
  name: string;
  description: string;
  achievements: Achievement[];
}

export interface AchievementStats {
  total: number;
  unlocked: number;
  points: number;
  rank: string;
  nextRank: string | null;
  pointsToNextRank: number | null;
}

export type AchievementRank = 'Unranked' | 'E' | 'D' | 'C' | 'B' | 'A' | 'S';
