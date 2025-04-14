
import { supabase } from '@/integrations/supabase/client';
import { CachingService } from '../common/CachingService';
import { ExerciseHistoryFetchService } from './ExerciseHistoryFetchService';
import { ExerciseHistoryUpdateService } from './ExerciseHistoryUpdateService';
import { ExerciseHistory } from '@/types/workoutTypes';
import { DatabaseResult } from '@/types/workout';

const CACHE_DURATION = 15 * 60 * 1000; // 15 minutes for exercise data

export class ExerciseHistoryService {
  static async fetchExerciseHistory(userId: string, exerciseId: string) {
    const cacheKey = `exercise_history_${userId}_${exerciseId}`;
    const cached = CachingService.get(cacheKey);
    if (cached) return cached;

    const { data, error } = await supabase
      .from('exercise_history')
      .select('*')
      .eq('user_id', userId)
      .eq('exercise_id', exerciseId)
      .single();

    if (error) {
      console.error('Error fetching exercise history:', error);
      throw error;
    }

    CachingService.set(cacheKey, data, CACHE_DURATION);
    return data;
  }

  static clearCache(userId: string, exerciseId?: string) {
    if (exerciseId) {
      CachingService.clear(`exercise_history_${userId}_${exerciseId}`);
    } else {
      // Clear all exercise history cache for this user
      // This is a simplified approach - in a real implementation you might want
      // to only clear specific patterns
      CachingService.clear();
    }
  }
  
  // Add the missing methods as facades to the specialized services
  static async getMultipleExerciseHistory(exerciseIds: string[]): Promise<Record<string, ExerciseHistory>> {
    const result = await ExerciseHistoryFetchService.getMultipleExerciseHistory(exerciseIds);
    return result.success && result.data ? result.data : {};
  }
  
  static async updateExerciseHistory(
    exerciseId: string,
    weight: number,
    reps: number,
    sets: number
  ): Promise<DatabaseResult<boolean>> {
    return ExerciseHistoryUpdateService.updateExerciseHistory(
      exerciseId,
      weight,
      reps,
      sets
    );
  }
}
