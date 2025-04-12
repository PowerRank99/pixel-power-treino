
import React, { useEffect } from 'react';
import AchievementNotification from './AchievementNotification';
import { useAchievementNotificationStore } from '@/stores/achievementNotificationStore';
import { useToast } from '@/hooks/use-toast';

interface AchievementNotificationSystemProps {
  queueCount?: number;
}

const AchievementNotificationSystem: React.FC<AchievementNotificationSystemProps> = ({
  queueCount
}) => {
  const { isVisible, currentAchievement, hideNotification, queue } = useAchievementNotificationStore();
  const { toast } = useToast();
  
  // Display queue status
  useEffect(() => {
    if (queue.length > 1) {
      toast({
        title: "Novas conquistas",
        description: `${queue.length} conquistas aguardando para serem reveladas`,
        duration: 3000,
      });
    }
  }, [queue.length, toast]);
  
  if (!currentAchievement) return null;
  
  return (
    <>
      <AchievementNotification
        title={currentAchievement.title}
        description={currentAchievement.description}
        rank={currentAchievement.rank as any}
        xpReward={currentAchievement.xpReward}
        bonusText={currentAchievement.bonusText}
        points={currentAchievement.points}
        isVisible={isVisible}
        onClose={hideNotification}
      />
      
      {queue.length > 0 && (
        <div className="fixed bottom-24 right-4 z-40">
          <div className="bg-midnight-card border border-arcane-30 rounded-full px-3 py-1 flex items-center shadow-glow-subtle">
            <span className="text-sm font-space text-arcane">{queue.length + 1}/{queueCount || queue.length + 1}</span>
          </div>
        </div>
      )}
    </>
  );
};

export default AchievementNotificationSystem;
