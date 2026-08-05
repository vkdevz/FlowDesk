import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Terminal, Layers, LogOut, Sparkles, User as UserIcon } from 'lucide-react';

interface NavbarProps {
  onOpenInspector: () => void;
  onOpenArchitecture: () => void;
  onOpenAiPlanner: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenInspector,
  onOpenArchitecture,
  onOpenAiPlanner,
}) => {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 text-slate-100 px-4 lg:px-8 py-3 flex items-center justify-between shadow-md">
      {/* Brand Logo */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-emerald-400 flex items-center justify-center font-black text-white text-lg shadow-lg shadow-indigo-500/20">
          F
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-100 text-base tracking-tight">FlowDesk</span>
            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              Java 21 • Spring Boot 3
            </span>
          </div>
          <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
            Smart Task & Productivity Management System
          </p>
        </div>
      </div>

      {/* Action Toolbar */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Gemini AI Daily Plan Button */}
        <button
          onClick={onOpenAiPlanner}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600/20 via-purple-600/20 to-emerald-600/20 hover:from-indigo-600/30 hover:to-emerald-600/30 border border-indigo-500/30 text-indigo-300 text-xs font-semibold shadow-sm transition-all hover:scale-105"
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
          <span className="hidden sm:inline">AI Daily Planner</span>
        </button>

        {/* REST API Inspector Button */}
        <button
          onClick={onOpenInspector}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-slate-200 text-xs font-medium transition-all"
        >
          <Terminal className="w-3.5 h-3.5 text-emerald-400" />
          <span className="hidden md:inline">API Inspector</span>
        </button>

        {/* Architecture Modal Button */}
        <button
          onClick={onOpenArchitecture}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-slate-200 text-xs font-medium transition-all"
        >
          <Layers className="w-3.5 h-3.5 text-indigo-400" />
          <span className="hidden md:inline">Architecture</span>
        </button>

        {/* User Profile / Logout */}
        {user ? (
          <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
            <img
              src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user.name)}`}
              alt={user.name}
              className="w-8 h-8 rounded-full border border-indigo-500/40 object-cover"
            />
            <div className="hidden xl:block text-left">
              <div className="text-xs font-semibold text-slate-200 truncate max-w-[120px]">{user.name}</div>
              <div className="text-[10px] text-slate-400 truncate max-w-[120px]">{user.email}</div>
            </div>
            <button
              onClick={logout}
              title="Logout"
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors ml-1"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <UserIcon className="w-4 h-4" /> Guest
          </div>
        )}
      </div>
    </header>
  );
};
