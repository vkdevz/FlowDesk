import express, { Request, Response } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

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

// Initial Mock Data Store (In-Memory Database simulation mirroring Spring Boot JPA schema)
let users = [
  {
    id: 'usr-1',
    name: 'Alex Morgan',
    email: 'alex.morgan@flowdesk.io',
    passwordHash: '$2a$10$e8R60fK1gC5M1q1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z', // Simulated BCrypt
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    roles: ['ROLE_USER', 'ROLE_ADMIN'],
    bio: 'Senior Full Stack Developer & Productivity Enthusiast.',
    jobTitle: 'Lead Software Architect',
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
  },
];

let projects = [
  {
    id: 'proj-101',
    name: 'Spring Boot Microservices',
    description: 'Refactoring core services into containerized Java 21 REST services with Spring Security JWT.',
    category: 'Backend Architecture',
    color: '#3b82f6', // blue
    isArchived: false,
    createdAt: new Date(Date.now() - 14 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    userId: 'usr-1',
  },
  {
    id: 'proj-102',
    name: 'FlowDesk UI Modernization',
    description: 'Designing responsive React & Tailwind components with dark/light theme support.',
    category: 'Frontend Engineering',
    color: '#10b981', // emerald
    isArchived: false,
    createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    userId: 'usr-1',
  },
  {
    id: 'proj-103',
    name: 'Q3 DevOps & CI/CD Pipeline',
    description: 'Setting up Docker multi-stage builds and automated GitHub Actions deployment pipelines.',
    category: 'DevOps & Infra',
    color: '#8b5cf6', // purple
    isArchived: false,
    createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    userId: 'usr-1',
  },
];

const todayStr = new Date().toISOString().split('T')[0];
const yesterdayStr = new Date(Date.now() - 86400000).toISOString().split('T')[0];
const in3DaysStr = new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0];
const in7DaysStr = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];

