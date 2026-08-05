import React from 'react';
import { LayoutDashboard, FolderKanban, CheckSquare, User, Shield, HardDriveDownload } from 'lucide-react';

interface SidebarProps {
  currentTab: 'dashboard' | 'projects' | 'tasks' | 'profile';
  setCurrentTab: (tab: 'dashboard' | 'projects' | 'tasks' | 'profile') => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, setCurrentTab }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'projects', label: 'Projects', icon: FolderKanban },
    { id: 'tasks', label: 'Tasks & Kanban', icon: CheckSquare },
    { id: 'profile', label: 'Profile & Security', icon: User },
  ] as const;

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between p-4 min-h-[calc(100vh-57px)]">
      <div className="space-y-6">
        {/* Navigation Menu */}
        <div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3 mb-2">
            Workspace
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentTab(item.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/30 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* System Tech Stack Info Card */}
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3.5 space-y-2">
          <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs">
            <Shield className="w-3.5 h-3.5" />
            Backend Stack
          </div>
          <div className="space-y-1 text-[11px] text-slate-400">
            <div className="flex justify-between">
              <span>Java Version:</span>
              <span className="font-mono text-slate-200">Java 21</span>
            </div>
            <div className="flex justify-between">
              <span>Framework:</span>
              <span className="font-mono text-slate-200">Spring Boot 3</span>
            </div>
            <div className="flex justify-between">
              <span>Security:</span>
              <span className="font-mono text-slate-200">JWT + BCrypt</span>
            </div>
            <div className="flex justify-between">
              <span>Database:</span>
              <span className="font-mono text-slate-200">MySQL 8.0</span>
            </div>
            <div className="flex justify-between">
              <span>ORM:</span>
              <span className="font-mono text-slate-200">Hibernate JPA</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="border-t border-slate-800/80 pt-3 text-[11px] text-slate-400 space-y-2">
        <div className="flex items-center gap-2 text-emerald-400 font-semibold">
          <HardDriveDownload className="w-3.5 h-3.5" />
          <span>Production Ready Codebase</span>
        </div>
        <p className="text-[10px] leading-relaxed text-slate-400">
          Built following SOLID principles, constructor injection, DTO mapping, and global exception handling.
        </p>
      </div>
    </aside>
  );
};
