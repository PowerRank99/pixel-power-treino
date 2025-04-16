
import { PassiveSkill, PassiveSkillContext, PassiveSkillResult } from '../types/PassiveSkillTypes';

/**
 * Força Bruta: +20% XP from weight training exercises
 * Guerreiro's primary ability
 */
export class ForcaBruta implements PassiveSkill {
  name = 'Força Bruta';
  description = '+20% XP de exercícios de musculação';
  userClass = 'Guerreiro';
  
  isApplicable(context: PassiveSkillContext): boolean {
    // Check if user is Guerreiro and has weight training exercises
    if (context.userClass !== this.userClass) return false;
    
    // Check if there are weight training exercises
    return (context.exerciseTypes['Musculação'] || 0) > 0;
  }
  
  calculate(context: PassiveSkillContext): PassiveSkillResult {
    // Calculate the ratio of weight training exercises to total exercises
    const weightTrainingCount = context.exerciseTypes['Musculação'] || 0;
    const weightTrainingRatio = weightTrainingCount / context.totalExercises;
    
    // Apply 20% bonus scaled by the ratio of weight training exercises
    const bonusMultiplier = 0.2 * weightTrainingRatio;
    const bonusXP = Math.round(context.baseXP * bonusMultiplier);
    
    return {
      bonusXP,
      description: this.description,
      skillName: this.name,
      multiplier: bonusMultiplier
    };
  }
}

/**
 * Saindo da Jaula: +10% XP for workouts with Personal Records
 * Guerreiro's secondary ability
 */
export class SaindoDaJaula implements PassiveSkill {
  name = 'Saindo da Jaula';
  description = '+10% XP por bater recorde pessoal';
  userClass = 'Guerreiro';
  
  isApplicable(context: PassiveSkillContext): boolean {
    // Only applicable if user is Guerreiro and has a PR
    return context.userClass === this.userClass && context.hasPR;
  }
  
  calculate(context: PassiveSkillContext): PassiveSkillResult {
    // Apply 10% bonus for having a PR
    const bonusMultiplier = 0.1;
    const bonusXP = Math.round(context.baseXP * bonusMultiplier);
    
    return {
      bonusXP,
      description: this.description,
      skillName: this.name,
      multiplier: bonusMultiplier
    };
  }
}
