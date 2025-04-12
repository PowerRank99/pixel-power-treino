
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import PageHeader from '@/components/ui/PageHeader';
import AuthRequiredRoute from '@/components/AuthRequiredRoute';
import BottomNavBar from '@/components/navigation/BottomNavBar';
import WorkoutSimulation from '@/components/achievement-testing/WorkoutSimulation';
import PersonalRecordSimulation from '@/components/achievement-testing/PersonalRecordSimulation';
import ManualWorkoutSimulation from '@/components/achievement-testing/ManualWorkoutSimulation';
import PowerDaySimulation from '@/components/achievement-testing/PowerDaySimulation';
import AchievementVerification from '@/components/achievement-testing/AchievementVerification';
import UserContextSimulation from '@/components/achievement-testing/UserContextSimulation';
import LoggingPanel from '@/components/achievement-testing/LoggingPanel';
import AchievementNotificationTesterSection from '@/components/achievement-testing/AchievementNotificationTesterSection';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

const AchievementTestingPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('workout');
  const [testUser, setTestUser] = useState(user?.id || '');
  const [logEntries, setLogEntries] = useState<Array<{ timestamp: Date; action: string; details: string }>>([]);
  
  const addLogEntry = (action: string, details: string) => {
    setLogEntries(prev => [
      { timestamp: new Date(), action, details },
      ...prev
    ]);
    
    // Also show as toast for immediate feedback
    toast.info(action, {
      description: details,
      duration: 3000,
    });
  };
  
  return (
    <AuthRequiredRoute>
      <div className="pb-20 min-h-screen bg-midnight-base">
        <PageHeader 
          title="Achievement Testing" 
          showBackButton={true} 
          rightContent={
            <Badge variant="outline" className="bg-valor-15 text-valor border-valor-30">
              DEV ONLY
            </Badge>
          }
        />
        
        <div className="p-4 space-y-4">
          <Card className="premium-card border-arcane-30 shadow-glow-purple">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-orbitron font-bold text-text-primary">
                  Achievement System Testing
                </h2>
              </div>
              
              <UserContextSimulation 
                currentUserId={user?.id || ''} 
                onUserChange={setTestUser}
                addLogEntry={addLogEntry}
              />
            </CardContent>
          </Card>
          
          <AchievementNotificationTesterSection />
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full mb-4 bg-midnight-card border border-divider/30 shadow-subtle">
              <TabsTrigger value="workout" className="flex-1">Workout</TabsTrigger>
              <TabsTrigger value="pr" className="flex-1">Personal Record</TabsTrigger>
              <TabsTrigger value="manual" className="flex-1">Manual Workout</TabsTrigger>
              <TabsTrigger value="powerday" className="flex-1">Power Day</TabsTrigger>
              <TabsTrigger value="verify" className="flex-1">Verification</TabsTrigger>
              <TabsTrigger value="logs" className="flex-1">Logs</TabsTrigger>
            </TabsList>
            
            <TabsContent value="workout">
              <WorkoutSimulation 
                userId={testUser} 
                addLogEntry={addLogEntry} 
              />
            </TabsContent>
            
            <TabsContent value="pr">
              <PersonalRecordSimulation 
                userId={testUser} 
                addLogEntry={addLogEntry} 
              />
            </TabsContent>
            
            <TabsContent value="manual">
              <ManualWorkoutSimulation 
                userId={testUser} 
                addLogEntry={addLogEntry} 
              />
            </TabsContent>
            
            <TabsContent value="powerday">
              <PowerDaySimulation 
                userId={testUser} 
                addLogEntry={addLogEntry} 
              />
            </TabsContent>
            
            <TabsContent value="verify">
              <AchievementVerification 
                userId={testUser} 
                addLogEntry={addLogEntry} 
              />
            </TabsContent>
            
            <TabsContent value="logs">
              <LoggingPanel 
                logEntries={logEntries} 
                clearLogs={() => setLogEntries([])} 
              />
            </TabsContent>
          </Tabs>
        </div>
        
        <BottomNavBar />
      </div>
    </AuthRequiredRoute>
  );
};

export default AchievementTestingPage;
