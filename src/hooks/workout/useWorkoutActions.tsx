
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useWorkoutCompletion } from '../useWorkoutCompletion';
import { useState, useCallback } from 'react';

const TIMEOUT_MS = 10000; // 10 seconds timeout for operations

// Modified timeout function with proper generic typing
const withTimeout = async <T,>(promiseFactory: () => Promise<T>, ms: number): Promise<T> => {
  let timeoutId: NodeJS.Timeout;
  
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error('Request timed out')), ms);
  });
  
  try {
    const resultPromise = promiseFactory();
    const result = await Promise.race([resultPromise, timeoutPromise]);
    clearTimeout(timeoutId);
    return result;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
};

export const useWorkoutActions = (workoutId: string | null) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { finishWorkout: finishWorkoutAction } = useWorkoutCompletion(workoutId);
  
  const finishWorkout = useCallback(async (elapsedTime: number, restTimerSettings: { minutes: number, seconds: number }) => {
    if (isSubmitting) {
      console.log("Already submitting, ignoring duplicate request");
      return false;
    }
    
    try {
      setIsSubmitting(true);
      console.log(`Finishing workout: ${workoutId} with duration: ${elapsedTime}`);
      console.log(`Timer settings at workout finish: ${restTimerSettings.minutes}m ${restTimerSettings.seconds}s`);
      
      if (!workoutId) {
        toast.error("Erro ao finalizar", {
          description: "ID do treino não encontrado"
        });
        return false;
      }
      
      // First, ensure the timer settings are saved
      // This is important to make sure they persist for future workouts
      try {
        console.log(`Saving final timer settings: ${restTimerSettings.minutes}m ${restTimerSettings.seconds}s`);
        // Use a transaction for updating timer settings to prevent race conditions
        const { data: updatedTimerData, error: timerError } = await supabase
          .from('workouts')
          .update({
            rest_timer_minutes: restTimerSettings.minutes,
            rest_timer_seconds: restTimerSettings.seconds
          })
          .eq('id', workoutId)
          .select('rest_timer_minutes, rest_timer_seconds');
          
        if (timerError) {
          console.error("Error saving final timer settings:", timerError);
          // Continue with workout completion even if timer settings fail
        } else {
          console.log("Successfully saved timer settings:", updatedTimerData);
        }
      } catch (timerError) {
        console.error("Error saving final timer settings:", timerError);
        // Continue with workout completion even if timer settings fail
      }
      
      // Proceed with finishing the workout
      const success = await finishWorkoutAction(elapsedTime);
      
      if (success) {
        toast.success("Treino finalizado!", {
          description: "Seu treino foi salvo com sucesso."
        });
      }
      
      return success;
    } catch (error) {
      console.error("Error finishing workout:", error);
      toast.error("Erro ao finalizar", {
        description: "Ocorreu um erro. Tente novamente."
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [isSubmitting, workoutId, finishWorkoutAction]);

  const discardWorkout = useCallback(async () => {
    if (isSubmitting) {
      console.log("Already submitting, ignoring duplicate request");
      return false;
    }
    
    if (!workoutId) {
      toast.error("Erro ao descartar treino", {
        description: "ID do treino não encontrado"
      });
      return false;
    }
    
    try {
      setIsSubmitting(true);
      console.log("Discarding workout:", workoutId);
      
      // Delete sets and workout directly with separate queries instead of using RPC
      try {
        await withTimeout(
          async () => {
            // First delete all sets associated with this workout
            const { error: setsError } = await supabase
              .from('workout_sets')
              .delete()
              .eq('workout_id', workoutId);
              
            if (setsError) throw setsError;
            
            // Then delete the workout itself
            const { error: workoutError } = await supabase
              .from('workouts')
              .delete()
              .eq('id', workoutId);
              
            if (workoutError) throw workoutError;
            
            return true;
          },
          TIMEOUT_MS
        );
      } catch (error) {
        console.error("Error or timeout deleting workout:", error);
        throw new Error("Erro ao excluir treino e suas séries");
      }
      
      return true;
    } catch (error) {
      console.error("Error discarding workout:", error);
      toast.error("Erro ao descartar treino", {
        description: error instanceof Error ? error.message : "Ocorreu um erro inesperado"
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [isSubmitting, workoutId]);
  
  return {
    finishWorkout,
    discardWorkout,
    isSubmitting
  };
};
