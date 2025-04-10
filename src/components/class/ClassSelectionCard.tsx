
import React from 'react';
import { motion } from 'framer-motion';
import { ClassInfo } from '@/services/rpg/ClassService';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Check, Info, Clock, Star } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import ClassIconSelector from '@/components/profile/ClassIconSelector';
import { getBonusTypeIcon } from '../class/ClassIconUtils';

interface ClassSelectionCardProps {
  classInfo: ClassInfo;
  isCurrentClass: boolean;
  isSelected: boolean;
  isFocused: boolean;
  isOnCooldown: boolean;
  onClick: () => void;
}

const ClassSelectionCard: React.FC<ClassSelectionCardProps> = ({
  classInfo,
  isCurrentClass,
  isSelected,
  isFocused,
  isOnCooldown,
  onClick
}) => {
  const isAvailable = !isOnCooldown || isCurrentClass;
  
  const renderBonuses = () => {
    return classInfo.bonuses.slice(0, 2).map((bonus, index) => (
      <div key={index} className="flex items-center bg-midnight-elevated backdrop-blur-sm rounded-lg p-3 shadow-subtle border-divider/40 border hover:scale-105 transition-all">
        <div className={`flex-shrink-0 mr-3 ${getClassIconBackgroundColor()} p-1.5 rounded-full border ${getClassBorderColor()}`}>
          {getBonusTypeIcon(bonus.bonus_type)}
        </div>
        <div className="flex items-center flex-1">
          <span className={`text-lg font-bold mr-2 whitespace-nowrap font-space ${getClassTextColor()} shadow-glow-subtle`}>{`+${Math.round(bonus.bonus_value * 100)}%`}</span>
          <p className="text-sm font-sora text-text-secondary">{bonus.description}</p>
        </div>
      </div>
    ));
  };
  
  const getClassBackgroundColor = () => {
    switch(classInfo.class_name) {
      case 'Guerreiro': return 'bg-gradient-to-br from-red-600/20 to-red-700/10';
      case 'Monge': return 'bg-gradient-to-br from-amber-600/20 to-amber-700/10';
      case 'Ninja': return 'bg-gradient-to-br from-emerald-600/20 to-emerald-700/10';
      case 'Bruxo': return 'bg-gradient-to-br from-violet-600/20 to-violet-700/10';
      case 'Paladino': return 'bg-gradient-to-br from-blue-600/20 to-blue-700/10';
      default: return 'bg-gradient-to-br from-arcane/20 to-arcane/10';
    }
  };
  
  const getClassBorderColor = () => {
    switch(classInfo.class_name) {
      case 'Guerreiro': return 'border-red-500/30';
      case 'Monge': return 'border-amber-500/30';
      case 'Ninja': return 'border-emerald-500/30';
      case 'Bruxo': return 'border-violet-500/30';
      case 'Paladino': return 'border-blue-500/30';
      default: return 'border-arcane/30';
    }
  };
  
  const getClassTextColor = () => {
    switch(classInfo.class_name) {
      case 'Guerreiro': return 'text-red-500';
      case 'Monge': return 'text-amber-500';
      case 'Ninja': return 'text-emerald-500';
      case 'Bruxo': return 'text-violet-500';
      case 'Paladino': return 'text-blue-500';
      default: return 'text-arcane';
    }
  };
  
  const getClassShadowColor = () => {
    switch(classInfo.class_name) {
      case 'Guerreiro': return 'shadow-red-500/20';
      case 'Monge': return 'shadow-amber-500/20';
      case 'Ninja': return 'shadow-emerald-500/20';
      case 'Bruxo': return 'shadow-violet-500/20';
      case 'Paladino': return 'shadow-blue-500/20';
      default: return 'shadow-purple-500/20';
    }
  };
  
  const getClassIconBackgroundColor = () => {
    switch(classInfo.class_name) {
      case 'Guerreiro': return 'bg-red-500/15 border-red-500/30';
      case 'Monge': return 'bg-amber-500/15 border-amber-500/30';
      case 'Ninja': return 'bg-emerald-500/15 border-emerald-500/30';
      case 'Bruxo': return 'bg-violet-500/15 border-violet-500/30';
      case 'Paladino': return 'bg-blue-500/15 border-blue-500/30';
      default: return 'bg-arcane/15 border-arcane/30';
    }
  };
  
  const getClassButtonColor = () => {
    switch(classInfo.class_name) {
      case 'Guerreiro': return 'bg-red-500 hover:bg-red-600';
      case 'Monge': return 'bg-amber-500 hover:bg-amber-600';
      case 'Ninja': return 'bg-emerald-500 hover:bg-emerald-600';
      case 'Bruxo': return 'bg-violet-500 hover:bg-violet-600';
      case 'Paladino': return 'bg-blue-500 hover:bg-blue-600';
      default: return 'bg-arcane hover:bg-arcane-60';
    }
  };
  
  const getClassBadgeVariant = () => {
    switch(classInfo.class_name) {
      case 'Guerreiro': return 'valor';
      case 'Monge': return 'secondary';
      case 'Ninja': return 'arcane';
      case 'Bruxo': return 'achievement';
      case 'Paladino': return 'destructive';
      default: return 'arcane';
    }
  };
  
  const getSelectedBorderColor = () => {
    switch(classInfo.class_name) {
      case 'Guerreiro': return 'border-red-500 shadow-red-500/30';
      case 'Monge': return 'border-amber-500 shadow-amber-500/30';
      case 'Ninja': return 'border-emerald-500 shadow-emerald-500/30';
      case 'Bruxo': return 'border-violet-500 shadow-violet-500/30';
      case 'Paladino': return 'border-blue-500 shadow-blue-500/30';
      default: return 'border-arcane shadow-purple-500/30';
    }
  };
  
  const getOutlineButtonColor = () => {
    switch(classInfo.class_name) {
      case 'Guerreiro': return 'hover:bg-red-500/15 hover:text-red-500 border-red-500/20';
      case 'Monge': return 'hover:bg-amber-500/15 hover:text-amber-500 border-amber-500/20';
      case 'Ninja': return 'hover:bg-emerald-500/15 hover:text-emerald-500 border-emerald-500/20';
      case 'Bruxo': return 'hover:bg-violet-500/15 hover:text-violet-500 border-violet-500/20';
      case 'Paladino': return 'hover:bg-blue-500/15 hover:text-blue-500 border-blue-500/20';
      default: return 'hover:bg-arcane/15 hover:text-arcane border-arcane/20';
    }
  };
  
  const getCurrentClassColor = () => {
    switch(classInfo.class_name) {
      case 'Guerreiro': return 'bg-red-500/15 text-red-500 border-red-500/30';
      case 'Monge': return 'bg-amber-500/15 text-amber-500 border-amber-500/30';
      case 'Ninja': return 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30';
      case 'Bruxo': return 'bg-violet-500/15 text-violet-500 border-violet-500/30';
      case 'Paladino': return 'bg-blue-500/15 text-blue-500 border-blue-500/30';
      default: return 'bg-arcane/15 text-arcane border-arcane/30';
    }
  };
  
  const getCurrentClassIndicatorColor = () => {
    switch(classInfo.class_name) {
      case 'Guerreiro': return 'bg-gradient-to-r from-red-500 to-red-600';
      case 'Monge': return 'bg-gradient-to-r from-amber-500 to-amber-600';
      case 'Ninja': return 'bg-gradient-to-r from-emerald-500 to-emerald-600';
      case 'Bruxo': return 'bg-gradient-to-r from-violet-500 to-violet-600';
      case 'Paladino': return 'bg-gradient-to-r from-blue-500 to-blue-600';
      default: return 'bg-gradient-to-r from-arcane to-arcane-60';
    }
  };
  
  return (
    <motion.div
      whileHover={isAvailable ? { scale: 1.01 } : {}}
      whileTap={isAvailable ? { scale: 0.99 } : {}}
      className={`relative transition-all duration-300 ${isOnCooldown && !isCurrentClass ? 'opacity-70' : ''}`}
    >
      <Card
        className={`border overflow-hidden h-full transition-all duration-300 ${
          isSelected
            ? getSelectedBorderColor()
            : isFocused
              ? `${getClassBorderColor()} shadow-md`
              : 'border-divider'
        } ${
          getClassBackgroundColor()
        } ${isOnCooldown && !isCurrentClass ? 'grayscale-[30%]' : ''}`}
        onClick={onClick}
      >
        <CardContent className="p-6 relative">
          {/* Class Name and Badge */}
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-xl font-bold orbitron-text tracking-wide ${getClassTextColor()}`}>{classInfo.class_name}</h3>
            <Badge variant={getClassBadgeVariant() as any} className="font-space">
              {classInfo.description}
            </Badge>
          </div>
          
          {/* Class Icon and Description */}
          <div className="flex justify-between items-start mb-4">
            <div className="mb-4 flex-1">
              <p className="text-sm text-text-secondary mb-4">{classInfo.description}</p>
            </div>
            
            <motion.div
              className="w-16 h-16 flex-shrink-0 ml-4"
              animate={{ rotate: isSelected ? [0, 5, 0, -5, 0] : 0 }}
              transition={{ duration: 0.5, repeat: isSelected ? Infinity : 0, repeatDelay: 1.5 }}
            >
              <div className={`w-16 h-16 flex items-center justify-center rounded-full p-1 ${
                isSelected ? `${getClassIconBackgroundColor()} ${getClassShadowColor()}` : 'bg-midnight-elevated border-divider/40 border'
              }`}>
                <ClassIconSelector className={classInfo.class_name} size="lg" />
              </div>
            </motion.div>
          </div>
          
          {/* Bonus Section */}
          <div className="mb-4">
            <div className="flex items-center mb-2">
              <div className={`${getClassIconBackgroundColor()} p-1 rounded-full mr-2`}>
                <Star className="h-4 w-4 text-white" />
              </div>
              <p className={`text-sm font-medium ${getClassTextColor()}`}>Bônus Passivo</p>
            </div>
            <div className="space-y-2">
              {renderBonuses()}
            </div>
          </div>
          
          {/* Action Button */}
          <div className="mt-4">
            {isCurrentClass ? (
              <div className={`flex items-center justify-center rounded-md py-2 px-4 ${getCurrentClassColor()} shadow-subtle`}>
                <Check className="w-4 h-4 mr-2" />
                <span className="font-medium">Classe Atual</span>
              </div>
            ) : isSelected ? (
              <Button 
                variant="default" 
                disabled={isOnCooldown}
                className={`w-full ${getClassButtonColor()}`}
              >
                Selecionar Classe
              </Button>
            ) : (
              <Button 
                variant="outline" 
                disabled={isOnCooldown}
                className={`w-full ${getOutlineButtonColor()} transition-all`}
              >
                Ver Detalhes
              </Button>
            )}
          </div>
          
          {/* Cooldown Indicator */}
          {isOnCooldown && !isCurrentClass && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="absolute top-3 right-3 rounded-full bg-midnight-elevated px-2 py-1 text-xs flex items-center border border-valor-30">
                    <Clock className="w-3 h-3 mr-1 text-valor" />
                    <span className="font-space text-text-tertiary">Bloqueado</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top">
                  <p className="text-xs">Você precisa esperar para trocar de classe</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          
          {/* Current Class Indicator */}
          {isCurrentClass && (
            <div className={`absolute top-0 left-0 w-full h-1 ${getCurrentClassIndicatorColor()}`} />
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ClassSelectionCard;
