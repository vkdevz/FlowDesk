import React, { useEffect, useState } from 'react';
import { apiClient } from '../services/api';
import { DashboardMetrics, Task } from '../types';
import {
  FolderKanban,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Calendar,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Plus,
  Loader2,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';

interface DashboardPageProps {
  onNavigateTab: (tab: 'dashboard' | 'projects' | 'tasks' | 'profile') => void;
  onOpenAiPlanner: () => void;
}

const EMPTY_STATS: DashboardMetrics = {
  totalProjects: 0,
  totalTasks: 0,
  completedTasks: 0,
  pendingTasks: 0,
  overdueTasks: 0,
  todayTasks: 0,
  completionRate: 0,
  statusBreakdown: { TO_DO: 0, IN_PROGRESS: 0, COMPLETED: 0 },
  priorityBreakdown: { LOW: 0, MEDIUM: 0, HIGH: 0 },
  weeklyActivity: [
    { day: 'Mon', completed: 0, created: 0 },
    { day: 'Tue', completed: 0, created: 0 },
    { day: 'Wed', completed: 0, created: 0 },
    { day: 'Thu', completed: 0, created: 0 },
    { day: 'Fri', completed: 0, created: 0 },
    { day: 'Sat', completed: 0, created: 0 },
    { day: 'Sun', completed: 0, created: 0 },
  ],
};

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onNavigateTab,
  onOpenAiPlanner,
}) => {
  const [stats, setStats] = useState<DashboardMetrics | null>(null);
  const [recentTasks, setRecentTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsRes, tasksRes] = await Promise.all([
          apiClient.get<DashboardMetrics>('/dashboard/stats'),
          apiClient.get<Task[]>('/tasks?sort=createdAt_desc'),
        ]);
        setStats(statsRes.data ?? EMPTY_STATS);
        setRecentTasks(Array.isArray(tasksRes.data) ? tasksRes.data.slice(0, 5) : []);
      } catch (err) {
        console.error('Failed loading dashboard data:', err);
        setStats(EMPTY_STATS);
        setRecentTasks([]);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading || !stats) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-slate-400 gap-3 font-sans">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
        <span className="text-label text-slate-500 font-medium">Loading Dashboard...</span>
      </div>
    );
  }

  const statusBreakdown = stats.statusBreakdown || { TO_DO: 0, IN_PROGRESS: 0, COMPLETED: 0 };
  const weeklyActivity = stats.weeklyActivity || EMPTY_STATS.weeklyActivity;

  const statusData = [
    { name: 'To Do', value: statusBreakdown.TO_DO ?? 0 },
    { name: 'In Progress', value: statusBreakdown.IN_PROGRESS ?? 0 },
    { name: 'Completed', value: statusBreakdown.COMPLETED ?? 0 },
  ];

  const STATUS_COLORS = ['#94a3b8', '#f59e0b', '#10b981'];

  return (
    <div className="space-y-6 font-sans">
      {/* Dashboard Top Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-section-title font-jakarta font-bold text-slate-900">
            Dashboard
          </h1>
          <p className="text-body text-slate-500 mt-0.5">
            Overview of active project workspaces, task completion, and weekly velocity
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenAiPlanner}
            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-label font-medium shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            AI Planner
          </button>
          <button
            onClick={() => onNavigateTab('tasks')}
            className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg text-label font-medium transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4 text-indigo-600" />
            New Task
          </button>
        </div>
      </div>

      {/* 4 Spacious Key Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="card-clean card-clean-hover p-5 space-y-3">
          <div className="flex items-center justify-between text-label text-slate-500 font-medium">
            <span>Workspaces</span>
            <FolderKanban className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-section-title font-jakarta font-bold text-slate-900">{stats.totalProjects}</div>
          <div className="text-caption text-slate-500">Active project modules</div>
        </div>

        {/* Metric 2 */}
        <div className="card-clean card-clean-hover p-5 space-y-3">
          <div className="flex items-center justify-between text-label text-slate-500 font-medium">
            <span>Total Tasks</span>
            <TrendingUp className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-section-title font-jakarta font-bold text-slate-900">{stats.totalTasks}</div>
          <div className="text-caption text-slate-500">{stats.completionRate}% completed overall</div>
        </div>

        {/* Metric 3 */}
        <div className="card-clean card-clean-hover p-5 space-y-3">
          <div className="flex items-center justify-between text-label text-slate-500 font-medium">
            <span>Completed</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-section-title font-jakarta font-bold text-emerald-600">{stats.completedTasks}</div>
          <div className="text-caption text-emerald-700 font-medium">Tasks resolved</div>
        </div>

        {/* Metric 4 */}
        <div className="card-clean card-clean-hover p-5 space-y-3">
          <div className="flex items-center justify-between text-label text-slate-500 font-medium">
            <span>Pending & Overdue</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-section-title font-jakarta font-bold text-amber-600">{stats.pendingTasks}</div>
          <div className="text-caption text-amber-700 font-medium">{stats.overdueTasks} overdue items</div>
        </div>
      </div>

      {/* Analytics Charts Grid - 2 Balanced Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Task Status Breakdown */}
        <div className="card-clean p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-card-title font-jakarta font-semibold text-slate-900">Task Status Distribution</h2>
              <p className="text-caption text-slate-500">Breakdown across active task statuses</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-6 pt-2">
            <div className="h-44 w-44 flex-shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    innerRadius={45}
                    outerRadius={65}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {statusData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={STATUS_COLORS[index % STATUS_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px', fontSize: '12px', color: '#0f172a' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="flex-1 space-y-3 w-full">
              <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg text-body">
                <span className="flex items-center gap-2 text-slate-600 font-medium">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-400"></span> To Do
                </span>
                <span className="font-semibold text-slate-900 font-mono">{statusBreakdown.TO_DO}</span>
              </div>
              <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg text-body">
                <span className="flex items-center gap-2 text-slate-600 font-medium">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> In Progress
                </span>
                <span className="font-semibold text-slate-900 font-mono">{statusBreakdown.IN_PROGRESS}</span>
              </div>
              <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg text-body">
                <span className="flex items-center gap-2 text-slate-600 font-medium">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Completed
                </span>
                <span className="font-semibold text-slate-900 font-mono">{statusBreakdown.COMPLETED}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Weekly Productivity Velocity */}
        <div className="card-clean p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-card-title font-jakarta font-semibold text-slate-900">Weekly Task Velocity</h2>
              <p className="text-caption text-slate-500">7-day creation vs completion velocity</p>
            </div>
          </div>
          <div className="h-52 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyActivity}>
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px', fontSize: '12px', color: '#0f172a' }}
                />
                <Bar dataKey="completed" name="Completed Tasks" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="created" name="Created Tasks" fill="#4f46e5" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Tasks Stream Table */}
      <div className="card-clean p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-card-title font-jakarta font-semibold text-slate-900">Recent Activity Stream</h2>
            <p className="text-caption text-slate-500 font-normal">Latest active tasks across your workspaces</p>
          </div>
          <button
            onClick={() => onNavigateTab('tasks')}
            className="text-label text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1 cursor-pointer"
          >
            View All <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          {recentTasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400 gap-2">
              <CheckCircle2 className="w-8 h-8 text-slate-300" />
              <p className="text-body font-semibold text-slate-700 font-jakarta">No active tasks</p>
              <p className="text-caption text-slate-500">Create your first task to start tracking metrics.</p>
              <button
                onClick={() => onNavigateTab('tasks')}
                className="mt-2 px-3.5 py-1.5 text-label font-medium bg-indigo-600 text-white rounded-lg cursor-pointer"
              >
                + Add Task
              </button>
            </div>
          ) : (
            <table className="w-full text-left text-body">
              <thead>
                <tr className="text-slate-400 border-b border-slate-100 text-label font-medium uppercase tracking-wider">
                  <th className="pb-3 px-3">Task Title</th>
                  <th className="pb-3 px-3">Workspace</th>
                  <th className="pb-3 px-3">Priority</th>
                  <th className="pb-3 px-3">Status</th>
                  <th className="pb-3 px-3">Deadline</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {recentTasks.map((task) => (
                  <tr key={task.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-3 font-medium text-slate-900 text-body">{task.title}</td>
                    <td className="py-3 px-3">
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
                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-caption font-medium ${
                          task.priority === 'HIGH'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : task.priority === 'MEDIUM'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}
                      >
                        {task.priority}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-caption font-medium ${
                          task.status === 'COMPLETED'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : task.status === 'IN_PROGRESS'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}
                      >
                        {task.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-data text-slate-500">{task.deadline}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
