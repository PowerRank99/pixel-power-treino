
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { XPService } from '@/services/rpg/XPService';
import { AchievementService } from '@/services/rpg/AchievementService';
import { StreakService } from '@/services/rpg/StreakService';
import { WorkoutExercise } from '@/types/workoutTypes';

export const useWorkoutCompletion = (
  workoutId: string | null,
  elapsedTime: number,
  navigate: ReturnType<typeof useNavigate>
) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const finishWorkout = async () => {
    if (!workoutId) {
      toast.error("Erro ao finalizar", {
        description: "ID do treino não encontrado"
      });
      return false;
    }
    
    try {
      setIsSubmitting(true);
      console.log("Finishing workout:", workoutId, "with duration:", elapsedTime);
      
      // Get workout data to check user_id and routine_id
      const { data: workoutData, error: fetchError } = await supabase
        .from('workouts')
        .select('user_id, routine_id')
        .eq('id', workoutId)
        .single();
        
      if (fetchError || !workoutData) {
        console.error("Error fetching workout data:", fetchError);
        throw new Error("Não foi possível localizar os dados do treino");
      }
      
      const userId = workoutData.user_id;
      if (!userId) {
        console.error("No user ID associated with workout");
        throw new Error("Treino sem usuário associado");
      }
      
      // Update workout with completion status
      const { error } = await supabase
        .from('workouts')
        .update({
          completed_at: new Date().toISOString(),
          duration_seconds: elapsedTime
        })
        .eq('id', workoutId);
        
      if (error) {
        throw error;
      }
      
      // Get workout exercises and details for XP calculation
      let exercises: WorkoutExercise[] = [];
      try {
        const { data: exerciseSets, error: setsError } = await supabase
          .from('workout_sets')
          .select('id, exercise_id, weight, reps, completed, set_order, exercises(id, name)')
          .eq('workout_id', workoutId)
          .order('set_order', { ascending: true });
        
        if (setsError) throw setsError;
        
        // Group sets by exercise
        const exerciseMap: Record<string, WorkoutExercise> = {};
        exerciseSets.forEach(set => {
          const exerciseId = set.exercise_id;
          if (!exerciseId) return;
          
          if (!exerciseMap[exerciseId]) {
            exerciseMap[exerciseId] = {
              id: exerciseId,
              name: set.exercises?.name || 'Unknown Exercise',
              sets: []
            };
          }
          
          exerciseMap[exerciseId].sets.push({
            id: set.id,
            weight: set.weight?.toString() || '0',
            reps: set.reps?.toString() || '0',
            completed: set.completed || false,
            set_order: set.set_order
          });
        });
        
        exercises = Object.values(exerciseMap);
      } catch (exercisesError) {
        console.error("Error fetching workout exercises:", exercisesError);
        // Continue with empty exercises array, we'll still award minimal XP
      }
      
      // Get user profile data to determine class and streak
      let userProfile;
      try {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('class, streak')
          .eq('id', userId)
          .single();
          
        if (profileError) throw profileError;
        userProfile = profile;
      } catch (profileError) {
        console.error("Error fetching user profile:", profileError);
        // Continue with default values
      }
      
      // RPG System integration
      try {
        // Step 1: Update user streak
        await StreakService.updateStreak(userId);
        
        // Step 2: Get workout difficulty (defaulting to intermediate)
        let difficulty: 'iniciante' | 'intermediario' | 'avancado' = 'intermediario';
        if (workoutData.routine_id) {
          try {
            const { data: routineData } = await supabase
              .from('routines')
              .select('difficulty')
              .eq('id', workoutData.routine_id)
              .single();
              
            if (routineData?.difficulty) {
              difficulty = routineData.difficulty as 'iniciante' | 'intermediario' | 'avancado';
            }
          } catch (routineError) {
            console.error("Error fetching routine difficulty:", routineError);
          }
        }
        
        // Step 3: Check for personal records
        const personalRecords = await XPService.checkForPersonalRecords(userId, {
          id: workoutId,
          exercises,
          durationSeconds: elapsedTime,
          difficulty
        });
        
        // Step 4: Calculate and award XP
        const baseXP = XPService.calculateWorkoutXP(
          { id: workoutId, exercises, durationSeconds: elapsedTime, difficulty },
          userProfile?.class,
          userProfile?.streak || 0,
          difficulty
        );
        
        await XPService.awardXP(userId, baseXP, personalRecords);
        
        // Step 5: Check for achievements
        await AchievementService.checkAchievements(userId);
      } catch (rpgError) {
        // Log but don't fail the workout completion
        console.error("Error processing RPG rewards:", rpgError);
      }
      
      // Toast notification
      toast.success("Treino finalizado", {
        description: "Seu treino foi salvo com sucesso!"
      });
      
      // Redirect to workout page after a delay
      setTimeout(() => {
        navigate('/treino');
      }, 1500);
      
      return true;
    } catch (error: any) {
      console.error("Error finishing workout:", error);
      toast.error("Erro ao finalizar treino", {
        description: error.message || "Ocorreu um erro ao salvar seu treino"
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const discardWorkout = async () => {
    if (!workoutId) {
      toast.error("Erro ao descartar", {
        description: "ID do treino não encontrado"
      });
      return false;
    }
    
    try {
      setIsSubmitting(true);
      console.log("Discarding workout:", workoutId);
      
      // Delete workout
      const { error } = await supabase
        .from('workouts')
        .delete()
        .eq('id', workoutId);
        
      if (error) {
        throw error;
      }
      
      toast.info("Treino descartado");
      
      // Redirect to workout page
      navigate('/treino');
      
      return true;
    } catch (error: any) {
      console.error("Error discarding workout:", error);
      toast.error("Erro ao descartar treino", {
        description: error.message || "Ocorreu um erro ao descartar seu treino"
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    finishWorkout,
    discardWorkout,
    isSubmitting
  };
};
