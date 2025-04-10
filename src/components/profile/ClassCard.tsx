
import React from 'react';
import { Shield, Sword, Dumbbell, Wind, Sparkles } from 'lucide-react';
import { ClassService } from '@/services/rpg/ClassService';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ClassBonus {
  description: string | React.ReactNode;
  value: string;
}

interface ClassCardProps {
  className: string;
  description: string;
  icon?: React.ReactNode;
  bonuses: ClassBonus[];
  showAvatar?: boolean;
  colorClass?: string;
}

// Icon mapping for bonus types
const BonusIconMap: Record<string, React.ReactNode> = {
  compound: <Sword className="w-4 h-4" />,
  strength: <Dumbbell className="w-4 h-4" />,
  bodyweight: <Wind className="w-4 h-4" />,
  cardio: <Wind className="w-4 h-4" />,
  flexibility: <Sparkles className="w-4 h-4" />,
  recovery: <Shield className="w-4 h-4" />,
};

// Class flavor text map
const ClassFlavorMap: Record<string, string> = {
  'guerreiro': 'Domina a força bruta. Guerreiros ganham mais XP com pesos pesados.',
  'monge': 'Mestre do próprio corpo. Monges prosperam com exercícios corporais e consistência.',
  'ninja': 'Veloz como o vento. Ninjas se destacam em treinos intensos e rápidos.',
  'bruxo': 'Flexível e resiliente. Bruxos dominam a mobilidade e recuperação.',
  'paladino': 'Atleta versátil. Paladinos ganham bônus em esportes e treinos longos.',
  'sem classe': 'Escolha uma classe para desbloquear bônus de experiência.',
};

