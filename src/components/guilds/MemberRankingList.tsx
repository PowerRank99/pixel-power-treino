
import React from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trophy, Medal, Crown, Star, TrendingUp, TrendingDown } from 'lucide-react';
import { toast } from 'sonner';

interface Member {
  id: string;
  name: string;
  avatar: string;
  points: number;
  position: number;
  isCurrentUser?: boolean;
  badge?: string;
  trend?: 'up' | 'down' | 'same';
}

interface MemberRankingListProps {
  members: Member[];
}

const MemberRankingList: React.FC<MemberRankingListProps> = ({ members }) => {
  const getPositionColor = (position: number) => {
    switch(position) {
      case 1: return 'text-yellow-500';
      case 2: return 'text-gray-500';
      case 3: return 'text-orange-500';
      default: return 'text-gray-700';
    }
  };
  
  const getPositionIcon = (position: number) => {
    switch(position) {
      case 1: return <Crown className="h-4 w-4 text-yellow-500 fill-yellow-500" />;
      case 2: return <Medal className="h-4 w-4 text-gray-500" />;
      case 3: return <Medal className="h-4 w-4 text-orange-500" />;
      default: return position;
    }
  };
  
  const getBadge = (member: Member) => {
    if (!member.badge) return null;
    
    return (
      <Badge className="ml-2 flex items-center bg-fitblue">
        <Star className="w-3 h-3 mr-1" />
        {member.badge}
      </Badge>
    );
  };

  const getTrendIcon = (trend?: 'up' | 'down' | 'same') => {
    switch(trend) {
      case 'up': return <TrendingUp className="h-3 w-3 text-green-500" />;
      case 'down': return <TrendingDown className="h-3 w-3 text-red-500" />;
      default: return null;
    }
  };
  
  const handleCongratulate = (name: string) => {
    toast.success('Parabéns enviados!', {
      description: `Você enviou parabéns para ${name} pelo desempenho.`
    });
  };
  
  return (
    <div className="space-y-3">
      {members.map((member) => (
        <div 
          key={member.id}
          className={`flex items-center p-3 rounded-lg ${
            member.isCurrentUser 
              ? 'bg-blue-50 border border-blue-100 shadow-sm' 
              : 'bg-white border border-gray-100 hover:border-blue-100 hover:bg-blue-50/30 transition-colors'
          }`}
        >
          <div className="w-8 text-center mr-3 flex justify-center">
            <div className={`flex items-center justify-center font-bold ${getPositionColor(member.position)}`}>
              {getPositionIcon(member.position)}
            </div>
          </div>
          
          <Avatar className={`h-10 w-10 mr-3 ${member.isCurrentUser ? 'ring-2 ring-fitblue' : ''}`}>
            <AvatarImage src={member.avatar} alt={member.name} />
            <AvatarFallback>{member.name.substring(0, 2)}</AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <div className="flex items-center">
              <h4 className={`font-medium ${member.isCurrentUser ? 'text-fitblue' : ''}`}>
                {member.name}
                {member.isCurrentUser && <span className="text-xs text-blue-500 ml-1">(Você)</span>}
              </h4>
              {getBadge(member)}
            </div>
            <div className="flex justify-between">
              <p className="text-sm text-gray-500 flex items-center gap-1">
                {member.points} pontos
                {getTrendIcon(member.trend)}
              </p>
              
              {!member.isCurrentUser && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 text-xs text-gray-500 hover:text-fitblue p-0"
                  onClick={() => handleCongratulate(member.name)}
                >
                  👏 Parabenizar
                </Button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MemberRankingList;