let tasks = [
  {
    id: 'tsk-1001',
    title: 'Implement JWT Token Provider in Spring Security',
    description: 'Create JwtUtils service class to parse, validate claims, and generate signing keys with JJWT.',
    priority: 'HIGH',
    status: 'IN_PROGRESS',
    deadline: todayStr,
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    projectId: 'proj-101',
    userId: 'usr-1',
    subtasks: [
      { id: 'sub-1', title: 'Configure secret key in application.yml', completed: true },
      { id: 'sub-2', title: 'Implement generateTokenFromUsername()', completed: true },
      { id: 'sub-3', title: 'Add validateJwtToken() exception handlers', completed: false },
    ],
    tags: ['Security', 'Spring Boot', 'JWT'],
  },
  {
    id: 'tsk-1002',
    title: 'Design MySQL Database Schema & JPA Entities',
    description: 'Establish normalized ER diagram with @OneToMany and @ManyToOne mapped relationships for User, Project, Task.',
    priority: 'HIGH',
    status: 'COMPLETED',
    deadline: yesterdayStr,
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    projectId: 'proj-101',
    userId: 'usr-1',
    subtasks: [
      { id: 'sub-4', title: 'Write DDL schema.sql script', completed: true },
      { id: 'sub-5', title: 'Configure Hibernate Dialect & DDl-auto', completed: true },
    ],
    tags: ['Database', 'MySQL', 'JPA'],
  },
  {
    id: 'tsk-1003',
    title: 'Build Interactive Dashboard Analytics Widgets',
    description: 'Integrate Recharts donut and bar charts showing task breakdown by status and priority.',
    priority: 'MEDIUM',
    status: 'IN_PROGRESS',
    deadline: in3DaysStr,
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 12 * 3600000).toISOString(),
    projectId: 'proj-102',
    userId: 'usr-1',
    subtasks: [
      { id: 'sub-6', title: 'Add responsive StatCards with icons', completed: true },
      { id: 'sub-7', title: 'Connect real-time task filters to charts', completed: false },
    ],
    tags: ['React', 'Charts', 'UI'],
  },
  {
    id: 'tsk-1004',
    title: 'Fix Docker Multi-stage Build Maven Caching Issue',
    description: 'Ensure pom.xml dependencies layer is cached before compiling Java source code in Dockerfile.',
    priority: 'HIGH',
    status: 'TO_DO',
    deadline: yesterdayStr, // Overdue task demo!
    createdAt: new Date(Date.now() - 6 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 4 * 86400000).toISOString(),
    projectId: 'proj-103',
    userId: 'usr-1',
    subtasks: [
      { id: 'sub-8', title: 'Update Dockerfile COPY pom.xml step', completed: false },
      { id: 'sub-9', title: 'Test docker-compose up locally', completed: false },
    ],
    tags: ['Docker', 'DevOps'],
  },
  {
    id: 'tsk-1005',
    title: 'Write Unit Tests for TaskServiceImpl using Mockito',
    description: 'Verify method invocations for createTask, updateTask, and throw ResourceNotFoundException on missing ID.',
    priority: 'MEDIUM',
    status: 'TO_DO',
    deadline: in7DaysStr,
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    projectId: 'proj-101',
    userId: 'usr-1',
    subtasks: [
      { id: 'sub-10', title: 'Annotate test with @ExtendWith(MockitoExtension.class)', completed: false },
      { id: 'sub-11', title: 'Mock TaskRepository and ProjectRepository', completed: false },
    ],
    tags: ['Testing', 'JUnit5', 'Mockito'],
  },
  {
    id: 'tsk-1006',
    title: 'Setup Global Exception Handler with @ControllerAdvice',
    description: 'Handle MethodArgumentNotValidException, ResourceNotFoundException, and AccessDeniedException with clean JSON response.',
    priority: 'LOW',
    status: 'COMPLETED',
    deadline: todayStr,
    createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 3600000).toISOString(),
    projectId: 'proj-101',
    userId: 'usr-1',
    subtasks: [
      { id: 'sub-12', title: 'Define CustomErrorDetails DTO', completed: true },
      { id: 'sub-13', title: 'Return HTTP 400, 404, 500 status codes correctly', completed: true },
    ],
    tags: ['Backend', 'Spring Boot'],
  },
];

// Helper functions
const generateJWT = (userId: string, email: string) => {
  return `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI${Buffer.from(
    JSON.stringify({ userId, email, exp: Date.now() + 86400000 })
  ).toString('base64')}.FlowDeskSignatureKey2026`;
};

// ==================== REST API ROUTES ==================== //

// AUTH API
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  const user = users.find((u) => u.email.toLowerCase() === email?.toLowerCase());

  if (!user) {
    return res.status(401).json({
      status: 401,
      error: 'Unauthorized',
      message: 'Invalid email or password credentials',
      timestamp: new Date().toISOString(),
    });
  }

  // Generate JWT token
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

app.post('/api/auth/register', (req: Request, res: Response) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({
      status: 400,
      error: 'Bad Request',
      message: 'Validation failed: Name, email, and password are required',
      timestamp: new Date().toISOString(),
    });
  }

  const existing = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.status(400).json({
      status: 400,
      error: 'Bad Request',
      message: 'User with this email already exists',
      timestamp: new Date().toISOString(),
    });
  }

  const newUser = {
    id: `usr-${Date.now()}`,
    name,
    email,
    passwordHash: `$2a$10$${Date.now()}`,
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
    roles: ['ROLE_USER'],
    bio: 'Productivity engineer & FlowDesk user.',
    jobTitle: 'Software Engineer',
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);

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

app.get('/api/auth/me', (req: Request, res: Response) => {
  const user = users[0]; // Active user
  return res.json(user);
});

app.post('/api/auth/change-password', (req: Request, res: Response) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: 'Current and new password are required' });
  }
  return res.json({ message: 'Password updated successfully' });
});

