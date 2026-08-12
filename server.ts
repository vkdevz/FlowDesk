import express, { Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

const apiRouter = express.Router();

// Initialize Gemini Client server-side
const ai = process.env.GEMINI_API_KEY
  ? new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

// Persistent Data Store Setup
const DATA_DIR = path.join(process.cwd(), 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const USERS_FILE = path.join(DATA_DIR, 'users.json');
const PROJECTS_FILE = path.join(DATA_DIR, 'projects.json');
const TASKS_FILE = path.join(DATA_DIR, 'tasks.json');

interface UserRecord {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  avatar: string;
  roles: string[];
  bio: string;
  jobTitle: string;
  createdAt: string;
}

interface ProjectRecord {
  id: string;
  name: string;
  description: string;
  category: string;
  color: string;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
  userId: string;
}

interface TaskRecord {
  id: string;
  title: string;
  description: string;
  priority: string;
  status: string;
  deadline: string;
  createdAt: string;
  updatedAt: string;
  projectId: string;
  userId: string;
  subtasks: { id: string; title: string; completed: boolean }[];
  tags: string[];
}

let users: UserRecord[] = [];
let projects: ProjectRecord[] = [];
let tasks: TaskRecord[] = [];

const loadData = () => {
  try {
    if (fs.existsSync(USERS_FILE)) users = JSON.parse(fs.readFileSync(USERS_FILE, 'utf-8'));
    if (fs.existsSync(PROJECTS_FILE)) projects = JSON.parse(fs.readFileSync(PROJECTS_FILE, 'utf-8'));
    if (fs.existsSync(TASKS_FILE)) tasks = JSON.parse(fs.readFileSync(TASKS_FILE, 'utf-8'));
  } catch (e) {
    console.error('Error loading persistent data store:', e);
  }
};

const saveData = () => {
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
    fs.writeFileSync(PROJECTS_FILE, JSON.stringify(projects, null, 2));
    fs.writeFileSync(TASKS_FILE, JSON.stringify(tasks, null, 2));
  } catch (e) {
    console.error('Error saving persistent data store:', e);
  }
};

loadData();

// Helper functions
const generateJWT = (userId: string, email: string) => {
  return `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI${Buffer.from(
    JSON.stringify({ userId, email, exp: Date.now() + 86400000 })
  ).toString('base64')}.FlowDeskSignatureKey2026`;
};

const getUserIdFromReq = (req: Request): string | null => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.split(' ')[1];
  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;
    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf8'));
    return payload.userId || null;
  } catch {
    return null;
  }
};

// ==================== REST API ROUTES ==================== //

// AUTH API
apiRouter.post('/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  const user = users.find((u) => u.email.toLowerCase() === email?.trim().toLowerCase());

  if (!user || user.passwordHash !== password) {
    return res.status(401).json({
      status: 401,
      error: 'Unauthorized',
      message: 'Invalid email or password credentials',
      timestamp: new Date().toISOString(),
    });
  }

  const token = generateJWT(user.id, user.email);

  return res.json({
    token,
    type: 'Bearer',
    id: user.id,
    name: user.name,
    email: user.email,
    roles: user.roles,
  });
});

apiRouter.post('/auth/register', (req: Request, res: Response) => {
  const { name, email, password } = req.body;

  if (!name?.trim() || !email?.trim() || !password?.trim()) {
    return res.status(400).json({
      status: 400,
      error: 'Bad Request',
      message: 'Validation failed: Name, email, and password are required',
      timestamp: new Date().toISOString(),
    });
  }

  const existing = users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
  if (existing) {
    return res.status(400).json({
      status: 400,
      error: 'Bad Request',
      message: 'User with this email already exists',
      timestamp: new Date().toISOString(),
    });
  }

  const newUser: UserRecord = {
    id: `usr-${Date.now()}`,
    name: name.trim(),
    email: email.trim().toLowerCase(),
    passwordHash: password, // Simple store for local dev
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
    roles: ['ROLE_USER'],
    bio: 'Productivity enthusiast.',
    jobTitle: 'Software Engineer',
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);

  // Auto-create default project workspace for new account
  const defaultProject: ProjectRecord = {
    id: `proj-${Date.now()}`,
    name: 'General Workspace',
    description: 'Default project workspace for managing your tasks',
    category: 'General',
    color: '#d97706',
    isArchived: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    userId: newUser.id,
  };
  projects.unshift(defaultProject);

  saveData();

  const token = generateJWT(newUser.id, newUser.email);

  return res.status(201).json({
    token,
    type: 'Bearer',
    id: newUser.id,
    name: newUser.name,
    email: newUser.email,
    roles: newUser.roles,
  });
});

