# FlowDesk - Smart Task & Productivity Management System

FlowDesk is a full-stack enterprise-grade task and productivity management system built with **Java 21**, **Spring Boot 3**, **Spring Security (JWT)**, **MySQL / JPA ORM**, **React 18**, **Tailwind CSS**, **Recharts**, and **Gemini AI**.

---

## 🚀 Key Features

- **🔐 Spring Security & Stateless JWT Authentication**: Secure login/registration with BCrypt password hashing, role-based access control (`ROLE_ADMIN`, `ROLE_USER`), and automated JWT token management.
- **📁 Project Workspaces**: Organize tasks into project entities with custom category tags, color themes, archival capabilities, and real-time completion progress tracking.
- **📋 Task & Kanban Management**:
  - Dual view modes: Interactive Data Table and Kanban Board layout.
  - Advanced filtering by Search, Status, Priority, Project, Overdue status, and Due Today.
  - Subtask checklists with progress counters.
- **📊 Real-time Productivity Analytics**: Recharts visual dashboard including Task Status Breakdown, Priority Distribution, and 7-day Task Velocity charts.
- **✨ Gemini AI Productivity Assistant**:
  - **AI Task Breakdown**: Automatically generates subtasks, summaries, and priority recommendations from a task title.
  - **AI Daily Planner**: Evaluates open tasks, deadlines, and priorities to construct an optimal daily execution schedule.
- **🛠 REST API Inspector & Architecture Diagram**: Built-in modal tools to inspect live Spring Boot REST endpoints, Request/Response payloads, cURL commands, and layered architectural blueprints.

---

## 🛠 Tech Stack

### Backend Architecture (Conceptual Blueprint)
- **Language**: Java 21
- **Framework**: Spring Boot 3.2.x
- **Security**: Spring Security 6, Stateless JWT Filter, BCrypt Password Encoder
- **Persistence**: Spring Data JPA, Hibernate ORM, MySQL 8.0 Database Schema
- **REST APIs**: `@RestController` mapping with DTO Pattern, Request Validation (`@Valid`), and `@ControllerAdvice` Global Exception Handling.

### Frontend
- **Framework**: React 18 with TypeScript & Vite
- **Styling**: Tailwind CSS
- **Data Visualization**: Recharts
- **Icons**: Lucide React
- **HTTP Client**: Axios with JWT Authorization Interceptors

---

## 📂 Project Structure

```
.
├── server.ts                    # Express + Vite SSR entry point & mock Spring Boot REST simulation
├── src/
│   ├── components/
│   │   ├── layout/             # Navbar, Sidebar
│   │   ├── AiPlannerModal.tsx  # Gemini AI Daily Scheduler
│   │   ├── ApiInspectorModal.tsx # Spring Boot REST Inspector
│   │   └── ArchitectureModal.tsx # System Architecture Visualizer
│   ├── context/
│   │   └── AuthContext.tsx     # JWT Auth Context & State
│   ├── pages/
│   │   ├── AuthPage.tsx        # Sign In / Registration
│   │   ├── DashboardPage.tsx   # Productivity Metrics & Charts
│   │   ├── ProjectsPage.tsx    # Project Workspaces & Management
│   │   ├── TasksPage.tsx       # Table & Kanban Task View
│   │   └── ProfilePage.tsx     # User Profile & Security Settings
│   ├── services/
│   │   └── api.ts              # Axios Client & Authorization Headers
│   ├── types.ts                # TypeScript interfaces & DTO schemas
│   ├── App.tsx                 # Main Application Container
│   └── main.tsx                # React DOM Render Entry
├── .env.example                # Environment Variable declarations
├── metadata.json               # Platform configuration metadata
├── package.json                # Node & Vite dependencies
└── README.md                   # Project Documentation
```

---

## ⚡ Quick Start & Development

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Run Development Server**:
   ```bash
   npm run dev
   ```
   The application starts on `http://localhost:3000`.

3. **Build for Production**:
   ```bash
   npm run build
   ```

4. **Start Production Build**:
   ```bash
   npm run start
   ```

---

## 🔑 Demo Credentials

To test the application out of the box, use the pre-configured credentials on the login screen or click **Auto-fill**:

- **Email**: `alex.morgan@flowdesk.io`
- **Password**: `password123`
- **Roles**: `ROLE_ADMIN`, `ROLE_USER`

---

## 📄 License

MIT License. Built with ❤️ for developers building full-stack Java Spring Boot and React applications.