// DASHBOARD METRICS API
app.get('/api/dashboard/stats', (req: Request, res: Response) => {
  const totalProjects = projects.filter((p) => !p.isArchived).length;
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === 'COMPLETED').length;
  const pendingTasks = tasks.filter((t) => t.status !== 'COMPLETED').length;
  
  const today = new Date().toISOString().split('T')[0];
  const overdueTasks = tasks.filter(
    (t) => t.status !== 'COMPLETED' && t.deadline && t.deadline < today
  ).length;

  const todayTasks = tasks.filter((t) => t.deadline === today).length;

  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const priorityBreakdown = {
    LOW: tasks.filter((t) => t.priority === 'LOW').length,
    MEDIUM: tasks.filter((t) => t.priority === 'MEDIUM').length,
    HIGH: tasks.filter((t) => t.priority === 'HIGH').length,
  };

  const statusBreakdown = {
    TO_DO: tasks.filter((t) => t.status === 'TO_DO').length,
    IN_PROGRESS: tasks.filter((t) => t.status === 'IN_PROGRESS').length,
    COMPLETED: tasks.filter((t) => t.status === 'COMPLETED').length,
  };

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const weeklyActivity = days.map((day, i) => ({
    day,
    completed: Math.floor(Math.random() * 5) + 1,
    created: Math.floor(Math.random() * 6) + 1,
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
app.get('/api/projects', (req: Request, res: Response) => {
  const showArchived = req.query.archived === 'true';
  const filtered = projects
    .filter((p) => (showArchived ? true : !p.isArchived))
    .map((p) => {
      const projTasks = tasks.filter((t) => t.projectId === p.id);
      const completed = projTasks.filter((t) => t.status === 'COMPLETED').length;
      return {
        ...p,
        taskCount: projTasks.length,
        completedTaskCount: completed,
      };
    });
  return res.json(filtered);
});

app.post('/api/projects', (req: Request, res: Response) => {
  const { name, description, category, color } = req.body;
  if (!name) {
    return res.status(400).json({ message: 'Project name is required' });
  }

  const newProject = {
    id: `proj-${Date.now()}`,
    name,
    description: description || '',
    category: category || 'General',
    color: color || '#3b82f6',
    isArchived: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    userId: 'usr-1',
    taskCount: 0,
    completedTaskCount: 0,
  };

  projects.unshift(newProject);
  return res.status(201).json(newProject);
});

app.put('/api/projects/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const index = projects.findIndex((p) => p.id === id);
  if (index === -1) {
    return res.status(404).json({ message: 'Project not found' });
  }

  projects[index] = {
    ...projects[index],
    ...req.body,
    updatedAt: new Date().toISOString(),
  };

  return res.json(projects[index]);
});

app.patch('/api/projects/:id/archive', (req: Request, res: Response) => {
  const { id } = req.params;
  const project = projects.find((p) => p.id === id);
  if (!project) {
    return res.status(404).json({ message: 'Project not found' });
  }

  project.isArchived = !project.isArchived;
  project.updatedAt = new Date().toISOString();
  return res.json(project);
});

app.delete('/api/projects/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  projects = projects.filter((p) => p.id !== id);
  tasks = tasks.filter((t) => t.projectId !== id); // Cascade delete tasks
  return res.json({ message: 'Project deleted successfully' });
});

// TASKS API
app.get('/api/tasks', (req: Request, res: Response) => {
  let result = [...tasks];

  const { status, priority, projectId, search, isOverdueOnly, isTodayOnly, sort } = req.query;

  // Search filter
  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    result = result.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.tags?.some((tag) => tag.toLowerCase().includes(q))
    );
  }

  // Status filter
  if (status && status !== 'ALL') {
    result = result.filter((t) => t.status === status);
  }

  // Priority filter
  if (priority && priority !== 'ALL') {
    result = result.filter((t) => t.priority === priority);
  }

  // Project filter
  if (projectId && projectId !== 'ALL') {
    result = result.filter((t) => t.projectId === projectId);
  }

  // Overdue filter
  const today = new Date().toISOString().split('T')[0];
  if (isOverdueOnly === 'true') {
    result = result.filter((t) => t.status !== 'COMPLETED' && t.deadline && t.deadline < today);
  }

  // Today filter
  if (isTodayOnly === 'true') {
    result = result.filter((t) => t.deadline === today);
  }

  // Sorting logic
  if (sort === 'priority_desc') {
    const priorityWeight: Record<string, number> = { HIGH: 3, MEDIUM: 2, LOW: 1 };
    result.sort((a, b) => priorityWeight[b.priority] - priorityWeight[a.priority]);
  } else if (sort === 'deadline_asc') {
    result.sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
  } else if (sort === 'createdAt_asc') {
    result.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  } else {
    // default: createdAt_desc
    result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  // Enrich with project details
  const enriched = result.map((t) => {
    const proj = projects.find((p) => p.id === t.projectId);
    return {
      ...t,
      projectName: proj ? proj.name : 'Unassigned',
      projectColor: proj ? proj.color : '#6b7280',
    };
  });

  return res.json(enriched);
});

app.post('/api/tasks', (req: Request, res: Response) => {
  const { title, description, priority, status, deadline, projectId, subtasks, tags } = req.body;

  if (!title) {
    return res.status(400).json({ message: 'Task title is required' });
  }

  const newTask = {
    id: `tsk-${Date.now()}`,
    title,
    description: description || '',
    priority: priority || 'MEDIUM',
    status: status || 'TO_DO',
    deadline: deadline || new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    projectId: projectId || projects[0]?.id || 'proj-101',
    userId: 'usr-1',
    subtasks: subtasks || [],
    tags: tags || ['Task'],
  };

  tasks.unshift(newTask);

  const proj = projects.find((p) => p.id === newTask.projectId);
  return res.status(201).json({
    ...newTask,
    projectName: proj ? proj.name : 'Unassigned',
    projectColor: proj ? proj.color : '#6b7280',
  });
});

app.put('/api/tasks/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const index = tasks.findIndex((t) => t.id === id);
  if (index === -1) {
    return res.status(404).json({ message: 'Task not found' });
  }

  tasks[index] = {
    ...tasks[index],
    ...req.body,
    updatedAt: new Date().toISOString(),
  };

  const proj = projects.find((p) => p.id === tasks[index].projectId);
  return res.json({
    ...tasks[index],
    projectName: proj ? proj.name : 'Unassigned',
    projectColor: proj ? proj.color : '#6b7280',
  });
});

