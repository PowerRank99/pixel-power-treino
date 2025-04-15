
import { ServiceResponse, ErrorHandlingService, createSuccessResponse } from '@/services/common/ErrorHandlingService';
import { AchievementService } from '@/services/rpg/AchievementService';
import { AchievementCategory, AchievementRank } from '@/types/achievementTypes';

/**
 * Base abstract class for all specialized achievement checkers
 * Provides common functionality and enforces consistent interface
 */
export abstract class BaseAchievementChecker {
  /**
   * Abstract method that must be implemented by all checker classes
   * Performs the specific achievement checks for a given category 
   */
  abstract checkAchievements(userId: string, data?: any): Promise<ServiceResponse<string[]>>;
  
  /**
   * Helper method to check achievements based on rank and category
   */
  protected async checkCategoryAchievements(
    userId: string, 
    rank: AchievementRank,
    category: AchievementCategory,
    currentValue: number
  ): Promise<string[]> {
    const achievementsToCheck: string[] = [];
    
    // Check for achievements in the specified category and rank
    
    return achievementsToCheck;
  }
  
  /**
   * Execute checker with standard error handling
   */
  protected async executeWithErrorHandling(
    operation: () => Promise<string[]>,
    operationName: string,
    options?: { showToast: boolean }
  ): Promise<ServiceResponse<string[]>> {
    return ErrorHandlingService.executeWithErrorHandling(
      operation,
      `CHECK_${operationName.toUpperCase()}`,
      options
    );
  }
  
  /**
   * Utility method to award achievements in batch
   */
  protected async awardAchievementsBatch(
    userId: string,
    achievementIds: string[]
  ): Promise<string[]> {
    if (!achievementIds.length) return [];
    
    const result = await AchievementService.checkAndAwardAchievements(userId, achievementIds);
    return result.success && Array.isArray(result.data) ? result.data || [] : [];
  }
}
