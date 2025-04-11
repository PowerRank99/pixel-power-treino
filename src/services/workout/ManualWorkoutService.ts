
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { XPService } from '@/services/rpg/XPService';
import { StreakService } from '@/services/rpg/StreakService';
import { AchievementService } from '@/services/rpg/AchievementService';
import { XPBonusService } from '@/services/rpg/XPBonusService';

export interface ManualWorkout {
  id: string;
  description?: string | null;
  activityType?: string | null;
  photoUrl: string;
  xpAwarded: number;
  createdAt: string;
  workoutDate: string;
  isPowerDay: boolean;
}

export class ManualWorkoutService {
  static readonly BASE_XP = 100;
  static readonly POWER_DAY_CAP = 500;
  
  /**
   * Submit a manual workout
   */
  static async submitManualWorkout(
    userId: string,
    photoUrl: string,
    description?: string,
    activityType?: string,
    workoutDate?: Date
  ): Promise<{ success: boolean; error?: string; isPowerDay?: boolean }> {
    try {
      // Validate inputs
      if (!userId) {
        throw new Error('Usuário não autenticado');
      }
      
      if (!photoUrl) {
        throw new Error('Foto do treino é obrigatória');
      }
      
      // Ensure workout date is not more than 24 hours in the past
      const submissionDate = workoutDate || new Date();
      const now = new Date();
      const timeDiff = now.getTime() - submissionDate.getTime();
      const hoursDiff = timeDiff / (1000 * 3600);
      
      if (hoursDiff > 24) {
        throw new Error('Data do treino não pode ser mais de 24 horas no passado');
      }
      
      // Check if user can submit a manual workout (less than 24 hours since last submission)
      const { data: recentSubmissions, error: recentError } = await supabase.rpc(
        'check_recent_manual_workouts',
        {
          p_user_id: userId,
          p_hours: 24
        }
      );
      
      if (recentError) {
        console.error('Error checking recent submissions:', recentError);
        throw new Error('Erro ao verificar submissões recentes');
      }
      
      // Safely parse the count
      let recentCount = 0;
      if (Array.isArray(recentSubmissions) && recentSubmissions.length > 0) {
        recentCount = parseInt(recentSubmissions[0]?.count.toString() || '0');
      }
      
      if (recentCount > 0) {
        throw new Error('Você já registrou um treino manual nas últimas 24 horas');
      }
      
      // Get user profile to determine class and streak
      const { data: userProfile, error: profileError } = await supabase
        .from('profiles')
        .select('class, streak, last_workout_at')
        .eq('id', userId)
        .single();
        
      if (profileError) {
        console.error('Error fetching user profile:', profileError);
        throw new Error('Erro ao buscar perfil do usuário');
      }
      
      // Check if this is a power day (user completed both regular and manual workout today)
      let isPowerDay = false;
      
      // Check if the user has a completed workout today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const { count: workoutsToday, error: workoutError } = await supabase
        .from('workouts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .gte('completed_at', today.toISOString())
        .lt('completed_at', new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString());
        
      if (workoutError) {
        console.error('Error checking today workouts:', workoutError);
      } else if (workoutsToday && workoutsToday > 0) {
        isPowerDay = true;
      }
      
      // Check power day availability if this is a power day
      let powerDayAvailable = false;
      let powerDayWeek = 0;
      let powerDayYear = 0;
      
      if (isPowerDay) {
        // Check power day usage for current week
        const powerDayData = await XPBonusService.checkPowerDayAvailability(userId);
        
        powerDayAvailable = powerDayData.available;
        powerDayWeek = powerDayData.week;
        powerDayYear = powerDayData.year;
        
        if (!powerDayAvailable) {
          // This is still a power day, but user won't get the higher XP cap
          console.log('Power day detected but weekly limit reached');
          toast.info('Você atingiu o limite semanal de Power Days');
        } else if (powerDayAvailable) {
          // Record power day usage
          await XPBonusService.recordPowerDayUsage(
            userId, 
            powerDayWeek, 
            powerDayYear
          );
        }
      }
      
      // Calculate XP with class bonuses
      let totalXP = this.BASE_XP;
      
      // Apply streak bonus
      if (userProfile?.streak && userProfile.streak > 1) {
        const streakMultiplier = XPService.getStreakMultiplier(userProfile.streak);
        totalXP = Math.floor(totalXP * streakMultiplier);
      }
      
      // Apply class bonus based on activity type (if applicable)
      if (userProfile?.class && activityType) {
        const classBonus = this.getClassBonus(userProfile.class, activityType);
        if (classBonus > 0) {
          const bonusXP = Math.floor(totalXP * classBonus);
          totalXP += bonusXP;
        }
      }
      
      // Apply daily XP cap
      let cappedXP = Math.min(totalXP, XPService.DAILY_XP_CAP);
      
      // Apply power day cap if applicable
      if (isPowerDay && powerDayAvailable) {
        cappedXP = Math.min(totalXP, this.POWER_DAY_CAP);
      }
      
      // Insert manual workout record using RPC
      const { data: insertData, error: insertError } = await supabase.rpc(
        'create_manual_workout',
        {
          p_user_id: userId,
          p_description: description || null,
          p_activity_type: activityType || null,
          p_photo_url: photoUrl,
          p_xp_awarded: cappedXP,
          p_workout_date: submissionDate.toISOString(),
          p_is_power_day: isPowerDay && powerDayAvailable
        }
      );
      
      if (insertError) {
        console.error('Error inserting manual workout:', insertError);
        throw new Error('Erro ao salvar treino manual');
      }
      
      // Update user streak
      await StreakService.updateStreak(userId);
      
      // Award XP
      await XPService.awardXP(userId, cappedXP);
      
      // Check for achievements
      await AchievementService.checkAchievements(userId);
      
      // Show success message
      const powerDayMessage = (isPowerDay && powerDayAvailable) 
        ? ' Power Day! Limite de XP aumentado para 500.'
        : '';
        
      toast.success(`Treino registrado! +${cappedXP} XP`, {
        description: `Treino manual adicionado com sucesso.${powerDayMessage}`
      });
      
      return { 
        success: true, 
        isPowerDay: isPowerDay && powerDayAvailable 
      };
    } catch (error: any) {
      console.error('Error submitting manual workout:', error);
      toast.error('Erro ao registrar treino', {
        description: error.message || 'Ocorreu um erro ao registrar seu treino'
      });
      return { success: false, error: error.message };
    }
  }
  
  /**
   * Get manual workouts for a user
   */
  static async getUserManualWorkouts(userId: string): Promise<ManualWorkout[]> {
    try {
      // Use RPC to fetch manual workouts
      const { data, error } = await supabase.rpc(
        'get_user_manual_workouts',
        {
          p_user_id: userId
        }
      );
      
      if (error) {
        console.error('Error fetching manual workouts:', error);
        return [];
      }
      
      // Safely handle the response data
      if (!data || !Array.isArray(data)) {
        return [];
      }
      
      // Map the data to our ManualWorkout interface
      return data.map((workout: any) => ({
        id: workout.id,
        description: workout.description,
        activityType: workout.activity_type,
        photoUrl: workout.photo_url,
        xpAwarded: workout.xp_awarded,
        createdAt: workout.created_at,
        workoutDate: workout.workout_date,
        isPowerDay: workout.is_power_day
      }));
    } catch (error) {
      console.error('Error getting manual workouts:', error);
      return [];
    }
  }
  
  /**
   * Get class bonus for activity type
   */
  private static getClassBonus(userClass: string, activityType: string): number {
    // Default activity-to-class bonus mapping
    const classActivityBonuses: Record<string, Record<string, number>> = {
      Guerreiro: {
        'strength': 0.2, // 20% bonus
        'lifting': 0.2
      },
      Monge: {
        'bodyweight': 0.2,
        'mobility': 0.15
      },
      Ninja: {
        'running': 0.2,
        'cardio': 0.2,
        'hiit': 0.2,
        'short': 0.15 // Short workouts
      },
      Bruxo: {
        'yoga': 0.4,
        'stretching': 0.4,
        'flexibility': 0.4,
        'meditation': 0.2
      },
      Paladino: {
        'sports': 0.4,
        'team': 0.3,
        'outdoor': 0.2
      }
    };
    
    // Normalize activity type to lowercase
    const normalizedActivity = activityType.toLowerCase();
    
    // Check if user's class has bonuses for this activity type
    if (userClass && classActivityBonuses[userClass]) {
      // Find any matching bonus keys
      for (const [key, bonus] of Object.entries(classActivityBonuses[userClass])) {
        if (normalizedActivity.includes(key)) {
          return bonus;
        }
      }
    }
    
    return 0; // No bonus
  }
}
