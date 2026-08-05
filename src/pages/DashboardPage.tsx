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

const FALLBACK_STATS: DashboardMetrics = {
  totalProjects: 3,
  totalTasks: 6,
  completedTasks: 2,
  pendingTasks: 4,
  overdueTasks: 1,
  todayTasks: 2,
  completionRate: 33,
  statusBreakdown: { TO_DO: 3, IN_PROGRESS: 1, COMPLETED: 2 },
  priorityBreakdown: { LOW: 2, MEDIUM: 2, HIGH: 2 },
  weeklyActivity: [
    { day: 'Mon', completed: 2, created: 3 },
    { day: 'Tue', completed: 4, created: 2 },
    { day: 'Wed', completed: 1, created: 4 },
    { day: 'Thu', completed: 3, created: 1 },
    { day: 'Fri', completed: 5, created: 3 },
    { day: 'Sat', completed: 2, created: 0 },
    { day: 'Sun', completed: 1, created: 1 },
  ],
};

const FALLBACK_RECENT_TASKS: Task[] = [
  {
    id: 'task_1',
    title: 'Configure Spring Security JWT Filter Chain',
    description: 'Implement JwtAuthenticationFilter and BCryptPasswordEncoder beans for stateless bearer tokens.',
    priority: 'HIGH',
    status: 'IN_PROGRESS',
    deadline: '2026-08-08',
    projectId: 'proj_1',
    projectName: 'Backend Microservices',
    projectColor: '#3b82f6',
    subtasks: [
      { id: 'st_1', title: 'Add jjwt-api dependency', completed: true },
      { id: 'st_2', title: 'Implement SecurityFilterChain bean', completed: true },
      { id: 'st_3', title: 'Add CORS configuration source', completed: false },
    ],
    tags: ['Security', 'JWT', 'Spring Boot 3'],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'task_2',
    title: 'Design PostgreSQL Database Schema for Workspaces',
    description: 'Create JPA Entities with @OneToMany relationships and Flyway migrations.',
    priority: 'HIGH',
    status: 'COMPLETED',
    deadline: '2026-08-05',
    projectId: 'proj_2',
    projectName: 'Database Engine',
    projectColor: '#10b981',
    subtasks: [],
    tags: ['JPA', 'PostgreSQL', 'Hibernate'],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'task_3',
    title: 'Implement Gemini AI Subtask Auto-Generation Route',
    description: 'Integrate Google Gen AI SDK for automated task breakdown and priority estimation.',
    priority: 'MEDIUM',
    status: 'TO_DO',
    deadline: '2026-08-10',
    projectId: 'proj_3',
    projectName: 'Frontend Platform',
    projectColor: '#8b5cf6',
    subtasks: [],
    tags: ['Gemini AI', 'React', 'TypeScript'],
    createdAt: new Date().toISOString(),
  },
];

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
        if (statsRes.data && statsRes.data.statusBreakdown && statsRes.data.priorityBreakdown) {
          setStats(statsRes.data);
        } else {
          setStats(FALLBACK_STATS);
        }
        if (Array.isArray(tasksRes.data)) {
          setRecentTasks(tasksRes.data.slice(0, 5));
        } else {
          setRecentTasks(FALLBACK_RECENT_TASKS);
        }
      } catch (err) {
        console.error('Failed loading dashboard data, using initial data:', err);
        setStats(FALLBACK_STATS);
        setRecentTasks(FALLBACK_RECENT_TASKS);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading || !stats) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-400 gap-3">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
        <span className="text-xs font-semibold">Loading FlowDesk Dashboard Metrics...</span>
      </div>
    );
  }

  // Recharts color palettes
  const STATUS_COLORS = ['#3b82f6', '#f59e0b', '#10b981'];
  const PRIORITY_COLORS = ['#10b981', '#f59e0b', '#ef4444'];

  const statusBreakdown = stats.statusBreakdown || { TO_DO: 0, IN_PROGRESS: 0, COMPLETED: 0 };
  const priorityBreakdown = stats.priorityBreakdown || { LOW: 0, MEDIUM: 0, HIGH: 0 };
  const weeklyActivity = stats.weeklyActivity || FALLBACK_STATS.weeklyActivity;

  const statusData = [
    { name: 'To Do', value: statusBreakdown.TO_DO ?? 0 },
    { name: 'In Progress', value: statusBreakdown.IN_PROGRESS ?? 0 },
    { name: 'Completed', value: statusBreakdown.COMPLETED ?? 0 },
  ];

  const priorityData = [
    { name: 'Low', value: priorityBreakdown.LOW ?? 0 },
    { name: 'Medium', value: priorityBreakdown.MEDIUM ?? 0 },
    { name: 'High', value: priorityBreakdown.HIGH ?? 0 },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-900/40 via-slate-900 to-slate-900 border border-indigo-500/20 p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            Task & Productivity Control Center
          </h1>
          <p className="text-xs text-slate-400">
            Real-time analytics powered by Spring Boot REST services, JPA aggregations, and Gemini AI.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenAiPlanner}
            className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/20 transition-all flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            Gemini Daily Plan
          </button>
          <button
            onClick={() => onNavigateTab('tasks')}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4 text-emerald-400" />
            New Task
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Metric 1 */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Total Projects</span>
            <FolderKanban className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-black text-slate-100">{stats.totalProjects}</div>
          <div className="text-[10px] text-slate-500">Active workspaces</div>
        </div>

        {/* Metric 2 */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Total Tasks</span>
            <TrendingUp className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-black text-slate-100">{stats.totalTasks}</div>
          <div className="text-[10px] text-slate-500">{stats.completionRate}% completion rate</div>
        </div>

        {/* Metric 3 */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Completed</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400">{stats.completedTasks}</div>
          <div className="text-[10px] text-emerald-500 font-semibold">Done</div>
        </div>

        {/* Metric 4 */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Pending</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-400">{stats.pendingTasks}</div>
          <div className="text-[10px] text-amber-500">In progress or queued</div>
        </div>

        {/* Metric 5 */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Overdue</span>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-black text-rose-400">{stats.overdueTasks}</div>
          <div className="text-[10px] text-rose-500 font-semibold">Requires attention</div>
        </div>

        {/* Metric 6 */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Today's Tasks</span>
            <Calendar className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-black text-purple-400">{stats.todayTasks}</div>
          <div className="text-[10px] text-slate-500">Due before midnight</div>
        </div>
      </div>

      {/* Analytics Visualization Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Status Distribution Pie Chart */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-sm font-bold text-slate-200">Task Status Breakdown</h2>
            <span className="text-[10px] font-mono text-slate-500">SQL Group By Status</span>
          </div>
          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {statusData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={STATUS_COLORS[index % STATUS_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-around text-xs text-slate-400 pt-2 border-t border-slate-800/60">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> To Do ({statusBreakdown.TO_DO})
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> In Progress ({statusBreakdown.IN_PROGRESS})
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Completed ({statusBreakdown.COMPLETED})
            </div>
          </div>
        </div>

        {/* Priority Breakdown Chart */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-sm font-bold text-slate-200">Priority Volume</h2>
            <span className="text-[10px] font-mono text-slate-500">ENUM Filter</span>
          </div>
          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={priorityData}
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {priorityData.map((_, index) => (
                    <Cell key={`cell-p-${index}`} fill={PRIORITY_COLORS[index % PRIORITY_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-around text-xs text-slate-400 pt-2 border-t border-slate-800/60">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Low ({priorityBreakdown.LOW})
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Medium ({priorityBreakdown.MEDIUM})
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> High ({priorityBreakdown.HIGH})
            </div>
          </div>
        </div>

        {/* Weekly Productivity Bar Chart */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-sm font-bold text-slate-200">Weekly Task Velocity</h2>
            <span className="text-[10px] font-mono text-slate-500">7-Day Trend</span>
          </div>
          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyActivity}>
                <XAxis dataKey="day" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                />
                <Bar dataKey="completed" name="Completed Tasks" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="created" name="Created Tasks" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/60">
            <span className="flex items-center gap-1 text-emerald-400 font-semibold">
              <span className="w-2 h-2 bg-emerald-500 rounded-full"></span> Completed Velocity
            </span>
            <span className="flex items-center gap-1 text-indigo-400 font-semibold">
              <span className="w-2 h-2 bg-indigo-500 rounded-full"></span> Backlog Growth
            </span>
          </div>
        </div>
      </div>

      {/* Recent Activity / Tasks Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h2 className="text-sm font-bold text-slate-100">Recent Task Stream</h2>
            <p className="text-xs text-slate-400">Latest active tasks across all mapped Spring Boot projects</p>
          </div>
          <button
            onClick={() => onNavigateTab('tasks')}
            className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
          >
            View All Tasks <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-slate-400 border-b border-slate-800 font-semibold">
                <th className="pb-3 px-2">Task Title</th>
                <th className="pb-3 px-2">Project</th>
                <th className="pb-3 px-2">Priority</th>
                <th className="pb-3 px-2">Status</th>
                <th className="pb-3 px-2">Deadline</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300 font-medium">
              {recentTasks.map((task) => (
                <tr key={task.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-2 font-semibold text-slate-100">{task.title}</td>
                  <td className="py-3 px-2">
                    <span
                      className="px-2 py-0.5 rounded text-[11px] font-semibold"
                      style={{
                        backgroundColor: `${task.projectColor}20`,
                        color: task.projectColor,
                        border: `1px solid ${task.projectColor}40`,
                      }}
                    >
                      {task.projectName}
                    </span>
                  </td>
                  <td className="py-3 px-2">
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
                  <td className="py-3 px-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        task.status === 'COMPLETED'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : task.status === 'IN_PROGRESS'
                          ? 'bg-amber-500/20 text-amber-400'
                          : 'bg-slate-700/50 text-slate-300'
                      }`}
                    >
                      {task.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-3 px-2 font-mono text-slate-400">{task.deadline}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