const ClassCard: React.FC<ClassCardProps> = ({
  className,
  description,
  icon,
  bonuses,
  showAvatar = false,
  colorClass
}) => {
  // Get appropriate icon based on class
  const getDefaultIcon = () => {
    switch (className.toLowerCase()) {
      case 'guerreiro': return <Sword className="h-6 w-6 text-white" />;
      case 'monge': return <Dumbbell className="h-6 w-6 text-white" />;
      case 'ninja': return <Wind className="h-6 w-6 text-white" />;
      case 'bruxo': return <Sparkles className="h-6 w-6 text-white" />;
      case 'paladino': return <Shield className="h-6 w-6 text-white" />;
      default: return <Shield className="h-6 w-6 text-white" />;
    }
  };
  
  // Get class avatar image
  const getClassAvatarImage = () => {
    // Default images for each class
    const avatarMap: Record<string, string> = {
      'guerreiro': '/lovable-uploads/71073810-f05a-4adc-a860-636599324c62.png',
      'monge': '/lovable-uploads/38b244e2-15ad-44b7-8d2d-48eb9e4227a8.png',
      'ninja': '/lovable-uploads/f018410c-9031-4726-b654-ec51c1bbd72b.png',
      'bruxo': '/lovable-uploads/174ea5f4-db2b-4392-a948-5ec67969f043.png',
      'paladino': '/lovable-uploads/7164b50e-55bc-43ae-9127-1c693ab31e70.png'
    };
    
    return avatarMap[className.toLowerCase()] || '/lovable-uploads/d84a92f5-828a-4ff9-a21b-3233e15d4276.png';
  };

  // Get bonus icon based on description text
  const getBonusIcon = (description: string | React.ReactNode) => {
    if (typeof description !== 'string') return BonusIconMap.strength;
    
    const lowerDesc = description.toLowerCase();
    if (lowerDesc.includes('compost') || lowerDesc.includes('agachamento') || lowerDesc.includes('supino')) return BonusIconMap.compound;
    if (lowerDesc.includes('força')) return BonusIconMap.strength;
    if (lowerDesc.includes('peso corporal') || lowerDesc.includes('bodyweight')) return BonusIconMap.bodyweight;
    if (lowerDesc.includes('cardio') || lowerDesc.includes('hiit')) return BonusIconMap.cardio;
    if (lowerDesc.includes('flex') || lowerDesc.includes('yoga')) return BonusIconMap.flexibility;
    if (lowerDesc.includes('recup') || lowerDesc.includes('mobil')) return BonusIconMap.recovery;
    
    return BonusIconMap.strength;
  };
  
  const cardIcon = icon || getDefaultIcon();
  
  // Get flavor text for the class
  const getFlavorText = () => {
    return ClassFlavorMap[className.toLowerCase()] || 'Siga sua jornada para evoluir suas habilidades.';
  };
  
  // Consolidate and translate bonuses - limit to maximum 2
  const consolidateBonuses = (bonuses: ClassBonus[]) => {
    if (!bonuses || bonuses.length === 0) return [];
    
    // Filter out duplicates and English versions
    const seen = new Set();
    const uniqueBonuses = bonuses.filter(bonus => {
      if (typeof bonus.description !== 'string') return true;
      
      // Skip loading placeholders
      if (bonus.description.toString().includes('loading-text')) return true;
      
      const lowerDesc = bonus.description.toLowerCase();
      if (seen.has(lowerDesc)) return false;
      seen.add(lowerDesc);
      
      return true;
    }).map(bonus => {
      if (typeof bonus.description === 'string') {
        // Merge duplicate descriptions that might be in different languages
        if (bonus.description.toLowerCase().includes('compound lift') || 
            bonus.description.toLowerCase().includes('exercícios compostos')) {
          return {
            ...bonus,
            description: "+20% XP de exercícios compostos (agachamento, supino, terra)"
          };
        }
        if (bonus.description.toLowerCase().includes('strength') || 
            bonus.description.toLowerCase().includes('força')) {
          return {
            ...bonus,
            description: "+10% XP de todos os exercícios de força"
          };
        }
      }
      return bonus;
    });
    
    // Only return the first 2 bonuses
    return uniqueBonuses.slice(0, 2);
  };
  
  const displayBonuses = consolidateBonuses(bonuses);
  
  // Generate gradient background based on class
  const getCardGradient = () => {
    if (colorClass) {
      return `bg-gradient-to-br ${colorClass} bg-opacity-10`;
    }
    
    // Default gradient if no colorClass provided
    return 'bg-midnight-card';
  };
  
  return (
    <div className={`class-card p-4 mt-4 transition-all duration-300 hover:shadow-glow-purple border border-arcane-15 hover:border-arcane-30 rounded-xl ${getCardGradient()}`}>
      <div className="flex items-center mb-3">
        <div className="relative">
          <div className="w-12 h-12 bg-midnight-elevated backdrop-blur-sm rounded-lg flex items-center justify-center mr-3 shadow-subtle overflow-hidden border border-arcane-30">
            {showAvatar ? (
              <img 
                src={getClassAvatarImage()} 
                alt={className}
                className="w-full h-full object-cover object-center"
              />
            ) : (
              <div className="animate-pulse">{cardIcon}</div>
            )}
          </div>
          {showAvatar && (
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-arcane rounded-full flex items-center justify-center shadow-glow-purple">
              {cardIcon}
            </div>
          )}
        </div>
        <div>
          <h3 className="orbitron-text font-bold text-xl text-text-primary">{className}</h3>
          <p className="text-sm text-text-secondary font-sora">{description}</p>
        </div>
      </div>
      
      <div className="mt-4">
        <div className="flex items-center mb-2 font-sora">
          <span className="bg-arcane-15 rounded-full p-1 mr-2 border border-arcane-30 shadow-subtle text-arcane-60">🟣</span>
          <span className="text-sm text-text-secondary">Bônus Passivo</span>
        </div>
        
        {displayBonuses.length > 0 ? (
          <div className="grid grid-cols-1 gap-3">
            {displayBonuses.map((bonus, index) => (
              <TooltipProvider key={index}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="transition-all duration-300 hover:scale-105 bg-midnight-elevated backdrop-blur-sm rounded-lg p-3 shadow-subtle hover:shadow-glow-purple border border-arcane-30 flex items-center">
                      <div className="flex-shrink-0 mr-3 bg-arcane-15 p-1.5 rounded-full border border-arcane-30">
                        {typeof bonus.description === 'string' ? getBonusIcon(bonus.description) : BonusIconMap.strength}
                      </div>
                      <div className="flex items-center flex-1">
                        <span className="text-lg font-bold mr-2 whitespace-nowrap font-space text-arcane shadow-glow-subtle">{bonus.value}</span>
                        <p className="text-sm font-sora text-text-secondary">{bonus.description}</p>
                      </div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <p className="text-xs">Bônus aplicado automaticamente durante treinos</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
          </div>
        ) : (
          <div className="mb-3 bg-midnight-elevated backdrop-blur-sm rounded-lg p-3 shadow-subtle border border-arcane-30">
            <p className="text-sm text-center text-text-tertiary font-sora">
              {className === 'Sem Classe' 
                ? 'Selecione uma classe para obter bônus' 
                : 'Carregando bonificações...'}
            </p>
          </div>
        )}
        
        {/* Class flavor text */}
        <div className="mt-4 text-sm font-sora text-text-tertiary italic border-t border-divider pt-3">
          {getFlavorText()}
        </div>
      </div>
    </div>
  );
};

export default ClassCard;
