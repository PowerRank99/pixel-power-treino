
import { supabase } from '@/integrations/supabase/client';
import { ServiceResponse, ErrorHandlingService } from '@/services/common/ErrorHandlingService';
import { BaseAchievementChecker } from '../BaseAchievementChecker';
import { AchievementCategory } from '@/types/achievementTypes';

export class WorkoutCategoryChecker extends BaseAchievementChecker {
  async checkAchievements(userId: string): Promise<ServiceResponse<string[]>> {
    return this.executeWithErrorHandling(
      async () => {
        // Get category-specific achievements
        const { data: achievements } = await this.fetchAchievementsByCategory(
          AchievementCategory.WORKOUT,
          'requirements->count',
          { category_type: 'category' }
        );
        
        // Get workout categories
        const { data: workouts, error } = await supabase
          .from('workouts')
          .select('category')
          .eq('user_id', userId)
          .not('completed_at', 'is', null);
          
        if (error) throw error;
        
        // Count workouts by category
        const categoryCounts: Record<string, number> = {};
        workouts?.forEach(workout => {
          const category = workout.category || 'unknown';
          categoryCounts[category] = (categoryCounts[category] || 0) + 1;
        });
        
        const achievementsToCheck: string[] = [];
        
        achievements?.forEach(achievement => {
          const categoryType = achievement.category_type;
          const requiredCount = achievement.requirements?.count || 0;
          
          if (categoryType && categoryCounts[categoryType] && 
              categoryCounts[categoryType] >= requiredCount) {
            achievementsToCheck.push(achievement.id);
          }
        });
        
        return await this.awardAchievementsBatch(userId, achievementsToCheck);
      },
      'WORKOUT_CATEGORY_ACHIEVEMENTS'
    );
  }
}
