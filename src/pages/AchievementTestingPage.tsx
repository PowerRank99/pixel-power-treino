import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
import PageHeader from '@/components/ui/PageHeader';
import AuthRequiredRoute from '@/components/AuthRequiredRoute';
import BottomNavBar from '@/components/navigation/BottomNavBar';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { TestingDashboardProvider } from '@/contexts/TestingDashboardContext';

// Import testing components
import TestControlPanel from '@/components/achievement-testing/TestControlPanel';
import TestDashboardTab from '@/components/achievement-testing/TestDashboardTab';
import TestCategoriesTab from '@/components/achievement-testing/TestCategoriesTab';
import TestSimulationTab from '@/components/achievement-testing/TestSimulationTab';
import TestBatchTab from '@/components/achievement-testing/TestBatchTab';
import TestRequirementsTab from '@/components/achievement-testing/TestRequirementsTab';
import TestDebugTab from '@/components/achievement-testing/TestDebugTab';
import TestRepairTab from '@/components/achievement-testing/TestRepairTab';
import TestConfigurationPanel from '@/components/achievement-testing/TestConfigurationPanel';
import TestNotificationSimulator from '@/components/achievement-testing/TestNotificationSimulator';

// Import traditional testing components for backward compatibility
import WorkoutSimulation from '@/components/achievement-testing/WorkoutSimulation';
import PersonalRecordSimulation from '@/components/achievement-testing/PersonalRecordSimulation';
import ManualWorkoutSimulation from '@/components/achievement-testing/ManualWorkoutSimulation';
import PowerDaySimulation from '@/components/achievement-testing/PowerDaySimulation';
import AchievementVerification from '@/components/achievement-testing/AchievementVerification';
import LoggingPanel from '@/components/achievement-testing/LoggingPanel';

const AchievementTestingPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [testUser, setTestUser] = useState(user?.id || '');
  const [advancedMode, setAdvancedMode] = useState(true);
  const [configPanelOpen, setConfigPanelOpen] = useState(false);
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

  // Navigate to advanced tab if user changes
  useEffect(() => {
    if (testUser && testUser !== user?.id) {
      // If testing with another user, stay in advanced mode
      setAdvancedMode(true);
    }
  }, [testUser, user?.id]);
  
  return (
    <AuthRequiredRoute>
      <TestingDashboardProvider userId={testUser || user?.id || ''} logAction={addLogEntry}>
        <div className="pb-20 min-h-screen bg-midnight-base">
          <PageHeader 
            title="Achievement Testing" 
            showBackButton={true} 
            rightContent={
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-valor-15 text-valor border-valor-30">
                  DEV ONLY
                </Badge>
                <Button variant="outline" size="sm" onClick={() => setConfigPanelOpen(!configPanelOpen)}>
                  <Settings className="h-4 w-4 mr-1" />
                  Config
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <Link to="/testing-dashboard">
                    <LayoutDashboard className="h-4 w-4 mr-1" />
                    Dashboard
                  </Link>
                </Button>
              </div>
            }
          />
          
          <div className="p-4 space-y-4">
            {/* Test Control Panel */}
            <TestControlPanel 
              currentUserId={user?.id || ''} 
              testUserId={testUser}
              onUserChange={setTestUser}
              advancedMode={advancedMode}
              onModeChange={setAdvancedMode}
            />
            
            {/* Configuration Panel */}
            {configPanelOpen && (
              <TestConfigurationPanel onClose={() => setConfigPanelOpen(false)} />
            )}
            
            {/* Notification Simulator - Visible across all tabs */}
            <TestNotificationSimulator />
            
            {/* Advanced or Basic Tabs */}
            {advancedMode ? (
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="w-full mb-4 bg-midnight-card border border-divider/30 shadow-subtle overflow-x-auto flex-nowrap">
                  <TabsTrigger value="dashboard" className="flex-1">Dashboard</TabsTrigger>
                  <TabsTrigger value="categories" className="flex-1">Categories</TabsTrigger>
                  <TabsTrigger value="simulation" className="flex-1">Simulation</TabsTrigger>
                  <TabsTrigger value="batch" className="flex-1">Batch Testing</TabsTrigger>
                  <TabsTrigger value="requirements" className="flex-1">Requirements</TabsTrigger>
                  <TabsTrigger value="debug" className="flex-1">Debug</TabsTrigger>
                  <TabsTrigger value="repair" className="flex-1">Repair</TabsTrigger>
                </TabsList>
                
                <TabsContent value="dashboard">
                  <TestDashboardTab userId={testUser || user?.id || ''} />
                </TabsContent>
                
                <TabsContent value="categories">
                  <TestCategoriesTab userId={testUser || user?.id || ''} />
                </TabsContent>
                
                <TabsContent value="simulation">
                  <TestSimulationTab userId={testUser || user?.id || ''} />
                </TabsContent>
                
                <TabsContent value="batch">
                  <TestBatchTab userId={testUser || user?.id || ''} />
                </TabsContent>
                
                <TabsContent value="requirements">
                  <TestRequirementsTab userId={testUser || user?.id || ''} />
                </TabsContent>
                
                <TabsContent value="debug">
                  <TestDebugTab userId={testUser || user?.id || ''} logEntries={logEntries} onClearLogs={() => setLogEntries([])} />
                </TabsContent>
                
                <TabsContent value="repair">
                  <TestRepairTab userId={testUser || user?.id || ''} />
                </TabsContent>
              </Tabs>
            ) : (
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="w-full mb-4 bg-midnight-card border border-divider/30 shadow-subtle overflow-x-auto flex-nowrap">
                  <TabsTrigger value="workout" className="flex-1">Workout</TabsTrigger>
                  <TabsTrigger value="pr" className="flex-1">Personal Record</TabsTrigger>
                  <TabsTrigger value="manual" className="flex-1">Manual Workout</TabsTrigger>
                  <TabsTrigger value="powerday" className="flex-1">Power Day</TabsTrigger>
                  <TabsTrigger value="verify" className="flex-1">Verification</TabsTrigger>
                  <TabsTrigger value="logs" className="flex-1">Logs</TabsTrigger>
                </TabsList>
                
                <TabsContent value="workout">
                  <WorkoutSimulation 
                    userId={testUser || user?.id || ''} 
                    addLogEntry={addLogEntry} 
                  />
                </TabsContent>
                
                <TabsContent value="pr">
                  <PersonalRecordSimulation 
                    userId={testUser || user?.id || ''} 
                    addLogEntry={addLogEntry} 
                  />
                </TabsContent>
                
                <TabsContent value="manual">
                  <ManualWorkoutSimulation 
                    userId={testUser || user?.id || ''} 
                    addLogEntry={addLogEntry} 
                  />
                </TabsContent>
                
                <TabsContent value="powerday">
                  <PowerDaySimulation 
                    userId={testUser || user?.id || ''} 
                    addLogEntry={addLogEntry} 
                  />
                </TabsContent>
                
                <TabsContent value="verify">
                  <AchievementVerification 
                    userId={testUser || user?.id || ''} 
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
            )}
          </div>
          
          <BottomNavBar />
        </div>
      </TestingDashboardProvider>
    </AuthRequiredRoute>
  );
};

export default AchievementTestingPage;
