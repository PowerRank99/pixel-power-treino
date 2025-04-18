
import { EXERCISE_TYPES, CLASS_PASSIVE_SKILLS, EXERCISE_TYPE_CATEGORIES } from '../constants/exerciseTypes';
import { WorkoutExercise } from '@/types/workoutTypes';
import { ClassBonusBreakdown } from '../types/classTypes';
import { GuerreiroBonus } from './class-bonuses/GuerreiroBonus';
import { MongeBonus } from './class-bonuses/MongeBonus';
import { NinjaBonus } from './class-bonuses/NinjaBonus';
import { BruxoBonus } from './class-bonuses/BruxoBonus';
import { PaladinoBonus } from './class-bonuses/PaladinoBonus';

/**
 * Service for calculating class-specific XP bonuses
 * Coordinates the individual class bonus calculators
 */
export class ClassBonusCalculator {
  /**
   * Check if an exercise matches a specific category
   */
  static exerciseMatchesCategory(exercise: WorkoutExercise, categoryKey: keyof typeof EXERCISE_TYPES): boolean {
    // If there's no type, we default to "Musculação"
    const exerciseType = exercise.type || 'Musculação';
    
    // If we have a direct mapping from the exercise.type to our categories, use that
    if (exerciseType in EXERCISE_TYPE_CATEGORIES) {
      const mappedCategory = EXERCISE_TYPE_CATEGORIES[exerciseType as keyof typeof EXERCISE_TYPE_CATEGORIES];
      return mappedCategory === categoryKey;
    }
    
    // Fallback: check exercise name against keywords
    const keywords = EXERCISE_TYPES[categoryKey];
    if (!keywords || !exercise.name) return false;
    
    const lowerName = exercise.name.toLowerCase();
    return keywords.some(keyword => lowerName.includes(keyword.toLowerCase()));
  }
  
  /**
   * Apply class-specific bonuses to XP
   */
  static applyClassBonuses(
    baseXP: number,
    workout: {
      id: string;
      exercises: WorkoutExercise[];
      durationSeconds: number;
      hasPR?: boolean;
    },
    userClass?: string | null,
    streak: number = 0
  ): { totalXP: number, bonusBreakdown: ClassBonusBreakdown[] } {
    if (!userClass) return { totalXP: baseXP, bonusBreakdown: [] };
    
    let totalXP = baseXP;
    let bonusBreakdown: ClassBonusBreakdown[] = [];
    
    // Apply class-specific bonuses by delegating to appropriate class calculator
    switch(userClass) {
      case 'Guerreiro': {
        const { bonusXP, bonusBreakdown: breakdown } = GuerreiroBonus.applyBonuses(baseXP, workout);
        totalXP += bonusXP;
        bonusBreakdown = breakdown;
        break;
      }
        
      case 'Monge': {
        const { bonusXP, bonusBreakdown: breakdown } = MongeBonus.applyBonuses(baseXP, workout, streak);
        totalXP += bonusXP;
        bonusBreakdown = breakdown;
        break;
      }
        
      case 'Ninja': {
        const { bonusXP, bonusBreakdown: breakdown } = NinjaBonus.applyBonuses(baseXP, workout);
        totalXP += bonusXP;
        bonusBreakdown = breakdown;
        break;
      }
        
      case 'Bruxo': {
        const { bonusXP, bonusBreakdown: breakdown } = BruxoBonus.applyBonuses(baseXP, workout);
        totalXP += bonusXP;
        bonusBreakdown = breakdown;
        break;
      }
        
      case 'Paladino': {
        const { bonusXP, bonusBreakdown: breakdown } = PaladinoBonus.applyBonuses(baseXP, workout);
        totalXP += bonusXP;
        bonusBreakdown = breakdown;
        break;
      }
    }
    
    return { totalXP, bonusBreakdown };
  }
  
  /**
   * Check if Bruxo should preserve streak using the database
   */
  static async shouldPreserveStreak(userId: string, userClass: string | null): Promise<boolean> {
    if (!userId || userClass !== 'Bruxo') return false;
    return BruxoBonus.shouldPreserveStreak(userId);
  }
  
  /**
   * Calculate Paladino guild XP bonus
   * @returns Bonus multiplier (1.1 to 1.3)
   */
  static getPaladinoGuildBonus(userId: string, userClass: string | null, currentContribution: number): number {
    if (!userId || userClass !== 'Paladino') return 1.0;
    return PaladinoBonus.getGuildBonus(currentContribution);
  }
}