apiRouter.get('/auth/me', (req: Request, res: Response) => {
  const userId = getUserIdFromReq(req);
  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized session' });
  }

  const user = users.find((u) => u.id === userId);
  if (!user) {
    return res.status(404).json({ message: 'User profile not found' });
  }

  return res.json({
    id: user.id,
    name: user.name,
    email: user.email,
    avatar: user.avatar,
    roles: user.roles,
    bio: user.bio,
    jobTitle: user.jobTitle,
    createdAt: user.createdAt,
  });
});

apiRouter.post('/auth/change-password', (req: Request, res: Response) => {
  const userId = getUserIdFromReq(req);
  if (!userId) return res.status(401).json({ message: 'Unauthorized' });

  const { currentPassword, newPassword } = req.body;
  const user = users.find((u) => u.id === userId);

  if (!user || user.passwordHash !== currentPassword) {
    return res.status(400).json({ message: 'Current password is incorrect' });
  }

  user.passwordHash = newPassword;
  saveData();

  return res.json({ message: 'Password updated successfully' });
});

// DASHBOARD METRICS API
apiRouter.get('/dashboard/stats', (req: Request, res: Response) => {
  const userId = getUserIdFromReq(req);
  const userProjects = projects.filter((p) => p.userId === userId);
  const userTasks = tasks.filter((t) => t.userId === userId);

  const totalProjects = userProjects.filter((p) => !p.isArchived).length;
  const totalTasks = userTasks.length;
  const completedTasks = userTasks.filter((t) => t.status === 'COMPLETED').length;
  const pendingTasks = userTasks.filter((t) => t.status !== 'COMPLETED').length;

  const today = new Date().toISOString().split('T')[0];
  const overdueTasks = userTasks.filter(
    (t) => t.status !== 'COMPLETED' && t.deadline && t.deadline < today
  ).length;

  const todayTasks = userTasks.filter((t) => t.deadline === today).length;

  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const priorityBreakdown = {
    LOW: userTasks.filter((t) => t.priority === 'LOW').length,
    MEDIUM: userTasks.filter((t) => t.priority === 'MEDIUM').length,
    HIGH: userTasks.filter((t) => t.priority === 'HIGH').length,
  };

  const statusBreakdown = {
    TO_DO: userTasks.filter((t) => t.status === 'TO_DO').length,
    IN_PROGRESS: userTasks.filter((t) => t.status === 'IN_PROGRESS').length,
    COMPLETED: userTasks.filter((t) => t.status === 'COMPLETED').length,
  };

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const weeklyActivity = days.map((day) => ({
    day,
    completed: userTasks.filter((t) => t.status === 'COMPLETED').length,
    created: userTasks.length,
  }));

  return res.json({
    totalProjects,
    totalTasks,
    completedTasks,
    pendingTasks,
    overdueTasks,
    todayTasks,
    completionRate,
    priorityBreakdown,
    statusBreakdown,
    weeklyActivity,
  });
});

