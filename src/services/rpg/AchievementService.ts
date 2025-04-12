import { supabase } from '@/integrations/supabase/client';
import { Achievement, AchievementStats } from '@/types/achievementTypes';
import { XPService } from './XPService';

/**
 * Service for managing achievements
 */
export class AchievementService {
  /**
   * Get all achievements for a user
   */
  static async getAchievements(userId: string): Promise<Achievement[]> {
    try {
      // Get all achievements
      const { data: achievements, error: achievementsError } = await supabase
        .from('achievements')
        .select('*')
        .order('rank', { ascending: false });

      if (achievementsError) throw achievementsError;

      // Get user's unlocked achievements
      const { data: userAchievements, error: userAchievementsError } = await supabase
        .from('user_achievements')
        .select('achievement_id, achieved_at')
        .eq('user_id', userId);

      if (userAchievementsError) throw userAchievementsError;

      // Map and merge the data
      const achievementsWithStatus = achievements.map(achievement => {
        const userAchievement = userAchievements?.find(ua => ua.achievement_id === achievement.id);
        const parsedRequirements = typeof achievement.requirements === 'string' 
          ? JSON.parse(achievement.requirements as string) 
          : achievement.requirements;

        return {
          id: achievement.id,
          name: achievement.name,
          description: achievement.description,
          category: achievement.category,
          rank: achievement.rank,
          points: achievement.points,
          xpReward: achievement.xp_reward,
          iconName: achievement.icon_name,
          requirements: parsedRequirements as Record<string, any>,
          isUnlocked: !!userAchievement,
          achievedAt: userAchievement?.achieved_at,
          progress: undefined // Will be filled later if needed
        };
      });

      return achievementsWithStatus;
    } catch (error) {
      console.error('Error fetching achievements:', error);
      return [];
    }
  }

  /**
   * Get only unlocked achievements for a user
   */
  static async getUnlockedAchievements(userId: string): Promise<Achievement[]> {
    try {
      // Get user's unlocked achievements with their details
      const { data, error } = await supabase
        .from('user_achievements')
        .select(`
          achievement_id,
          achieved_at,
          achievements (
            id,
            name,
            description,
            category,
            rank,
            points,
            xp_reward,
            icon_name,
            requirements
          )
        `)
        .eq('user_id', userId)
        .order('achieved_at', { ascending: false });

      if (error) throw error;

      // Map the data to our Achievement type
      const achievements: Achievement[] = data.map(item => {
        const parsedRequirements = typeof item.achievements.requirements === 'string' 
          ? JSON.parse(item.achievements.requirements as string) 
          : item.achievements.requirements;

        return {
          id: item.achievements.id,
          name: item.achievements.name,
          description: item.achievements.description,
          category: item.achievements.category,
          rank: item.achievements.rank,
          points: item.achievements.points,
          xpReward: item.achievements.xp_reward,
          iconName: item.achievements.icon_name,
          requirements: parsedRequirements as Record<string, any>,
          isUnlocked: true,
          achievedAt: item.achieved_at
        };
      });

      return achievements;
    } catch (error) {
      console.error('Error fetching unlocked achievements:', error);
      return [];
    }
  }

  /**
   * Get achievement statistics for a user
   */
  static async getAchievementStats(userId: string): Promise<AchievementStats> {
    try {
      // Get total achievements count
      const { count: totalCount, error: totalError } = await supabase
        .from('achievements')
        .select('*', { count: 'exact', head: true });

      if (totalError) throw totalError;

      // Get unlocked achievements count
      const { count: unlockedCount, error: unlockedError } = await supabase
        .from('user_achievements')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      if (unlockedError) throw unlockedError;

      // Get user profile for points
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('achievements_count')
        .eq('id', userId)
        .single();

      if (profileError) throw profileError;

      // Use achievements_count as points
      const points = profileData?.achievements_count || 0;
      
      // Calculate rank based on points
      const rank = this.calculateRank(points);
      const nextRank = this.getNextRank(rank);
      const pointsToNextRank = this.getPointsToNextRank(points, rank);

      return {
        total: totalCount || 0,
        unlocked: unlockedCount || 0,
        points,
        rank,
        nextRank,
        pointsToNextRank
      };
    } catch (error) {
      console.error('Error fetching achievement stats:', error);
      return {
        total: 0,
        unlocked: 0,
        points: 0,
        rank: 'Unranked',
        nextRank: 'E',
        pointsToNextRank: 10
      };
    }
  }

