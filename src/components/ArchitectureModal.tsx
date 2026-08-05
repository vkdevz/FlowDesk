import React, { useState } from 'react';
import { ShieldCheck, Database, Cpu, Layers, Server, Code, X, Check, BookOpen } from 'lucide-react';

interface ArchitectureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ArchitectureModal: React.FC<ArchitectureModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'architecture' | 'erd' | 'interview'>('architecture');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-5xl h-[88vh] flex flex-col shadow-2xl text-slate-100 overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg border border-indigo-500/20">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
                FlowDesk System Architecture & Interview Showcase
                <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-mono">
                  Java 21 • Spring Boot 3
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Production-grade Java Full Stack architectural decisions, ERD mappings, and security design.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 px-6">
          <button
            onClick={() => setActiveTab('architecture')}
            className={`px-4 py-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'architecture'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-4 h-4" /> Layered Architecture & Security
          </button>
          <button
            onClick={() => setActiveTab('erd')}
            className={`px-4 py-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'erd'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Database className="w-4 h-4" /> MySQL ERD & JPA Entity Mapping
          </button>
          <button
            onClick={() => setActiveTab('interview')}
            className={`px-4 py-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'interview'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-4 h-4" /> Interview Defense & Tradeoffs
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === 'architecture' && (
            <div className="space-y-6 text-xs">
              {/* Architecture diagram cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-2">
                  <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm">
                    <Code className="w-4 h-4" /> Presentation Layer
                  </div>
                  <p className="text-slate-400">
                    React 18 SPA with Vite, Axios interceptors for JWT, Recharts analytics dashboard, and Tailwind CSS.
                  </p>
                  <ul className="text-slate-300 space-y-1 list-disc list-inside pt-1">
                    <li>Strict TypeScript Types</li>
                    <li>Axios Token Interceptors</li>
                    <li>Client-Side State via Context API</li>
                  </ul>
                </div>

                <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                    <Cpu className="w-4 h-4" /> Spring Boot Core
                  </div>
                  <p className="text-slate-400">
                    Layered Controller → Service → Repository with Constructor Injection & SOLID principles.
                  </p>
                  <ul className="text-slate-300 space-y-1 list-disc list-inside pt-1">
                    <li>Spring Security + JJWT 0.12</li>
                    <li>@ControllerAdvice Exception Handling</li>
                    <li>DTO Request/Response Mapping</li>
                  </ul>
                </div>

                <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-2">
                  <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                    <Database className="w-4 h-4" /> Persistence Layer
                  </div>
                  <p className="text-slate-400">
                    MySQL 8.0 with Spring Data JPA, Hibernate, Cascade Types, and Foreign Key constraints.
                  </p>
                  <ul className="text-slate-300 space-y-1 list-disc list-inside pt-1">
                    <li>Normalized DB Schema</li>
                    <li>Lazy Loading Associations</li>
                    <li>JpaSpecificationExecutor Querying</li>
                  </ul>
                </div>
              </div>

              {/* Security Details */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-5 space-y-3">
                <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Spring Security & JWT Authentication Flow
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-slate-300">
                  <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-lg space-y-1">
                    <div className="font-semibold text-indigo-300">1. Stateless JWT Filter Chain</div>
                    <p className="text-slate-400">
                      Every incoming request passes through <code className="text-amber-300">JwtAuthenticationFilter</code>. It parses the Bearer token, validates key signature using HS256 HMAC, and builds the Spring <code className="text-amber-300">AuthenticationToken</code> in context.
                    </p>
                  </div>
                  <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-lg space-y-1">
                    <div className="font-semibold text-indigo-300">2. BCrypt Password Hashing</div>
                    <p className="text-slate-400">
                      Passwords are salt-hashed using <code className="text-amber-300">BCryptPasswordEncoder(10)</code>. Raw passwords never touch memory or database storage.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'erd' && (
            <div className="space-y-5 text-xs">
              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-3">
                <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
                  <Database className="w-4 h-4 text-indigo-400" /> Relational Database Mapping (MySQL 8.0)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-900 border border-slate-800 p-3 rounded-lg space-y-2">
                    <div className="font-bold text-indigo-300 border-b border-slate-800 pb-1">
                      USER ➔ PROJECT (1 : N)
                    </div>
                    <p className="text-slate-400">
                      One user owns many projects. CascadeType.ALL ensures orphan project deletion when account is removed.
                    </p>
                    <div className="bg-slate-950 p-2 rounded text-[11px] font-mono text-emerald-400">
                      @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
                      <br />
                      private Set&lt;Project&gt; projects;
                    </div>
                  </div>

                  <div className="bg-slate-900 border border-slate-800 p-3 rounded-lg space-y-2">
                    <div className="font-bold text-emerald-300 border-b border-slate-800 pb-1">
                      PROJECT ➔ TASK (1 : N)
                    </div>
                    <p className="text-slate-400">
                      Projects group multiple tasks. Each task maintains foreign keys to project_id and user_id.
                    </p>
                    <div className="bg-slate-950 p-2 rounded text-[11px] font-mono text-emerald-400">
                      @OneToMany(mappedBy = "project", cascade = CascadeType.ALL)
                      <br />
                      private List&lt;Task&gt; tasks;
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'interview' && (
            <div className="space-y-4 text-xs">
              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-3">
                <h3 className="font-bold text-sm text-slate-100">
                  Key Technical Questions & How FlowDesk Answers Them
                </h3>

                <div className="space-y-3">
                  <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 space-y-1">
                    <div className="font-semibold text-amber-300">
                      Q: Why did you use Constructor Injection instead of Field Injection (@Autowired)?
                    </div>
                    <p className="text-slate-300">
                      Constructor injection makes dependencies explicit, enforces immutability via <code className="text-indigo-300">final</code> fields, and prevents Circular Dependencies at startup. It also enables easy unit testing with Mockito without starting Spring ApplicationContext!
                    </p>
                  </div>

                  <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 space-y-1">
                    <div className="font-semibold text-amber-300">
                      Q: How do you prevent N+1 Select queries in Hibernate?
                    </div>
                    <p className="text-slate-300">
                      By configuring <code className="text-indigo-300">FetchType.LAZY</code> on <code className="text-indigo-300">@ManyToOne</code> relationships, and using JPQL JOIN FETCH or DTO projections in Repository query methods when full details are required in a single SQL query.
                    </p>
                  </div>

                  <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 space-y-1">
                    <div className="font-semibold text-amber-300">
                      Q: How is Global Exception Handling structured?
                    </div>
                    <p className="text-slate-300">
                      Using <code className="text-indigo-300">@ControllerAdvice</code> class <code className="text-indigo-300">GlobalExceptionHandler</code>. It catches <code className="text-indigo-300">MethodArgumentNotValidException</code> for Spring Validation errors and returns standard JSON payload with status codes (400, 404, 403, 500).
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>Interview Ready Full Stack Architecture</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium transition-colors"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