// PROJECTS API
apiRouter.get('/projects', (req: Request, res: Response) => {
  const userId = getUserIdFromReq(req);
  const showArchived = req.query.archived === 'true';

  const userProjects = projects.filter(
    (p) => p.userId === userId && (showArchived ? true : !p.isArchived)
  );

  const filtered = userProjects.map((p) => {
    const projTasks = tasks.filter((t) => t.projectId === p.id && t.userId === userId);
    const completed = projTasks.filter((t) => t.status === 'COMPLETED').length;
    return {
      ...p,
      taskCount: projTasks.length,
      completedTaskCount: completed,
    };
  });

  return res.json(filtered);
});

apiRouter.post('/projects', (req: Request, res: Response) => {
  const userId = getUserIdFromReq(req);
  if (!userId) return res.status(401).json({ message: 'Unauthorized' });

  const { name, description, category, color } = req.body;
  if (!name) {
    return res.status(400).json({ message: 'Project name is required' });
  }

  const newProject: ProjectRecord = {
    id: `proj-${Date.now()}`,
    name,
    description: description || '',
    category: category || 'General',
    color: color || '#d97706',
    isArchived: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    userId,
  };

  projects.unshift(newProject);
  saveData();

  return res.status(201).json({
    ...newProject,
    taskCount: 0,
    completedTaskCount: 0,
  });
});

apiRouter.put('/projects/:id', (req: Request, res: Response) => {
  const userId = getUserIdFromReq(req);
  const { id } = req.params;
  const index = projects.findIndex((p) => p.id === id && p.userId === userId);
  if (index === -1) {
    return res.status(404).json({ message: 'Project not found' });
  }

  projects[index] = {
    ...projects[index],
    ...req.body,
    updatedAt: new Date().toISOString(),
  };

  saveData();
  return res.json(projects[index]);
});

apiRouter.patch('/projects/:id/archive', (req: Request, res: Response) => {
  const userId = getUserIdFromReq(req);
  const { id } = req.params;
  const project = projects.find((p) => p.id === id && p.userId === userId);
  if (!project) {
    return res.status(404).json({ message: 'Project not found' });
  }

  project.isArchived = !project.isArchived;
  project.updatedAt = new Date().toISOString();
  saveData();

  return res.json(project);
});

apiRouter.delete('/projects/:id', (req: Request, res: Response) => {
  const userId = getUserIdFromReq(req);
  const { id } = req.params;
  projects = projects.filter((p) => !(p.id === id && p.userId === userId));
  tasks = tasks.filter((t) => !(t.projectId === id && t.userId === userId));
  saveData();

  return res.json({ message: 'Project deleted successfully' });
});

// TASKS API
apiRouter.get('/tasks', (req: Request, res: Response) => {
  const userId = getUserIdFromReq(req);
  let result = tasks.filter((t) => t.userId === userId);

  const { status, priority, projectId, search, isOverdueOnly, isTodayOnly, sort } = req.query;

  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    result = result.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.tags?.some((tag) => tag.toLowerCase().includes(q))
    );
  }

  if (status && status !== 'ALL') {
    result = result.filter((t) => t.status === status);
  }

  if (priority && priority !== 'ALL') {
    result = result.filter((t) => t.priority === priority);
  }

  if (projectId && projectId !== 'ALL') {
    result = result.filter((t) => t.projectId === projectId);
  }

  const today = new Date().toISOString().split('T')[0];
  if (isOverdueOnly === 'true') {
    result = result.filter((t) => t.status !== 'COMPLETED' && t.deadline && t.deadline < today);
  }

  if (isTodayOnly === 'true') {
    result = result.filter((t) => t.deadline === today);
  }

  if (sort === 'priority_desc') {
    const priorityWeight: Record<string, number> = { HIGH: 3, MEDIUM: 2, LOW: 1 };
    result.sort((a, b) => priorityWeight[b.priority] - priorityWeight[a.priority]);
  } else if (sort === 'deadline_asc') {
    result.sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
  } else if (sort === 'createdAt_asc') {
    result.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  } else {
    result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  const enriched = result.map((t) => {
    const proj = projects.find((p) => p.id === t.projectId);
    return {
      ...t,
      projectName: proj ? proj.name : 'Unassigned',
      projectColor: proj ? proj.color : '#c9a84c',
    };
  });

  return res.json(enriched);
});

