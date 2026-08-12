import React, { useState, useEffect } from 'react';
import { Search, Command, FolderKanban, CheckSquare, LayoutDashboard, User, Sparkles, Terminal, Layers, Plus, ArrowRight, X } from 'lucide-react';
import { apiClient } from '../services/api';
import { Project, Task } from '../types';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab: (tab: 'dashboard' | 'projects' | 'tasks' | 'profile') => void;
  onOpenInspector: () => void;
  onOpenArchitecture: () => void;
  onOpenAiPlanner: () => void;
  onOpenCreateTask: () => void;
  onOpenCreateProject: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onNavigateTab,
  onOpenInspector,
  onOpenArchitecture,
  onOpenAiPlanner,
  onOpenCreateTask,
  onOpenCreateProject,
}) => {
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{ projects: Project[]; tasks: Task[] }>({ projects: [], tasks: [] });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else setQuery('');
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen || !query.trim()) {
      setSearchResults({ projects: [], tasks: [] });
      return;
    }

    const searchApi = async () => {
      try {
        const [projRes, tasksRes] = await Promise.all([
          apiClient.get<Project[]>('/projects'),
          apiClient.get<Task[]>(`/tasks?search=${encodeURIComponent(query)}`),
        ]);
        const q = query.toLowerCase();
        const filteredProjs = (projRes.data || []).filter(
          (p) => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)
        );
        setSearchResults({ projects: filteredProjs, tasks: tasksRes.data || [] });
      } catch (err) {
        console.error('Command search error', err);
      }
    };

    const timer = setTimeout(searchApi, 150);
    return () => clearTimeout(timer);
  }, [query, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-slate-900/40 backdrop-blur-xs p-4 font-sans">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-xl shadow-xl overflow-hidden text-slate-900 animate-in fade-in zoom-in-95 duration-150">
        {/* Search Bar Input */}
        <div className="p-4 border-b border-slate-100 flex items-center gap-3 bg-slate-50">
          <Search className="w-5 h-5 text-indigo-600" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command, search tasks, or switch workspaces (Cmd + K)..."
            className="w-full bg-transparent text-body text-slate-900 placeholder-slate-400 focus:outline-none font-sans"
          />
          {query && (
            <button onClick={() => setQuery('')} className="text-slate-400 hover:text-slate-600">
              <X className="w-4 h-4" />
            </button>
          )}
          <span className="text-data font-semibold px-2 py-1 rounded bg-white text-slate-500 border border-slate-200 hidden sm:inline font-mono">
            ESC
          </span>
        </div>

        {/* Results List */}
        <div className="max-h-[60vh] overflow-y-auto p-3 space-y-4">
          {!query.trim() ? (
            <>
              {/* Quick Actions */}
              <div className="space-y-1">
                <div className="text-label font-semibold text-slate-500 px-3 mb-1 uppercase tracking-wider font-jakarta">
                  Quick Actions
                </div>
                <button
                  onClick={() => {
                    onClose();
                    onOpenCreateTask();
                  }}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-body font-medium text-slate-800 hover:text-indigo-600 transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <Plus className="w-4 h-4 text-indigo-600" />
                    <span>Create New Task</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                </button>

                <button
                  onClick={() => {
                    onClose();
                    onOpenCreateProject();
                  }}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-body font-medium text-slate-800 hover:text-indigo-600 transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <FolderKanban className="w-4 h-4 text-indigo-600" />
                    <span>Create Project Workspace</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                </button>

                <button
                  onClick={() => {
                    onClose();
                    onOpenAiPlanner();
                  }}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-body font-medium text-slate-800 hover:text-indigo-600 transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                    <span>Generate Gemini AI Daily Plan</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                </button>
              </div>

              {/* Navigation */}
              <div className="space-y-1">
                <div className="text-label font-semibold text-slate-500 px-3 mb-1 uppercase tracking-wider font-jakarta">
                  Navigation
                </div>
                <button
                  onClick={() => {
                    onClose();
                    onNavigateTab('dashboard');
                  }}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-body font-medium text-slate-700 transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <LayoutDashboard className="w-4 h-4 text-indigo-600" />
                    <span>Dashboard Metrics</span>
                  </div>
                </button>
                <button
                  onClick={() => {
                    onClose();
                    onNavigateTab('projects');
                  }}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-body font-medium text-slate-700 transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <FolderKanban className="w-4 h-4 text-indigo-600" />
                    <span>Projects & Workspaces</span>
                  </div>
                </button>
                <button
                  onClick={() => {
                    onClose();
                    onNavigateTab('tasks');
                  }}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-body font-medium text-slate-700 transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <CheckSquare className="w-4 h-4 text-indigo-600" />
                    <span>Tasks & Kanban Board</span>
                  </div>
                </button>
                <button
                  onClick={() => {
                    onClose();
                    onNavigateTab('profile');
                  }}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-body font-medium text-slate-700 transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <User className="w-4 h-4 text-indigo-600" />
                    <span>Profile & Security</span>
                  </div>
                </button>
              </div>

              {/* Tools */}
              <div className="space-y-1">
                <div className="text-label font-semibold text-slate-500 px-3 mb-1 uppercase tracking-wider font-jakarta">
                  Developer Tools
                </div>
                <button
                  onClick={() => {
                    onClose();
                    onOpenInspector();
                  }}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-body font-medium text-slate-700 transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <Terminal className="w-4 h-4 text-indigo-600" />
                    <span>Open REST API Inspector</span>
                  </div>
                </button>
                <button
                  onClick={() => {
                    onClose();
                    onOpenArchitecture();
                  }}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-body font-medium text-slate-700 transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <Layers className="w-4 h-4 text-emerald-600" />
                    <span>Open Architecture Blueprint</span>
                  </div>
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Dynamic Search Results */}
              {searchResults.projects.length > 0 && (
                <div className="space-y-1">
                  <div className="text-label font-semibold text-slate-500 px-3 mb-1 uppercase tracking-wider font-jakarta">
                    Matched Workspaces ({searchResults.projects.length})
                  </div>
                  {searchResults.projects.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => {
                        onClose();
                        onNavigateTab('projects');
                      }}
                      className="w-full flex items-center justify-between p-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-body text-slate-800 transition-all cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color || '#4f46e5' }} />
                        <span className="font-semibold">{p.name}</span>
                        <span className="text-data text-slate-400 font-mono">({p.category})</span>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                    </button>
                  ))}
                </div>
              )}

              {searchResults.tasks.length > 0 && (
                <div className="space-y-1">
                  <div className="text-label font-semibold text-slate-500 px-3 mb-1 uppercase tracking-wider font-jakarta">
                    Matched Tasks ({searchResults.tasks.length})
                  </div>
                  {searchResults.tasks.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => {
                        onClose();
                        onNavigateTab('tasks');
                      }}
                      className="w-full flex items-center justify-between p-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-body text-slate-800 transition-all cursor-pointer"
                    >
                      <div className="space-y-0.5 text-left">
                        <div className="font-semibold text-slate-900 flex items-center gap-2">
                          <span>{t.title}</span>
                          <span className="text-caption font-semibold px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                            {t.status}
                          </span>
                        </div>
                        <p className="text-caption text-slate-500 truncate max-w-sm">{t.description}</p>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                    </button>
                  ))}
                </div>
              )}

              {searchResults.projects.length === 0 && searchResults.tasks.length === 0 && (
                <div className="text-center py-8 text-slate-400 text-data font-mono">
                  No matching tasks or workspaces found for "{query}".
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-data text-slate-500 font-mono">
          <div className="flex items-center gap-1.5">
            <Command className="w-3.5 h-3.5 text-indigo-600" />
            <span>FlowDesk Quick Navigator</span>
          </div>
          <span>Use ↑ ↓ to navigate, ESC to exit</span>
        </div>
      </div>
    </div>
  );
};
