import React from 'react';
import { LayoutDashboard, FolderKanban, CheckSquare, User, Shield, HardDriveDownload } from 'lucide-react';

interface SidebarProps {
  currentTab: 'dashboard' | 'projects' | 'tasks' | 'profile';
  setCurrentTab: (tab: 'dashboard' | 'projects' | 'tasks' | 'profile') => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, setCurrentTab }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard Metrics', icon: LayoutDashboard },
    { id: 'projects', label: 'Project Workspaces', icon: FolderKanban },
    { id: 'tasks', label: 'Tasks & Kanban', icon: CheckSquare },
    { id: 'profile', label: 'Profile & Security', icon: User },
  ] as const;

  return (
    <aside className="w-64 bg-slate-50 border-r border-slate-200 flex flex-col justify-between p-4 min-h-[calc(100vh-57px)]">
      <div className="space-y-6">
        {/* Navigation Menu */}
        <div>
          <div className="text-label text-slate-500 uppercase tracking-wider px-3 mb-2 font-semibold">
            Workspace Navigation
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentTab(item.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-label transition-all cursor-pointer relative font-medium ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 font-semibold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-transparent'
                  }`}
                >
                  {isActive && (
                    <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-indigo-600 shadow-xs" />
                  )}
                  <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* System Tech Stack Info Card */}
        <div className="bg-white border border-slate-200 rounded-xl p-3.5 space-y-2.5 shadow-xs">
          <div className="flex items-center gap-2 text-indigo-700 font-semibold text-label">
            <Shield className="w-3.5 h-3.5 text-indigo-600" />
            Backend Architecture
          </div>
          <div className="space-y-1.5 text-data text-slate-600">
            <div className="flex justify-between">
              <span className="text-slate-500">Java Version:</span>
              <span className="text-indigo-600 font-semibold">Java 21</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Framework:</span>
              <span className="text-indigo-600 font-semibold">Spring Boot 3</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Security:</span>
              <span className="text-indigo-600 font-semibold">JWT + BCrypt</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Database:</span>
              <span className="text-indigo-600 font-semibold">MySQL 8.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">ORM Layer:</span>
              <span className="text-indigo-600 font-semibold">Hibernate JPA</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="border-t border-slate-200 pt-3 text-caption text-slate-500 space-y-1">
        <div className="flex items-center gap-2 text-indigo-700 font-semibold text-label">
          <HardDriveDownload className="w-3.5 h-3.5 text-indigo-600" />
          <span>Production Enterprise Stack</span>
        </div>
        <p className="text-caption text-slate-500 leading-relaxed">
          Built following SOLID principles, DTO mapping, and global exception handling.
        </p>
      </div>
    </aside>
  );
};
