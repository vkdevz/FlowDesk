import React, { useEffect, useState } from 'react';
import { apiClient } from '../services/api';
import { Task, Project, Priority, Status, SortField } from '../types';
import {
  CheckSquare,
  Plus,
  Search,
  Filter,
  ArrowUpDown,
  Sparkles,
  Calendar,
  Clock,
  Trash2,
  Edit3,
  X,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Brain,
  ListTodo,
} from 'lucide-react';

export const TasksPage: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter & Search & Sort states
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<Status | 'ALL'>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<Priority | 'ALL'>('ALL');
  const [projectFilter, setProjectFilter] = useState<string>('ALL');
  const [sortField, setSortField] = useState<SortField>('createdAt_desc');
  const [isOverdueOnly, setIsOverdueOnly] = useState(false);
  const [isTodayOnly, setIsTodayOnly] = useState(false);

  // View Mode: Table vs Kanban
  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('table');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'MEDIUM' as Priority,
    status: 'TO_DO' as Status,
    deadline: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
    projectId: '',
    subtasks: [] as { id: string; title: string; completed: boolean }[],
  });

  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

  const fetchTasksAndProjects = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        search,
        status: statusFilter,
        priority: priorityFilter,
        projectId: projectFilter,
        sort: sortField,
        isOverdueOnly: isOverdueOnly.toString(),
        isTodayOnly: isTodayOnly.toString(),
      }).toString();

      const [tasksRes, projectsRes] = await Promise.all([
        apiClient.get<Task[]>(`/tasks?${query}`),
        apiClient.get<Project[]>('/projects'),
      ]);

      setTasks(tasksRes.data);
      setProjects(projectsRes.data);
      if (!formData.projectId && projectsRes.data.length > 0) {
        setFormData((prev) => ({ ...prev, projectId: projectsRes.data[0].id }));
      }
    } catch (err) {
      console.error('Error fetching tasks', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasksAndProjects();
  }, [search, statusFilter, priorityFilter, projectFilter, sortField, isOverdueOnly, isTodayOnly]);

  const handleOpenCreate = () => {
    setEditingTask(null);
    setFormData({
      title: '',
      description: '',
      priority: 'MEDIUM',
      status: 'TO_DO',
      deadline: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
      projectId: projects[0]?.id || '',
      subtasks: [],
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (t: Task) => {
    setEditingTask(t);
    setFormData({
      title: t.title,
      description: t.description,
      priority: t.priority,
      status: t.status,
      deadline: t.deadline,
      projectId: t.projectId,
      subtasks: t.subtasks || [],
    });
    setIsModalOpen(true);
  };

  // Gemini AI Task Breakdown Trigger
  const handleAiBreakdown = async () => {
    if (!formData.title) return alert('Please enter a task title first.');
    setAiLoading(true);
    try {
      const res = await apiClient.post('/ai/breakdown', {
        taskTitle: formData.title,
        taskDescription: formData.description,
      });

      const { prioritySuggestion, suggestedSubtasks, summary } = res.data;

      setFormData((prev) => ({
        ...prev,
        description: prev.description ? `${prev.description}\n\n[AI Summary]: ${summary}` : `[AI Summary]: ${summary}`,
        priority: prioritySuggestion || prev.priority,
        subtasks: [
          ...prev.subtasks,
          ...(suggestedSubtasks || []).map((s: string, idx: number) => ({
            id: `sub-${Date.now()}-${idx}`,
            title: s,
            completed: false,
          })),
        ],
      }));
    } catch (err) {
      console.error('AI breakdown failed', err);
    } finally {
      setAiLoading(false);
    }
  };

  const handleAddSubtask = () => {
    if (!newSubtaskTitle.trim()) return;
    setFormData((prev) => ({
      ...prev,
      subtasks: [
        ...prev.subtasks,
        { id: `sub-${Date.now()}`, title: newSubtaskTitle.trim(), completed: false },
      ],
    }));
    setNewSubtaskTitle('');
  };

  const handleToggleSubtask = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      subtasks: prev.subtasks.map((st) => (st.id === id ? { ...st, completed: !st.completed } : st)),
    }));
  };

  const handleRemoveSubtask = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      subtasks: prev.subtasks.filter((st) => st.id !== id),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.projectId) return;

    try {
      if (editingTask) {
        await apiClient.put(`/tasks/${editingTask.id}`, formData);
      } else {
        await apiClient.post('/tasks', formData);
      }
      setIsModalOpen(false);
      fetchTasksAndProjects();
    } catch (err) {
      console.error('Error saving task', err);
    }
  };

  const handleStatusChange = async (id: string, newStatus: Status) => {
    try {
      await apiClient.patch(`/tasks/${id}/status`, { status: newStatus });
      fetchTasksAndProjects();
    } catch (err) {
      console.error('Status patch error', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    try {
      await apiClient.delete(`/tasks/${id}`);
      fetchTasksAndProjects();
    } catch (err) {
      console.error('Delete task error', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-indigo-400" />
              Task & Kanban Workspace
            </h1>
            <p className="text-xs text-slate-400">
              Filter, search, sort, and manage tasks mapped to Spring Data JPA repositories
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* View switcher */}
            <div className="bg-slate-950 p-1 rounded-xl border border-slate-800 flex text-xs">
              <button
                onClick={() => setViewMode('table')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  viewMode === 'table' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Table View
              </button>
              <button
                onClick={() => setViewMode('kanban')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  viewMode === 'kanban' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Kanban View
              </button>
            </div>

            <button
              onClick={handleOpenCreate}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> New Task
            </button>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 pt-2 border-t border-slate-800">
          {/* Search bar */}
          <div className="relative lg:col-span-2">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title or description..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="TO_DO">To Do</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
          </select>

          {/* Priority Filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value as any)}
            className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="ALL">All Priorities</option>
            <option value="HIGH">High Priority</option>
            <option value="MEDIUM">Medium Priority</option>
            <option value="LOW">Low Priority</option>
          </select>

          {/* Project Filter */}
          <select
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-indigo-500 truncate"
          >
            <option value="ALL">All Projects</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          {/* Sort Field */}
          <select
            value={sortField}
            onChange={(e) => setSortField(e.target.value as SortField)}
            className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="createdAt_desc">Sort: Newest</option>
            <option value="createdAt_asc">Sort: Oldest</option>
            <option value="priority_desc">Sort: High Priority</option>
            <option value="deadline_asc">Sort: Earliest Deadline</option>
          </select>
        </div>

        {/* Quick Toggles */}
        <div className="flex flex-wrap items-center gap-4 text-xs pt-1">
          <label className="flex items-center gap-2 cursor-pointer text-slate-300">
            <input
              type="checkbox"
              checked={isOverdueOnly}
              onChange={(e) => setIsOverdueOnly(e.target.checked)}
              className="rounded border-slate-700 bg-slate-950 text-indigo-600 focus:ring-0"
            />
            <span className={isOverdueOnly ? 'text-rose-400 font-bold' : ''}>Overdue Only</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer text-slate-300">
            <input
              type="checkbox"
              checked={isTodayOnly}
              onChange={(e) => setIsTodayOnly(e.target.checked)}
              className="rounded border-slate-700 bg-slate-950 text-indigo-600 focus:ring-0"
            />
            <span className={isTodayOnly ? 'text-purple-400 font-bold' : ''}>Due Today</span>
          </label>
        </div>
      </div>

      {/* Task Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh] text-slate-400 gap-2">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
          <span className="text-xs">Executing JPA Task Queries...</span>
        </div>
      ) : tasks.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center space-y-3">
          <ListTodo className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-sm font-bold text-slate-300">No Tasks Match Your Filters</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try resetting your search query or create a new task.
          </p>
          <button
            onClick={handleOpenCreate}
            className="px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-xl"
          >
            Create Task
          </button>
        </div>
      ) : viewMode === 'table' ? (
        /* TABLE VIEW */
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 overflow-x-auto shadow-md">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-slate-400 border-b border-slate-800 font-semibold uppercase tracking-wider">
                <th className="pb-3 px-3">Status</th>
                <th className="pb-3 px-3">Title & Description</th>
                <th className="pb-3 px-3">Project</th>
                <th className="pb-3 px-3">Priority</th>
                <th className="pb-3 px-3">Deadline</th>
                <th className="pb-3 px-3">Subtasks</th>
                <th className="pb-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300 font-medium">
              {tasks.map((task) => {
                const subCount = task.subtasks?.length || 0;
                const subDone = task.subtasks?.filter((s) => s.completed).length || 0;

                return (
                  <tr key={task.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-3">
                      <select
                        value={task.status}
                        onChange={(e) => handleStatusChange(task.id, e.target.value as Status)}
                        className={`px-2 py-1 rounded text-[11px] font-bold focus:outline-none ${
                          task.status === 'COMPLETED'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : task.status === 'IN_PROGRESS'
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : 'bg-slate-800 text-slate-300 border border-slate-700'
                        }`}
                      >
                        <option value="TO_DO">TO DO</option>
                        <option value="IN_PROGRESS">IN PROGRESS</option>
                        <option value="COMPLETED">COMPLETED</option>
                      </select>
                    </td>

                    <td className="py-3.5 px-3 max-w-xs">
                      <div className="font-bold text-slate-100">{task.title}</div>
                      <p className="text-[11px] text-slate-400 truncate mt-0.5">{task.description}</p>
                    </td>

                    <td className="py-3.5 px-3">
                      <span
                        className="px-2.5 py-0.5 rounded text-[11px] font-bold"
                        style={{
                          backgroundColor: `${task.projectColor}20`,
                          color: task.projectColor,
                          border: `1px solid ${task.projectColor}40`,
                        }}
                      >
                        {task.projectName}
                      </span>
                    </td>

                    <td className="py-3.5 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          task.priority === 'HIGH'
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                            : task.priority === 'MEDIUM'
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        }`}
                      >
                        {task.priority}
                      </span>
                    </td>

                    <td className="py-3.5 px-3 font-mono text-slate-400">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {task.deadline}
                      </div>
                    </td>

                    <td className="py-3.5 px-3 text-slate-400 font-mono text-[11px]">
                      {subCount > 0 ? (
                        <span className="text-slate-300">
                          {subDone}/{subCount} Done
                        </span>
                      ) : (
                        <span className="text-slate-600">—</span>
                      )}
                    </td>

                    <td className="py-3.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenEdit(task)}
                          className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-slate-800 rounded-lg transition-colors"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(task.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        /* KANBAN BOARD VIEW */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {(['TO_DO', 'IN_PROGRESS', 'COMPLETED'] as Status[]).map((colStatus) => {
            const colTasks = tasks.filter((t) => t.status === colStatus);
            return (
              <div
                key={colStatus}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3 min-h-[60vh] flex flex-col"
              >
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="font-bold text-xs uppercase tracking-wider text-slate-300 flex items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        colStatus === 'COMPLETED'
                          ? 'bg-emerald-500'
                          : colStatus === 'IN_PROGRESS'
                          ? 'bg-amber-500'
                          : 'bg-blue-500'
                      }`}
                    ></span>
                    {colStatus.replace('_', ' ')}
                  </h3>
                  <span className="px-2 py-0.5 rounded-full bg-slate-950 text-slate-400 font-mono text-[10px] font-bold border border-slate-800">
                    {colTasks.length}
                  </span>
                </div>

                <div className="space-y-3 flex-1">
                  {colTasks.map((task) => (
                    <div
                      key={task.id}
                      className="bg-slate-950 border border-slate-800/80 hover:border-slate-700 p-4 rounded-xl space-y-3 shadow-sm transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className="px-2 py-0.5 rounded text-[10px] font-bold"
                          style={{
                            backgroundColor: `${task.projectColor}20`,
                            color: task.projectColor,
                          }}
                        >
                          {task.projectName}
                        </span>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleOpenEdit(task)}
                            className="text-slate-500 hover:text-slate-300 p-1"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-xs font-bold text-slate-100">{task.title}</h4>
                        <p className="text-[11px] text-slate-400 line-clamp-2 mt-1">{task.description}</p>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-[10px]">
                        <span
                          className={`px-1.5 py-0.5 rounded font-bold ${
                            task.priority === 'HIGH'
                              ? 'bg-rose-500/20 text-rose-400'
                              : task.priority === 'MEDIUM'
                              ? 'bg-amber-500/20 text-amber-400'
                              : 'bg-emerald-500/20 text-emerald-400'
                          }`}
                        >
                          {task.priority}
                        </span>

                        <span className="font-mono text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {task.deadline}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create / Edit Task Modal with Gemini AI Assistant */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl text-slate-100">
            <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                {editingTask ? 'Edit Task' : 'Create New Task'}
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-mono">
                  Gemini AI Powered
                </span>
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Task Title with AI Breakdown Button */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300">Task Title *</label>
                  <button
                    type="button"
                    onClick={handleAiBreakdown}
                    disabled={aiLoading}
                    className="text-[11px] font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                  >
                    {aiLoading ? (
                      <Loader2 className="w-3 h-3 animate-spin text-indigo-400" />
                    ) : (
                      <Sparkles className="w-3 h-3 text-amber-400" />
                    )}
                    Gemini AI Breakdown
                  </button>
                </div>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Implement JwtUtils service in Spring Security"
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              {/* Project & Priority */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Project Workspace *</label>
                  <select
                    required
                    value={formData.projectId}
                    onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:border-indigo-500 focus:outline-none"
                  >
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Priority Level *</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as Priority })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:border-indigo-500 focus:outline-none"
                  >
                    <option value="LOW">LOW</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH</option>
                  </select>
                </div>
              </div>

              {/* Status & Deadline */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as Status })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:border-indigo-500 focus:outline-none"
                  >
                    <option value="TO_DO">TO DO</option>
                    <option value="IN_PROGRESS">IN PROGRESS</option>
                    <option value="COMPLETED">COMPLETED</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Deadline *</label>
                  <input
                    type="date"
                    required
                    value={formData.deadline}
                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Description</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Task specifications, technical acceptance criteria..."
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              {/* Subtasks Checklist Section */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <label className="text-xs font-semibold text-slate-300">Subtasks Checklist</label>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newSubtaskTitle}
                    onChange={(e) => setNewSubtaskTitle(e.target.value)}
                    placeholder="Add step or subtask..."
                    className="flex-1 px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddSubtask}
                    className="px-3 py-1.5 bg-slate-800 text-slate-200 rounded-lg text-xs font-semibold"
                  >
                    Add
                  </button>
                </div>

                {formData.subtasks.length > 0 && (
                  <div className="space-y-1 mt-2">
                    {formData.subtasks.map((st) => (
                      <div
                        key={st.id}
                        className="flex items-center justify-between p-2 bg-slate-950 border border-slate-800 rounded-lg text-xs"
                      >
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={st.completed}
                            onChange={() => handleToggleSubtask(st.id)}
                            className="rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-0"
                          />
                          <span className={st.completed ? 'line-through text-slate-500' : 'text-slate-200'}>
                            {st.title}
                          </span>
                        </label>
                        <button
                          type="button"
                          onClick={() => handleRemoveSubtask(st.id)}
                          className="text-slate-500 hover:text-rose-400 p-1"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-md"
                >
                  {editingTask ? 'Save Task' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
