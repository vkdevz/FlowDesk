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

  // Inline Workspace Creator State
  const [showInlineWorkspaceCreator, setShowInlineWorkspaceCreator] = useState(false);
  const [inlineProjectData, setInlineProjectData] = useState({
    name: '',
    category: 'Backend Architecture',
    color: '#4f46e5',
  });

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

  const handleCreateInlineProject = async () => {
    if (!inlineProjectData.name.trim()) return;
    try {
      const res = await apiClient.post<Project>('/projects', {
        name: inlineProjectData.name.trim(),
        description: 'Created inline from Task Modal',
        category: inlineProjectData.category,
        color: inlineProjectData.color,
      });
      if (res.data) {
        setProjects((prev) => [res.data, ...prev]);
        setFormData((prev) => ({ ...prev, projectId: res.data.id }));
        setShowInlineWorkspaceCreator(false);
        setInlineProjectData({ name: '', category: 'Backend Architecture', color: '#4f46e5' });
      }
    } catch (err) {
      console.error('Error creating inline project', err);
    }
  };

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
      console.error('Error fetching tasks:', err);
      setTasks([]);
      setProjects([]);
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

  const handleOpenEdit = (task: Task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description,
      priority: task.priority,
      status: task.status,
      deadline: task.deadline,
      projectId: task.projectId,
      subtasks: task.subtasks || [],
    });
    setIsModalOpen(true);
  };

  const handleAiBreakdown = async () => {
    if (!formData.title.trim()) {
      alert('Please enter a task title first to generate AI breakdown.');
      return;
    }

    setAiLoading(true);
    try {
      const res = await apiClient.post<{ description: string; subtasks: string[] }>('/ai/planner/decompose', {
        title: formData.title,
      });

      if (res.data) {
        const generatedSubtasks = (res.data.subtasks || []).map((st, idx) => ({
          id: `sub-${Date.now()}-${idx}`,
          title: st,
          completed: false,
        }));

        setFormData((prev) => ({
          ...prev,
          description: prev.description ? `${prev.description}\n\n${res.data.description}` : res.data.description,
          subtasks: [...prev.subtasks, ...generatedSubtasks],
        }));
      }
    } catch (err) {
      console.error('AI Breakdown error', err);
    } finally {
      setAiLoading(false);
    }
  };

  const handleAddSubtask = () => {
    if (!newSubtaskTitle.trim()) return;
    const newSub = {
      id: `sub-${Date.now()}`,
      title: newSubtaskTitle.trim(),
      completed: false,
    };
    setFormData((prev) => ({
      ...prev,
      subtasks: [...prev.subtasks, newSub],
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
    if (!formData.title.trim()) return;

    try {
      if (editingTask) {
        await apiClient.put(`/tasks/${editingTask.id}`, formData);
      } else {
        await apiClient.post('/tasks', formData);
      }
      setIsModalOpen(false);
      fetchTasksAndProjects();
    } catch (err) {
      console.error('Submit task error', err);
    }
  };

  const handleToggleTaskStatus = async (task: Task) => {
    const nextStatus: Status =
      task.status === 'TO_DO' ? 'IN_PROGRESS' : task.status === 'IN_PROGRESS' ? 'COMPLETED' : 'TO_DO';

    try {
      await apiClient.patch(`/tasks/${task.id}/status`, { status: nextStatus });
      fetchTasksAndProjects();
    } catch (err) {
      console.error('Status toggle error', err);
    }
  };

  const handleDeleteTask = async (id: string) => {
    if (!window.confirm('Delete this task permanently?')) return;
    try {
      await apiClient.delete(`/tasks/${id}`);
      fetchTasksAndProjects();
    } catch (err) {
      console.error('Delete task error', err);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header & Controls */}
      <div className="bg-white border border-slate-200 p-6 rounded-2xl space-y-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-card-title md:text-section-title font-jakarta font-bold text-slate-900 flex items-center gap-2">
              <CheckSquare className="w-6 h-6 text-indigo-600" />
              Task & Kanban Workspace
            </h1>
            <p className="text-body text-slate-600 mt-0.5">
              Manage tasks mapped to Java Spring Data JPA entities with real-time status updates
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* View switcher */}
            <div className="bg-slate-100 p-1 rounded-xl border border-slate-200 flex text-label">
              <button
                onClick={() => setViewMode('table')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                  viewMode === 'table' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Table View
              </button>
              <button
                onClick={() => setViewMode('kanban')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                  viewMode === 'kanban' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Kanban Board
              </button>
            </div>

            <button
              onClick={handleOpenCreate}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-label font-semibold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer font-sans"
            >
              <Plus className="w-4 h-4" /> New Task
            </button>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 pt-2 border-t border-slate-100">
          {/* Search bar */}
          <div className="relative lg:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search title or description..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-body text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-label text-slate-700 focus:outline-none focus:border-indigo-500 focus:bg-white"
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
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-label text-slate-700 focus:outline-none focus:border-indigo-500 focus:bg-white"
          >
            <option value="ALL">All Priorities</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
          </select>

          {/* Project Workspace Filter */}
          <select
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-label text-slate-700 focus:outline-none focus:border-indigo-500 focus:bg-white"
          >
            <option value="ALL">All Projects</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          {/* Sort Order */}
          <select
            value={sortField}
            onChange={(e) => setSortField(e.target.value as SortField)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-label text-slate-700 focus:outline-none focus:border-indigo-500 focus:bg-white"
          >
            <option value="createdAt_desc font-mono">Newest First</option>
            <option value="deadline_asc">Deadline (Soonest)</option>
            <option value="priority_desc">Priority (High to Low)</option>
            <option value="title_asc">Title (A-Z)</option>
          </select>
        </div>

        {/* Toggle Shortcuts */}
        <div className="flex items-center gap-4 text-label pt-1 text-slate-600">
          <label className="flex items-center gap-1.5 cursor-pointer font-medium">
            <input
              type="checkbox"
              checked={isOverdueOnly}
              onChange={(e) => setIsOverdueOnly(e.target.checked)}
              className="rounded text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-rose-600 font-semibold">Overdue Only</span>
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer font-medium">
            <input
              type="checkbox"
              checked={isTodayOnly}
              onChange={(e) => setIsTodayOnly(e.target.checked)}
              className="rounded text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-indigo-600 font-semibold">Due Today</span>
          </label>
        </div>
      </div>

      {/* Main View Area */}
      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh] text-slate-400 gap-3">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
          <span className="text-label font-medium uppercase tracking-wider text-slate-500 font-mono">Loading Tasks...</span>
        </div>
      ) : tasks.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-3 shadow-xs">
          <ListTodo className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-card-title font-jakarta font-semibold text-slate-900">No tasks found</h3>
          <p className="text-body text-slate-500 max-w-md mx-auto">
            Try adjusting your search criteria or create a new task.
          </p>
          <button
            onClick={handleOpenCreate}
            className="mt-2 inline-flex items-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-label font-semibold shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Create Task
          </button>
        </div>
      ) : viewMode === 'table' ? (
        /* TABLE VIEW */
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
          <table className="w-full text-left text-body">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-label font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4">Task Name & Details</th>
                <th className="py-3.5 px-4">Project</th>
                <th className="py-3.5 px-4">Priority</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Subtasks</th>
                <th className="py-3.5 px-4">Deadline</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {tasks.map((task) => {
                const totalSub = task.subtasks?.length || 0;
                const completedSub = task.subtasks?.filter((s) => s.completed).length || 0;

                return (
                  <tr key={task.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-4 px-4 space-y-1">
                      <div className="font-semibold text-slate-900 text-body">{task.title}</div>
                      <p className="text-caption text-slate-500 line-clamp-1 max-w-md">{task.description}</p>
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className="px-2.5 py-0.5 rounded text-data font-medium"
                        style={{
                          backgroundColor: `${task.projectColor || '#4f46e5'}15`,
                          color: task.projectColor || '#4f46e5',
                          border: `1px solid ${task.projectColor || '#4f46e5'}30`,
                        }}
                      >
                        {task.projectName}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`px-2.5 py-0.5 rounded text-caption font-semibold ${
                          task.priority === 'HIGH'
                            ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                            : task.priority === 'MEDIUM'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}
                      >
                        {task.priority}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <button
                        onClick={() => handleToggleTaskStatus(task)}
                        className={`px-2.5 py-1 rounded text-caption font-semibold transition-transform active:scale-95 cursor-pointer flex items-center gap-1.5 ${
                          task.status === 'COMPLETED'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : task.status === 'IN_PROGRESS'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {task.status.replace('_', ' ')}
                      </button>
                    </td>
                    <td className="py-4 px-4 font-mono text-caption text-slate-500">
                      {totalSub > 0 ? (
                        <span>
                          {completedSub}/{totalSub} Done
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="py-4 px-4 font-mono text-data text-slate-600">{task.deadline}</td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenEdit(task)}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                          title="Edit Task"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteTask(task.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                          title="Delete Task"
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
                className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3 min-h-[60vh] flex flex-col shadow-xs"
              >
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <h3 className="font-semibold text-label uppercase tracking-wider text-slate-700 flex items-center gap-2 font-jakarta">
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${
                        colStatus === 'COMPLETED'
                          ? 'bg-emerald-500'
                          : colStatus === 'IN_PROGRESS'
                          ? 'bg-amber-500'
                          : 'bg-slate-400'
                      }`}
                    ></span>
                    {colStatus.replace('_', ' ')}
                  </h3>
                  <span className="px-2 py-0.5 rounded-full bg-white text-indigo-600 font-mono text-data font-semibold border border-slate-200">
                    {colTasks.length}
                  </span>
                </div>

                <div className="space-y-3 flex-1">
                  {colTasks.map((task) => (
                    <div
                      key={task.id}
                      className="bg-white border border-slate-200 hover:border-slate-300 p-4 rounded-xl space-y-3 shadow-xs hover:shadow-md transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className="px-2 py-0.5 rounded text-data font-medium"
                          style={{
                            backgroundColor: `${task.projectColor || '#4f46e5'}15`,
                            color: task.projectColor || '#4f46e5',
                          }}
                        >
                          {task.projectName}
                        </span>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleOpenEdit(task)}
                            className="text-slate-400 hover:text-indigo-600 p-1 cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-body font-semibold text-slate-900">{task.title}</h4>
                        <p className="text-caption text-slate-500 line-clamp-2 mt-1">{task.description}</p>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-caption">
                        <span
                          className={`px-1.5 py-0.5 rounded font-semibold ${
                            task.priority === 'HIGH'
                              ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                              : task.priority === 'MEDIUM'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {task.priority}
                        </span>

                        <span className="font-mono text-data text-slate-500 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-indigo-600" /> {task.deadline}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl text-slate-900">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-card-title font-jakarta font-semibold text-slate-900 flex items-center gap-2">
                {editingTask ? 'Edit Task Specification' : 'Create New Task'}
                <span className="text-data font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 font-mono">
                  Gemini AI Powered
                </span>
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Task Title with AI Breakdown Button */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-label font-medium text-slate-700">Task Title *</label>
                  <button
                    type="button"
                    onClick={handleAiBreakdown}
                    disabled={aiLoading}
                    className="text-label font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 cursor-pointer"
                  >
                    {aiLoading ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-600" />
                    ) : (
                      <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
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
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-body text-slate-900 focus:border-indigo-500 focus:bg-white focus:outline-none"
                />
              </div>

              {/* Project Workspace Selection & Inline Creator */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-label font-medium text-slate-700">Project Workspace *</label>
                  <button
                    type="button"
                    onClick={() => setShowInlineWorkspaceCreator(!showInlineWorkspaceCreator)}
                    className="text-label font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 text-indigo-600" />
                    {showInlineWorkspaceCreator ? 'Cancel Creator' : '+ Quick Add Workspace'}
                  </button>
                </div>

                {showInlineWorkspaceCreator ? (
                  <div className="p-3 bg-slate-50 border border-indigo-200 rounded-xl space-y-2.5">
                    <div className="text-label font-semibold text-indigo-700 font-jakarta flex items-center gap-1.5">
                      <CheckSquare className="w-3.5 h-3.5" /> Create Workspace Inline
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={inlineProjectData.name}
                        onChange={(e) => setInlineProjectData({ ...inlineProjectData, name: e.target.value })}
                        placeholder="Workspace Name (e.g. Auth Microservice)"
                        className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-body text-slate-900 focus:outline-none focus:border-indigo-500"
                      />
                      <select
                        value={inlineProjectData.category}
                        onChange={(e) => setInlineProjectData({ ...inlineProjectData, category: e.target.value })}
                        className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-body text-slate-900 focus:outline-none focus:border-indigo-500 font-mono"
                      >
                        <option value="Backend Architecture">Backend Architecture</option>
                        <option value="Frontend Engineering">Frontend Engineering</option>
                        <option value="DevOps & Infra">DevOps & Infra</option>
                        <option value="Database Design">Database Design</option>
                        <option value="General">General</option>
                      </select>
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center gap-2">
                        {['#4f46e5', '#10b981', '#f59e0b', '#2563eb', '#7c3aed'].map((c) => (
                          <button
                            key={c}
                            type="button"
                            onClick={() => setInlineProjectData({ ...inlineProjectData, color: c })}
                            className={`w-4 h-4 rounded-full transition-transform cursor-pointer ${
                              inlineProjectData.color === c ? 'scale-125 ring-2 ring-indigo-600 ring-offset-1' : ''
                            }`}
                            style={{ backgroundColor: c }}
                          />
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={handleCreateInlineProject}
                        className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-label font-semibold rounded-lg cursor-pointer"
                      >
                        Save Workspace
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {projects.length === 0 ? (
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, projectId: '' })}
                        className="p-2 rounded-xl border border-indigo-300 bg-indigo-50 text-indigo-700 text-left text-body font-semibold flex items-center justify-between"
                      >
                        <span className="truncate">General Workspace</span>
                        <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
                      </button>
                    ) : (
                      projects.map((p) => {
                        const isSelected = formData.projectId === p.id;
                        return (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => setFormData({ ...formData, projectId: p.id })}
                            className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                              isSelected
                                ? 'bg-indigo-50 border-indigo-300 text-indigo-700 font-semibold shadow-xs'
                                : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                            }`}
                          >
                            <div className="flex items-center gap-1.5 truncate">
                              <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: p.color || '#4f46e5' }} />
                              <span className="text-body truncate">{p.name}</span>
                            </div>
                            {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0 ml-1" />}
                          </button>
                        );
                      })
                    )}
                  </div>
                )}
              </div>

              {/* Priority & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-label font-medium text-slate-700">Priority Level *</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as Priority })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-body text-slate-900 focus:border-indigo-500 focus:bg-white focus:outline-none"
                  >
                    <option value="LOW">LOW</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-label font-medium text-slate-700">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as Status })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-body text-slate-900 focus:border-indigo-500 focus:bg-white focus:outline-none"
                  >
                    <option value="TO_DO">To Do</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="COMPLETED">Completed</option>
                  </select>
                </div>
              </div>

              {/* Deadline */}
              <div className="space-y-1">
                <label className="text-label font-medium text-slate-700">Completion Deadline</label>
                <input
                  type="date"
                  value={formData.deadline}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-body text-slate-900 focus:border-indigo-500 focus:bg-white focus:outline-none font-mono"
                />
              </div>

              {/* Task Description */}
              <div className="space-y-1">
                <label className="text-label font-medium text-slate-700">Description & Acceptance Criteria</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Detail engineering requirements, JWT filter logic, endpoints..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-body text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none"
                />
              </div>

              {/* Subtasks Checklist */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <label className="text-label font-medium text-slate-700">Subtask Breakdown Checklist</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newSubtaskTitle}
                    onChange={(e) => setNewSubtaskTitle(e.target.value)}
                    placeholder="Add subtask step (e.g. Implement BCryptPasswordEncoder)"
                    className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-body text-slate-900 focus:border-indigo-500 focus:bg-white focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddSubtask}
                    className="px-3.5 py-2 bg-indigo-600 text-white rounded-xl text-label font-semibold hover:bg-indigo-700 cursor-pointer"
                  >
                    Add
                  </button>
                </div>

                {formData.subtasks.length > 0 && (
                  <div className="space-y-1.5 max-h-36 overflow-y-auto pt-1">
                    {formData.subtasks.map((st) => (
                      <div key={st.id} className="flex items-center justify-between p-2 bg-slate-50 border border-slate-200 rounded-lg text-body">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={st.completed}
                            onChange={() => handleToggleSubtask(st.id)}
                            className="rounded text-indigo-600 focus:ring-indigo-500"
                          />
                          <span className={st.completed ? 'line-through text-slate-400' : 'text-slate-700'}>{st.title}</span>
                        </label>
                        <button
                          type="button"
                          onClick={() => handleRemoveSubtask(st.id)}
                          className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-label font-medium text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-label font-semibold shadow-xs cursor-pointer font-sans"
                >
                  {editingTask ? 'Update Task' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
