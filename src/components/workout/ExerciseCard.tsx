
import React, { useState, memo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface ExerciseCardProps {
  name: string;
  category: string;
  level: 'Iniciante' | 'Intermediário' | 'Avançado';
  type?: 'Força' | 'Cardio' | 'Flexibilidade' | 'Equilíbrio';
  image: string;
  description?: string;
  equipment?: string;
  muscleGroup?: string;
  equipmentType?: string;
  expanded?: boolean;
  disableExpand?: boolean;
}

const ExerciseCard: React.FC<ExerciseCardProps> = memo(({
  name,
  category,
  level,
  type = 'Força',
  image,
  description,
  equipment,
  muscleGroup,
  equipmentType,
  expanded: initialExpanded = false,
  disableExpand = false
}) => {
  const [expanded, setExpanded] = useState(initialExpanded);
  
  const getLevelClass = () => {
    switch (level) {
      case 'Iniciante': return 'bg-arcane-15 text-arcane border-arcane-30';
      case 'Intermediário': return 'bg-achievement-15 text-achievement border-achievement-30';
      case 'Avançado': return 'bg-valor-15 text-valor border-valor-30';
      default: return 'bg-arcane-15 text-arcane border-arcane-30';
    }
  };
  
  const getTypeClass = () => {
    switch (type) {
      case 'Força': return 'bg-arcane-15 text-arcane border-arcane-30';
      case 'Cardio': return 'bg-valor-15 text-valor border-valor-30';
      case 'Flexibilidade': return 'bg-achievement-15 text-achievement border-achievement-30';
      case 'Equilíbrio': return 'bg-arcane-15 text-arcane border-arcane-30';
      default: return 'bg-arcane-15 text-arcane border-arcane-30';
    }
  };
  
  const handleToggleExpand = (e: React.MouseEvent) => {
    if (disableExpand) return;
    e.stopPropagation();
    setExpanded(!expanded);
  };
  
  // Simplified card for search results in manual workout context
  if (disableExpand) {
    return (
      <Card className="mb-3 premium-card transition-all duration-200">
        <CardContent className="p-0">
          <div className="p-4 flex items-center">
            <div className="h-12 w-12 overflow-hidden rounded-md mr-3 border border-divider">
              <img src={image} alt={name} className="h-full w-full object-cover" loading="lazy" />
            </div>
            
            <div className="flex-1">
              <h3 className="font-orbitron font-semibold text-text-primary">{name}</h3>
              <div className="flex flex-wrap gap-1 mt-1">
                <span className={`text-xs px-2 py-0.5 rounded-full border ${getLevelClass()}`}>
                  {level}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Full card with expansion capability for other contexts
  return (
    <Card className="mb-3 premium-card transition-all duration-200">
      <CardContent className="p-0">
        <div 
          className="p-4 flex items-center cursor-pointer"
          onClick={handleToggleExpand}
        >
          <div className="h-12 w-12 overflow-hidden rounded-md mr-3 border border-divider">
            <img src={image} alt={name} className="h-full w-full object-cover" loading="lazy" />
          </div>
          
          <div className="flex-1">
            <h3 className="font-orbitron font-semibold text-text-primary">{name}</h3>
            <div className="flex flex-wrap gap-1 mt-1">
              <span className={`text-xs px-2 py-0.5 rounded-full border ${getLevelClass()}`}>
                {level}
              </span>
              <span className={`text-xs px-2 py-0.5 rounded-full border ${getTypeClass()}`}>
                {type}
              </span>
            </div>
          </div>
          
          <div className="ml-2">
            {expanded ? <ChevronUp className="text-text-tertiary" /> : <ChevronDown className="text-text-tertiary" />}
          </div>
        </div>
        
        {expanded && (
          <div className="p-4 pt-0 border-t border-divider">
            {description && (
              <div className="mb-3">
                <h4 className="text-sm font-orbitron mb-1 text-text-secondary">Descrição</h4>
                <p className="text-sm text-text-secondary font-sora">{description}</p>
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <h4 className="text-xs font-orbitron mb-1 text-text-tertiary">Grupo Muscular</h4>
                <p className="text-sm text-text-secondary font-sora">{muscleGroup || category}</p>
              </div>
              
              {equipment && (
                <div>
                  <h4 className="text-xs font-orbitron mb-1 text-text-tertiary">Equipamento</h4>
                  <p className="text-sm text-text-secondary font-sora">{equipment}</p>
                </div>
              )}
              
              {equipmentType && (
                <div>
                  <h4 className="text-xs font-orbitron mb-1 text-text-tertiary">Tipo de Equipamento</h4>
                  <p className="text-sm text-text-secondary font-sora">{equipmentType}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
});

export default ExerciseCard;
