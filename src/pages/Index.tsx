
import React, { useState } from 'react';
import BottomNavBar from '@/components/navigation/BottomNavBar';
import FeedHeader from '@/components/social/FeedHeader';
import FeedTabs from '@/components/social/FeedTabs';
import PostList, { Post } from '@/components/social/PostList';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';

const IndexPage = () => {
  const [activeTab, setActiveTab] = useState<'todos' | 'guildas' | 'amigos'>('todos');
  
  // Mock data for posts with correct type literals
  const posts: Post[] = [
    {
      id: "1",
      user: { 
        name: "Pedro Santos", 
        avatar: "/lovable-uploads/d84a92f5-828a-4ff9-a21b-3233e15d4276.png",
        level: "Avançado"
      },
      content: "Completei meu treino de costas! 💪",
      time: "há 2 horas",
      likes: 12,
      comments: 3,
      rewards: [
        { type: 'xp', value: 150 },
        { type: 'achievement', label: 'Nova Conquista' }
      ]
    },
    {
      id: "2",
      user: { 
        name: "Ana Clara", 
        avatar: "/lovable-uploads/174ea5f4-db2b-4392-a948-5ec67969f043.png",
        level: "Intermediário"
      },
      content: "Treino de pernas finalizado! Novo recorde pessoal no agachamento 🎯",
      time: "há 3 horas",
      likes: 24,
      comments: 7,
      rewards: [
        { type: 'xp', value: 100 },
        { type: 'streak', value: 5 }
      ]
    },
    {
      id: "3",
      user: { 
        name: "Lucas Oliveira", 
        avatar: "/lovable-uploads/4c10aa78-e770-43d4-96a3-69b43638d90e.png",
        level: "Iniciante"
      },
      content: "Primeira semana de treinos completa! 🎯",
      time: "há 5 horas",
      likes: 18,
      comments: 5,
      rewards: [
        { type: 'xp', value: 75 },
        { type: 'badge', label: 'Novato Dedicado' }
      ]
    }
  ];
  
  return (
    <div className="pb-20 bg-gray-50 min-h-screen">
      {/* Header */}
      <FeedHeader />
      
      {/* Tabs */}
      <FeedTabs activeTab={activeTab} onTabChange={setActiveTab} />
      
      {/* Post List */}
      <PostList posts={posts} />
      
      {/* Bottom Navigation */}
      <BottomNavBar />
    </div>
  );
};

export default IndexPage;