apiRouter.post('/tasks', (req: Request, res: Response) => {
  const userId = getUserIdFromReq(req);
  if (!userId) return res.status(401).json({ message: 'Unauthorized' });

  const { title, description, priority, status, deadline, projectId, subtasks, tags } = req.body;

  if (!title) {
    return res.status(400).json({ message: 'Task title is required' });
  }

  // Find assigned project or fallback to user's first project or auto-create General Workspace
  let targetProj = projects.find((p) => p.id === projectId && p.userId === userId);
  if (!targetProj) {
    targetProj = projects.find((p) => p.userId === userId);
  }
  if (!targetProj) {
    targetProj = {
      id: `proj-${Date.now()}`,
      name: 'General Workspace',
      description: 'Default project workspace for managing your tasks',
      category: 'General',
      color: '#d97706',
      isArchived: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      userId,
    };
    projects.unshift(targetProj);
  }

  const newTask: TaskRecord = {
    id: `tsk-${Date.now()}`,
    title,
    description: description || '',
    priority: priority || 'MEDIUM',
    status: status || 'TO_DO',
    deadline: deadline || new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    projectId: targetProj.id,
    userId,
    subtasks: subtasks || [],
    tags: tags || ['Task'],
  };

  tasks.unshift(newTask);
  saveData();

  return res.status(201).json({
    ...newTask,
    projectName: targetProj.name,
    projectColor: targetProj.color,
  });
});

apiRouter.put('/tasks/:id', (req: Request, res: Response) => {
  const userId = getUserIdFromReq(req);
  const { id } = req.params;
  const index = tasks.findIndex((t) => t.id === id && t.userId === userId);
  if (index === -1) {
    return res.status(404).json({ message: 'Task not found' });
  }

  tasks[index] = {
    ...tasks[index],
    ...req.body,
    updatedAt: new Date().toISOString(),
  };

  saveData();

  const proj = projects.find((p) => p.id === tasks[index].projectId);
  return res.json({
    ...tasks[index],
    projectName: proj ? proj.name : 'Unassigned',
    projectColor: proj ? proj.color : '#c9a84c',
  });
});

apiRouter.patch('/tasks/:id/status', (req: Request, res: Response) => {
  const userId = getUserIdFromReq(req);
  const { id } = req.params;
  const { status } = req.body;
  const task = tasks.find((t) => t.id === id && t.userId === userId);
  if (!task) {
    return res.status(404).json({ message: 'Task not found' });
  }

  task.status = status;
  task.updatedAt = new Date().toISOString();
  saveData();

  return res.json(task);
});

apiRouter.delete('/tasks/:id', (req: Request, res: Response) => {
  const userId = getUserIdFromReq(req);
  const { id } = req.params;
  tasks = tasks.filter((t) => !(t.id === id && t.userId === userId));
  saveData();

  return res.json({ message: 'Task deleted successfully' });
});

// USER PROFILE API
apiRouter.put('/users/profile', (req: Request, res: Response) => {
  const userId = getUserIdFromReq(req);
  if (!userId) return res.status(401).json({ message: 'Unauthorized' });

  const user = users.find((u) => u.id === userId);
  if (!user) return res.status(404).json({ message: 'User not found' });

  const { name, bio, jobTitle, avatar } = req.body;
  if (name) user.name = name;
  if (bio) user.bio = bio;
  if (jobTitle) user.jobTitle = jobTitle;
  if (avatar) user.avatar = avatar;

  saveData();
  return res.json(user);
});

