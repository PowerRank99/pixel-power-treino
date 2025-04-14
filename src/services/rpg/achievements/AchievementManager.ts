
import { ServiceResponse, ErrorHandlingService, createSuccessResponse } from '@/services/common/ErrorHandlingService';
import { AchievementService } from '@/services/rpg/AchievementService';
import { AchievementProgressService } from './AchievementProgressService';
import { AchievementUtils } from '@/constants/AchievementDefinitions';
import { Achievement } from '@/types/achievementTypes';
import { supabase } from '@/integrations/supabase/client';

/**
 * Centralized manager for achievement-related operations
 * Coordinates between achievement service, progress service, and standardized definitions
 */
export class AchievementManager {
  /**
   * Initialize achievements for a new user
   */
  static async initializeUserAchievements(userId: string): Promise<ServiceResponse<void>> {
    return ErrorHandlingService.executeWithErrorHandling(
      async () => {
        // Get all achievements from centralized definitions
        const allAchievements = AchievementUtils.getAllAchievements();
        
        // Initialize progress tracking for achievements that need it
        const progressAchievements = allAchievements.filter(
          a => ['workout', 'streak', 'record', 'xp', 'level', 'manual', 'variety'].includes(a.category)
        );
        
        // Convert AchievementDefinition to Achievement to match the expected types
        const achievementsForProgress = progressAchievements.map(a => ({
          id: a.id,
          name: a.name,
          description: a.description,
          category: a.category,
          rank: a.rank,
          points: a.points,
          xpReward: a.xpReward,
          iconName: a.iconName,
          requirements: {
            type: a.requirementType,
            value: a.requirementValue
          }
        } as Achievement));
        
        await AchievementProgressService.initializeMultipleProgress(userId, achievementsForProgress);
      },
      'INITIALIZE_USER_ACHIEVEMENTS',
      { showToast: false }
    );
  }
  
  /**
   * Process workout completion for achievements
   */
  static async processWorkoutCompletion(userId: string, workoutId: string): Promise<ServiceResponse<string[]>> {
    return ErrorHandlingService.executeWithErrorHandling(
      async () => {
        // Get workout count for the user
        const result = await AchievementService.checkWorkoutAchievements(userId, workoutId);
        
        if (result.success && result.data) {
          // Check if result.data has a count property, otherwise use length for arrays
          const workoutCount = typeof result.data === 'object' && 'count' in result.data 
            ? result.data.count 
            : Array.isArray(result.data) ? result.data.length : 0;
            
          // Update progress for workout count achievements
          await AchievementProgressService.updateWorkoutCountProgress(userId, workoutCount);
        }
        
        return result.success && Array.isArray(result.data) ? result.data : [];
      },
      'PROCESS_WORKOUT_COMPLETION',
      { showToast: false }
    );
  }
  
  /**
   * Process manual workout submission for achievements
   */
  static async processManualWorkout(userId: string): Promise<ServiceResponse<string[]>> {
    return ErrorHandlingService.executeWithErrorHandling(
      async () => {
        // Get manual workout count for the user
        const { count } = await supabase
          .from('manual_workouts')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId);
          
        const manualCount = count || 0;
        
        // Get manual workout achievements from centralized definitions
        const manualAchievements = AchievementUtils
          .getAchievementsByCategory('manual')
          .filter(a => a.requirementType === 'manual_count')
          .sort((a, b) => b.requirementValue - a.requirementValue);
        
        // Find achievements to award
        const achievementsToCheck: string[] = [];
        
        for (const achievement of manualAchievements) {
          if (manualCount >= achievement.requirementValue) {
            achievementsToCheck.push(achievement.id);
          }
        }
        
        // Award achievements
        if (achievementsToCheck.length > 0) {
          const result = await AchievementService.checkAndAwardAchievements(userId, achievementsToCheck);
          if (result.success && result.data) {
            return Array.isArray(result.data) ? result.data : [];
          }
        }
        
        return [];
      },
      'PROCESS_MANUAL_WORKOUT',
      { showToast: false }
    );
  }
  
  /**
   * Process streak update for achievements
   */
  static async processStreakUpdate(userId: string, currentStreak: number): Promise<ServiceResponse<string[]>> {
    return ErrorHandlingService.executeWithErrorHandling(
      async () => {
        // Update progress for streak achievements
        await AchievementProgressService.updateStreakProgress(userId, currentStreak);
        
        return [];
      },
      'PROCESS_STREAK_UPDATE',
      { showToast: false }
    );
  }
  
  /**
   * Process level up for achievements
   */
  static async processLevelUp(userId: string, currentLevel: number): Promise<ServiceResponse<string[]>> {
    return ErrorHandlingService.executeWithErrorHandling(
      async () => {
        // Get level achievements from centralized definitions
        const levelAchievements = AchievementUtils
          .getAchievementsByCategory('level')
          .filter(a => a.requirementType === 'level')
          .sort((a, b) => b.requirementValue - a.requirementValue);
        
        // Find achievements to award
        const achievementsToCheck: string[] = [];
        
        for (const achievement of levelAchievements) {
          if (currentLevel >= achievement.requirementValue) {
            achievementsToCheck.push(achievement.id);
          }
        }
        
        // Award achievements
        if (achievementsToCheck.length > 0) {
          const result = await AchievementService.checkAndAwardAchievements(userId, achievementsToCheck);
          if (result.success && result.data) {
            return Array.isArray(result.data) ? result.data : [];
          }
        }
        
        return [];
      },
      'PROCESS_LEVEL_UP',
      { showToast: false }
    );
  }
  
  /**
   * Process XP milestone for achievements
   */
  static async processXPMilestone(userId: string, totalXP: number): Promise<ServiceResponse<string[]>> {
    return ErrorHandlingService.executeWithErrorHandling(
      async () => {
        // Get XP achievements from centralized definitions
        const xpAchievements = AchievementUtils
          .getAchievementsByCategory('xp')
          .filter(a => a.requirementType === 'total_xp')
          .sort((a, b) => b.requirementValue - a.requirementValue);
        
        // Find achievements to award
        const achievementsToCheck: string[] = [];
        
        for (const achievement of xpAchievements) {
          if (totalXP >= achievement.requirementValue) {
            achievementsToCheck.push(achievement.id);
          }
        }
        
        // Award achievements
        if (achievementsToCheck.length > 0) {
          const result = await AchievementService.checkAndAwardAchievements(userId, achievementsToCheck);
          if (result.success && result.data) {
            return Array.isArray(result.data) ? result.data : [];
          }
        }
        
        return [];
      },
      'PROCESS_XP_MILESTONE',
      { showToast: false }
    );
  }
}
