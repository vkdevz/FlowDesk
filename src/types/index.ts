export type RoleName = 'ROLE_USER' | 'ROLE_ADMIN';

export type Priority = 'LOW' | 'MEDIUM' | 'HIGH';

export type Status = 'TO_DO' | 'IN_PROGRESS' | 'COMPLETED';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  roles: RoleName[];
  bio?: string;
  jobTitle?: string;
  createdAt: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  category: string;
  color: string;
  isArchived: boolean;
  createdAt: string;
  updatedAt?: string;
  userId?: string;
  taskCount?: number;
  completedTaskCount?: number;
}

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  status: Status;
  deadline: string; // ISO date string YYYY-MM-DD
  createdAt: string;
  updatedAt?: string;
  projectId: string;
  projectName?: string;
  projectColor?: string;
  userId?: string;
  subtasks?: Subtask[];
  tags?: string[];
}

export interface TaskFilterOptions {
  status?: Status | 'ALL';
  priority?: Priority | 'ALL';
  projectId?: string | 'ALL';
  search?: string;
  isOverdueOnly?: boolean;
  isTodayOnly?: boolean;
}

export type SortField = 'createdAt_desc' | 'createdAt_asc' | 'priority_desc' | 'deadline_asc';

export interface DashboardMetrics {
  totalProjects: number;
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  overdueTasks: number;
  todayTasks: number;
  completionRate: number;
  priorityBreakdown: {
    LOW: number;
    MEDIUM: number;
    HIGH: number;
  };
  statusBreakdown: {
    TO_DO: number;
    IN_PROGRESS: number;
    COMPLETED: number;
  };
  weeklyActivity: { day: string; completed: number; created: number }[];
}

export interface ApiLog {
  id: string;
  timestamp: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  url: string;
  status: number;
  statusText: string;
  durationMs: number;
  requestBody?: any;
  responseData?: any;
  headers?: Record<string, string>;
}

export interface AuthResponse {
  token: string;
  type: string;
  id: string;
  name: string;
  email: string;
  roles: string[];
}

export interface AIAnalysisResult {
  summary: string;
  prioritySuggestion: Priority;
  estimatedHours: number;
  suggestedSubtasks: string[];
  productivityTips: string[];
}