// GEMINI AI INTEGRATION API
apiRouter.post('/ai/breakdown', async (req: Request, res: Response) => {
  const { taskTitle, taskDescription } = req.body;

  if (!taskTitle) {
    return res.status(400).json({ message: 'Task title is required for AI breakdown' });
  }

  if (!ai) {
    return res.json({
      summary: `Smart summary for: ${taskTitle}. High technical impact project phase.`,
      prioritySuggestion: 'HIGH',
      estimatedHours: 4,
      suggestedSubtasks: [
        `Design architectural specification for ${taskTitle}`,
        `Implement unit and integration tests`,
        `Code review and documentation update`,
      ],
      productivityTips: [
        'Break task down into 25-minute Pomodoro sessions',
        'Ensure all prerequisites are completed before starting core development',
      ],
    });
  }

  try {
    const prompt = `Analyze this task and break it down into actionable subtasks and productivity insights:
Title: "${taskTitle}"
Description: "${taskDescription || 'No description provided'}"`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction:
          'You are an expert Agile Scrum Master and Senior Software Engineer. Analyze tasks and generate structured subtasks, priority recommendations, and time estimates in clean JSON format.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING, description: '1-2 sentence executive summary of the task' },
            prioritySuggestion: { type: Type.STRING, description: 'HIGH, MEDIUM, or LOW' },
            estimatedHours: { type: Type.NUMBER, description: 'Estimated hours to complete' },
            suggestedSubtasks: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'List of 3 to 5 clear, concrete subtasks',
            },
            productivityTips: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: '2 short actionable advice tips',
            },
          },
          required: ['summary', 'prioritySuggestion', 'estimatedHours', 'suggestedSubtasks', 'productivityTips'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (error: any) {
    console.error('Gemini AI breakdown error:', error);
    return res.status(500).json({ message: 'AI Breakdown service error', error: error.message });
  }
});

apiRouter.post('/ai/daily-plan', async (req: Request, res: Response) => {
  const userId = getUserIdFromReq(req);
  const activeTasks = tasks.filter((t) => t.userId === userId && t.status !== 'COMPLETED');

  if (!ai) {
    return res.json({
      planSummary: 'Focus on High Priority deadlines today. Start with core backend security before UI styling.',
      focusTasks: activeTasks.slice(0, 3).map((t) => t.title),
      recommendedOrder: [
        '1. High priority items with nearest deadlines',
        '2. Quick wins (tasks under 30 mins)',
        '3. Code refactoring & documentation',
      ],
      timeAllocation: '40% Core Coding, 30% Testing, 20% Review, 10% Breaks',
    });
  }

  try {
    const taskSummary = activeTasks
      .map((t) => `- ${t.title} [Priority: ${t.priority}, Deadline: ${t.deadline}]`)
      .join('\n');

    const prompt = `Here are my currently open tasks:\n${taskSummary}\nGenerate a personalized daily schedule and prioritization strategy for maximum focus.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction:
          'You are an executive productivity coach. Provide clear, motivating, daily task prioritization plans.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            planSummary: { type: Type.STRING },
            focusTasks: { type: Type.ARRAY, items: { type: Type.STRING } },
            recommendedOrder: { type: Type.ARRAY, items: { type: Type.STRING } },
            timeAllocation: { type: Type.STRING },
          },
          required: ['planSummary', 'focusTasks', 'recommendedOrder', 'timeAllocation'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (err: any) {
    return res.status(500).json({ message: 'AI Plan error', error: err.message });
  }
});

// Normalize request URLs for Vercel or proxies if /api prefix was stripped
app.use((req: Request, res: Response, next) => {
  if (
    !req.url.startsWith('/api') &&
    (req.url.startsWith('/auth') ||
      req.url.startsWith('/ai') ||
      req.url.startsWith('/dashboard') ||
      req.headers['content-type'] === 'application/json' ||
      req.headers['accept']?.includes('application/json'))
  ) {
    req.url = '/api' + req.url;
  }
  next();
});

app.use('/api', apiRouter);

// VITE DEV / PRODUCTION MIDDLEWARE
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`FlowDesk Server running on http://localhost:${PORT}`);
  });
}

if (!process.env.VERCEL) {
  startServer();
}

export default app;
