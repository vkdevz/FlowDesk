import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Terminal, Layers, LogOut, Sparkles, User as UserIcon, Command, Search } from 'lucide-react';

interface NavbarProps {
  onOpenInspector: () => void;
  onOpenArchitecture: () => void;
  onOpenAiPlanner: () => void;
  onOpenCommandPalette: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenInspector,
  onOpenArchitecture,
  onOpenAiPlanner,
  onOpenCommandPalette,
}) => {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 text-slate-900 px-6 py-2.5 flex items-center justify-between shadow-xs">
      {/* Brand Logo */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white text-base shadow-xs font-jakarta">
          F
        </div>
        <div className="flex items-baseline gap-2">
          <span className="font-bold text-slate-900 text-base tracking-tight font-jakarta">
            Flow<span className="text-indigo-600">Desk</span>
          </span>
          <span className="text-data text-slate-400 font-mono text-[11px]">
            Java 21 • Spring Boot 3
          </span>
        </div>
      </div>

      {/* Action Toolbar */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        {/* Quick Command Palette Button */}
        <button
          onClick={onOpenCommandPalette}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100/80 hover:bg-slate-100 text-slate-600 text-label transition-colors cursor-pointer"
        >
          <Search className="w-3.5 h-3.5 text-slate-400" />
          <span className="hidden sm:inline text-label font-normal text-slate-600">Search commands...</span>
          <kbd className="hidden lg:inline-flex items-center gap-0.5 text-data bg-white border border-slate-200 px-1.5 py-0.5 rounded text-slate-400 font-mono text-[10px]">
            <Command className="w-2.5 h-2.5" /> K
          </kbd>
        </button>

        {/* Gemini AI Daily Plan Button */}
        <button
          onClick={onOpenAiPlanner}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-label transition-colors cursor-pointer font-medium"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          <span className="hidden sm:inline">AI Planner</span>
        </button>

        {/* Developer Tools Dropdown */}
        <div className="relative group">
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-label transition-colors cursor-pointer">
            <Terminal className="w-3.5 h-3.5 text-slate-600" />
            <span className="hidden md:inline">Dev Tools</span>
          </button>
          
          <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-slate-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
            <div className="p-1 flex flex-col gap-1">
              <button
                onClick={onOpenInspector}
                className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-slate-50 text-slate-700 text-sm w-full text-left transition-colors cursor-pointer"
              >
                <Terminal className="w-4 h-4 text-indigo-600" />
                API Inspector
              </button>
              <button
                onClick={onOpenArchitecture}
                className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-slate-50 text-slate-700 text-sm w-full text-left transition-colors cursor-pointer"
              >
                <Layers className="w-4 h-4 text-emerald-600" />
                Architecture
              </button>
            </div>
          </div>
        </div>

        {/* User Profile / Logout */}
        {user ? (
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
            <img
              src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user.name)}`}
              alt={user.name}
              className="w-7 h-7 rounded-full border border-slate-200 object-cover"
            />
            <span className="hidden xl:inline text-label font-medium text-slate-700 truncate max-w-[100px]">
              {user.name}
            </span>
            <button
              onClick={logout}
              title="Logout"
              className="p-1 text-slate-400 hover:text-rose-600 rounded cursor-pointer transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-label text-slate-500">
            <UserIcon className="w-4 h-4 text-indigo-600" /> Guest
          </div>
        )}
      </div>
    </header>
  );
};
