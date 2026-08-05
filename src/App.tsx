import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { DashboardPage } from './pages/DashboardPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { TasksPage } from './pages/TasksPage';
import { ProfilePage } from './pages/ProfilePage';
import { AuthPage } from './pages/AuthPage';
import { ApiInspectorModal } from './components/ApiInspectorModal';
import { ArchitectureModal } from './components/ArchitectureModal';
import { AiPlannerModal } from './components/AiPlannerModal';
import { Loader2 } from 'lucide-react';

const MainApp: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [currentTab, setCurrentTab] = useState<'dashboard' | 'projects' | 'tasks' | 'profile'>('dashboard');

  // Modals
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);
  const [isArchitectureOpen, setIsArchitectureOpen] = useState(false);
  const [isAiPlannerOpen, setIsAiPlannerOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400 gap-3">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
        <span className="text-xs font-semibold">Validating Spring Security JWT Session...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthPage />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans antialiased selection:bg-indigo-500 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        onOpenInspector={() => setIsInspectorOpen(true)}
        onOpenArchitecture={() => setIsArchitectureOpen(true)}
        onOpenAiPlanner={() => setIsAiPlannerOpen(true)}
      />

      {/* Main Container */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <Sidebar currentTab={currentTab} setCurrentTab={setCurrentTab} />

        {/* Content Body */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8 max-w-7xl mx-auto w-full">
          {currentTab === 'dashboard' && (
            <DashboardPage
              onNavigateTab={(tab) => setCurrentTab(tab)}
              onOpenAiPlanner={() => setIsAiPlannerOpen(true)}
            />
          )}
          {currentTab === 'projects' && <ProjectsPage />}
          {currentTab === 'tasks' && <TasksPage />}
          {currentTab === 'profile' && <ProfilePage />}
        </main>
      </div>

      {/* Modals & Inspectors */}
      <ApiInspectorModal isOpen={isInspectorOpen} onClose={() => setIsInspectorOpen(false)} />
      <ArchitectureModal isOpen={isArchitectureOpen} onClose={() => setIsArchitectureOpen(false)} />
      <AiPlannerModal isOpen={isAiPlannerOpen} onClose={() => setIsAiPlannerOpen(false)} />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
