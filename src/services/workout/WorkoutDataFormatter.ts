
import { WorkoutExercise } from '@/types/workoutTypes';
import { ExerciseHistoryService } from '@/services/ExerciseHistoryService';

/**
 * Service responsible for formatting workout data
 */
export class WorkoutDataFormatter {
  /**
   * Formats workout exercises with appropriate sets
   */
  static async formatWorkoutExercises(
    routineExercises: any[],
    workoutSets: any[] | null,
    previousWorkoutData: Record<string, any[]>
  ): Promise<WorkoutExercise[]> {
    // Extract all exercise IDs for bulk fetching
    const exerciseIds = routineExercises.map(re => re.exercises.id);
    
    // Get exercise history data
    const exerciseHistoryData = await ExerciseHistoryService.getMultipleExerciseHistory(exerciseIds);
    
    // Build exercise data with sets
    const workoutExercisesPromises = routineExercises.map(routineExercise => {
      const exercise = routineExercise.exercises;
      
      // Filter sets for this exercise and sort them
      const exerciseSets = workoutSets
        ?.filter(set => set.exercise_id === exercise.id)
        .sort((a, b) => a.set_order - b.set_order) || [];
      
      console.log(`[WorkoutDataFormatter] Exercise ${exercise.name} has ${exerciseSets.length} sets in database`);
      
      // Get history data for this exercise
      const historyData = exerciseHistoryData[exercise.id];
      
      // Get previous workout data for this exercise
      const previousExerciseData = previousWorkoutData[exercise.id] || [];
      
      // Format sets from database or create defaults
      let sets = [];
      
      if (exerciseSets.length > 0) {
        // Use existing sets from database
        sets = exerciseSets.map((set, index) => {
          // First try to get values from exercise history
          // Then fallback to previous workout data
          // Finally use defaults if nothing else is available
          
          const previousSet = previousExerciseData.find(p => p.set_order === set.set_order) || 
                            previousExerciseData[index] ||
                            { weight: '0', reps: '12' };
                            
          // Use exercise history as "previous" values if available
          const historyValues = historyData ? {
            weight: historyData.weight.toString(),
            reps: historyData.reps.toString()
          } : previousSet;
          
          return {
            id: set.id,
            weight: set.weight?.toString() || '0',
            reps: set.reps?.toString() || '0',
            completed: set.completed || false,
            set_order: set.set_order,
            previous: historyValues
          };
        });
      } else {
        // Create default sets using exercise history first, then previous workout data
        const targetSets = Math.max(
          historyData ? historyData.sets : 0,
          previousExerciseData.length > 0 ? previousExerciseData.length : 0,
          routineExercise.target_sets || 3
        );
        
        console.log(`[WorkoutDataFormatter] Creating ${targetSets} default sets for ${exercise.name}`);
        
        sets = Array.from({ length: targetSets }).map((_, index) => {
          // Prioritize exercise history for defaults
          let weight = '0';
          let reps = '12';
          
          if (historyData) {
            weight = historyData.weight.toString();
            reps = historyData.reps.toString();
            console.log(`[WorkoutDataFormatter] Using history for ${exercise.name}: weight=${weight}, reps=${reps}`);
          } else if (previousExerciseData[index]) {
            weight = previousExerciseData[index].weight;
            reps = previousExerciseData[index].reps;
          }
          
          return {
            id: `default-${exercise.id}-${index}`,
            weight: weight,
            reps: reps,
            completed: false,
            set_order: index,
            previous: {
              weight: weight,
              reps: reps
            }
          };
        });
      }
      
      return {
        id: exercise.id,
        name: exercise.name,
        sets
      };
    });
    
    // Wait for all exercise promises to resolve
    return Promise.all(workoutExercisesPromises);
  }
}