app.patch('/api/tasks/:id/status', (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;
  const task = tasks.find((t) => t.id === id);
  if (!task) {
    return res.status(404).json({ message: 'Task not found' });
  }

  task.status = status;
  task.updatedAt = new Date().toISOString();
  return res.json(task);
});

app.delete('/api/tasks/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  tasks = tasks.filter((t) => t.id !== id);
  return res.json({ message: 'Task deleted successfully' });
});

// USER PROFILE API
app.put('/api/users/profile', (req: Request, res: Response) => {
  const { name, bio, jobTitle, avatar } = req.body;
  users[0] = {
    ...users[0],
    name: name || users[0].name,
    bio: bio || users[0].bio,
    jobTitle: jobTitle || users[0].jobTitle,
    avatar: avatar || users[0].avatar,
  };
  return res.json(users[0]);
});

// GEMINI AI INTEGRATION API
app.post('/api/ai/breakdown', async (req: Request, res: Response) => {
  const { taskTitle, taskDescription } = req.body;

  if (!taskTitle) {
    return res.status(400).json({ message: 'Task title is required for AI breakdown' });
  }

  if (!ai) {
    // Fallback if API key is not yet set
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
      model: 'gemini-3.6-flash',
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

app.post('/api/ai/daily-plan', async (req: Request, res: Response) => {
  const activeTasks = tasks.filter((t) => t.status !== 'COMPLETED');

  if (!ai) {
    return res.json({
      planSummary: 'Focus on High Priority deadlines today. Start with backend security before frontend styling.',
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
      model: 'gemini-3.6-flash',
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

startServer();
