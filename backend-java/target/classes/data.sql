-- FlowDesk Seed Data
INSERT IGNORE INTO roles(id, name) VALUES(1, 'ROLE_USER');
INSERT IGNORE INTO roles(id, name) VALUES(2, 'ROLE_ADMIN');

INSERT IGNORE INTO users(id, name, email, password_hash, avatar_url, bio, job_title) 
VALUES(
  'usr-1', 
  'demo user', 
  'alex.morgan@flowdesk.io', 
  '$2a$10$e8R60fK1gC5M1q1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z', 
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'Senior Full Stack Developer & Productivity Enthusiast.',
  'Lead Software Architect'
);

INSERT IGNORE INTO user_roles(user_id, role_id) VALUES('usr-1', 1);
INSERT IGNORE INTO user_roles(user_id, role_id) VALUES('usr-1', 2);

INSERT IGNORE INTO projects(id, name, description, category, color, is_archived, user_id)
VALUES
('proj-101', 'Spring Boot Microservices', 'Refactoring core services into containerized Java 21 REST services with Spring Security JWT.', 'Backend Architecture', '#3b82f6', FALSE, 'usr-1'),
('proj-102', 'FlowDesk UI Modernization', 'Designing responsive React & Tailwind components with dark/light theme support.', 'Frontend Engineering', '#10b981', FALSE, 'usr-1'),
('proj-103', 'Q3 DevOps & CI/CD Pipeline', 'Setting up Docker multi-stage builds and automated GitHub Actions deployment pipelines.', 'DevOps & Infra', '#8b5cf6', FALSE, 'usr-1');

INSERT IGNORE INTO tasks(id, title, description, priority, status, deadline, project_id, user_id)
VALUES
('tsk-1001', 'Implement JWT Token Provider in Spring Security', 'Create JwtUtils service class to parse, validate claims, and generate signing keys with JJWT.', 'HIGH', 'IN_PROGRESS', CURRENT_DATE, 'proj-101', 'usr-1'),
('tsk-1002', 'Design MySQL Database Schema & JPA Entities', 'Establish normalized ER diagram with @OneToMany and @ManyToOne mapped relationships for User, Project, Task.', 'HIGH', 'COMPLETED', DATE_SUB(CURRENT_DATE, INTERVAL 1 DAY), 'proj-101', 'usr-1'),
('tsk-1003', 'Build Interactive Dashboard Analytics Widgets', 'Integrate Recharts donut and bar charts showing task breakdown by status and priority.', 'MEDIUM', 'IN_PROGRESS', DATE_ADD(CURRENT_DATE, INTERVAL 3 DAY), 'proj-102', 'usr-1'),
('tsk-1004', 'Fix Docker Multi-stage Build Maven Caching Issue', 'Ensure pom.xml dependencies layer is cached before compiling Java source code in Dockerfile.', 'HIGH', 'TO_DO', DATE_SUB(CURRENT_DATE, INTERVAL 1 DAY), 'proj-103', 'usr-1');
