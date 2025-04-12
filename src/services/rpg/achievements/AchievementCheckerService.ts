
import { ServiceResponse } from '@/services/common/ErrorHandlingService';
import { PersonalRecordData } from './AchievementCheckerInterface';
import { WorkoutAchievementChecker } from './WorkoutAchievementChecker';
import { RecordAchievementChecker } from './RecordAchievementChecker';
import { StreakAchievementChecker } from './StreakAchievementChecker';
import { ActivityAchievementChecker } from './ActivityAchievementChecker';
import { XPAchievementChecker } from './XPAchievementChecker';
import { BaseAchievementChecker } from './BaseAchievementChecker';

/**
 * Centralized service for checking and awarding achievements
 * Acts as a facade to delegate to specialized checkers
 */
export class AchievementCheckerService extends BaseAchievementChecker {
  /**
   * Check all achievements relevant to workout completion
   */
  static async checkWorkoutRelatedAchievements(userId: string): Promise<ServiceResponse<void>> {
    return WorkoutAchievementChecker.checkAchievements(userId);
  }

  /**
   * Check all achievements related to personal records
   */
  static async checkPersonalRecordAchievements(
    userId: string,
    recordInfo?: PersonalRecordData
  ): Promise<ServiceResponse<void>> {
    return RecordAchievementChecker.checkAchievements(userId, recordInfo);
  }

  /**
   * Check all achievements related to streaks
   */
  static async checkStreakAchievements(userId: string): Promise<ServiceResponse<void>> {
    return StreakAchievementChecker.checkAchievements(userId);
  }

  /**
   * Check all achievements related to XP milestones
   */
  static async checkXPMilestoneAchievements(
    userId: string, 
    totalXP?: number
  ): Promise<ServiceResponse<void>> {
    return XPAchievementChecker.checkAchievements(userId, totalXP);
  }

  /**
   * Check activity variety achievements
   */
  static async checkActivityVarietyAchievements(userId: string): Promise<ServiceResponse<void>> {
    return ActivityAchievementChecker.checkAchievements(userId);
  }

  /**
   * Check for manual workout achievements
   */
  static async checkManualWorkoutAchievements(userId: string): Promise<ServiceResponse<void>> {
    return ActivityAchievementChecker.checkManualWorkoutAchievements(userId);
  }

  /**
   * Check a user's workout history for achievements
   */
  static async checkWorkoutHistoryAchievements(userId: string): Promise<ServiceResponse<void>> {
    return WorkoutAchievementChecker.checkWorkoutHistoryAchievements(userId);
  }
}