  /**
   * Award an achievement to a user
   */
  static async awardAchievement(userId: string, achievementId: string): Promise<boolean> {
    try {
      // Check if the user already has this achievement
      const { count, error: checkError } = await supabase
        .from('user_achievements')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('achievement_id', achievementId);

      if (checkError) throw checkError;

      // If already awarded, return true
      if (count && count > 0) {
        return true;
      }

      // Get achievement details
      const { data: achievement, error: achievementError } = await supabase
        .from('achievements')
        .select('*')
        .eq('id', achievementId)
        .single();

      if (achievementError) throw achievementError;

      // Add achievement to user_achievements
      const { error: insertError } = await supabase
        .from('user_achievements')
        .insert({
          user_id: userId,
          achievement_id: achievementId,
          achieved_at: new Date().toISOString()
        });

      if (insertError) throw insertError;

      // Award XP to user
      await XPService.awardXP(userId, achievement.xp_reward, 'achievement');

      // Update achievement count and points
      await supabase.rpc('increment_profile_counter', {
        user_id_param: userId,
        counter_name: 'achievements_count',
        increment_amount: 1
      });
      
      // Also update achievement_points if the column exists
      try {
        await supabase.rpc('increment_profile_counter', {
          user_id_param: userId,
          counter_name: 'achievement_points',
          increment_amount: achievement.points
        });
      } catch (e) {
        console.log('Could not update achievement_points, column might not exist');
      }

      return true;
    } catch (error) {
      console.error('Error awarding achievement:', error);
      return false;
    }
  }

  /**
   * Check workout achievements
   */
  static async checkWorkoutAchievements(userId: string, workoutId: string): Promise<void> {
    try {
      // Check for first workout achievement
      await this.checkFirstWorkoutAchievement(userId);

      // Check workout count achievements
      await this.checkWorkoutCountAchievements(userId);

      // Check workout streak achievements
      await this.checkStreakAchievements(userId);
    } catch (error) {
      console.error('Error checking workout achievements:', error);
    }
  }

  /**
   * Check streak achievements
   */
  static async checkStreakAchievements(userId: string): Promise<void> {
    try {
      // Get user's current streak
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('streak')
        .eq('id', userId)
        .single();

      if (profileError) throw profileError;

      const currentStreak = profile?.streak || 0;

      // Check for streak achievements
      if (currentStreak >= 7) {
        await this.awardAchievement(userId, 'streak-7');
      }

      if (currentStreak >= 14) {
        await this.awardAchievement(userId, 'streak-14');
      }

      if (currentStreak >= 30) {
        await this.awardAchievement(userId, 'streak-30');
      }

      if (currentStreak >= 60) {
        await this.awardAchievement(userId, 'streak-60');
      }

      if (currentStreak >= 100) {
        await this.awardAchievement(userId, 'streak-100');
      }
    } catch (error) {
      console.error('Error checking streak achievements:', error);
    }
  }

  /**
   * Check first workout achievement
   */
  private static async checkFirstWorkoutAchievement(userId: string): Promise<void> {
    try {
      // Get workout count
      const { count, error } = await supabase
        .from('workouts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      if (error) throw error;

      // Award achievement for first workout
      if (count === 1) {
        await this.awardAchievement(userId, 'first-workout');
      }
    } catch (error) {
      console.error('Error checking first workout achievement:', error);
    }
  }

  /**
   * Check workout count achievements
   */
  private static async checkWorkoutCountAchievements(userId: string): Promise<void> {
    try {
      // Get workout count
      const { count, error } = await supabase
        .from('workouts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      if (error) throw error;

      // Check for workout count achievements
      if (count >= 5) {
        await this.awardAchievement(userId, 'workout-5');
      }

      if (count >= 10) {
        await this.awardAchievement(userId, 'workout-10');
      }

      if (count >= 25) {
        await this.awardAchievement(userId, 'workout-25');
      }

      if (count >= 50) {
        await this.awardAchievement(userId, 'workout-50');
      }

      if (count >= 100) {
        await this.awardAchievement(userId, 'workout-100');
      }
    } catch (error) {
      console.error('Error checking workout count achievements:', error);
    }
  }

  /**
   * Calculate rank based on points
   */
  private static calculateRank(points: number): string {
    if (points >= 1000) return 'S';
    if (points >= 500) return 'A';
    if (points >= 250) return 'B';
    if (points >= 100) return 'C';
    if (points >= 50) return 'D';
    if (points >= 10) return 'E';
    return 'Unranked';
  }

  /**
   * Get next rank based on current rank
   */
  private static getNextRank(currentRank: string): string | null {
    switch (currentRank) {
      case 'Unranked': return 'E';
      case 'E': return 'D';
      case 'D': return 'C';
      case 'C': return 'B';
      case 'B': return 'A';
      case 'A': return 'S';
      case 'S': return null; // Max rank
      default: return 'E';
    }
  }

  /**
   * Get points needed to reach next rank
   */
  private static getPointsToNextRank(currentPoints: number, currentRank: string): number | null {
    switch (currentRank) {
      case 'Unranked': return 10 - currentPoints;
      case 'E': return 50 - currentPoints;
      case 'D': return 100 - currentPoints;
      case 'C': return 250 - currentPoints;
      case 'B': return 500 - currentPoints;
      case 'A': return 1000 - currentPoints;
      case 'S': return null; // Max rank
      default: return 10 - currentPoints;
    }
  }
}
