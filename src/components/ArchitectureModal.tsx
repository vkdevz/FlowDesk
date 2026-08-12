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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 font-sans">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-5xl h-[88vh] flex flex-col shadow-xl text-slate-900 overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg border border-indigo-200">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-card-title font-jakarta font-semibold text-slate-900 flex items-center gap-2">
                FlowDesk System Architecture & Security
                <span className="text-data font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 font-mono">
                  Java 21 • Spring Boot 3
                </span>
              </h2>
              <p className="text-caption text-slate-500">
                Production-grade Java Full Stack architectural decisions, ERD mappings, and security design.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6">
          <button
            onClick={() => setActiveTab('architecture')}
            className={`px-4 py-3 text-label font-semibold flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'architecture'
                ? 'border-indigo-600 text-indigo-600 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Layers className="w-4 h-4 text-indigo-600" /> Layered Architecture & Security
          </button>
          <button
            onClick={() => setActiveTab('erd')}
            className={`px-4 py-3 text-label font-semibold flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'erd'
                ? 'border-indigo-600 text-indigo-600 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Database className="w-4 h-4 text-indigo-600" /> MySQL ERD & JPA Entity Mapping
          </button>
          <button
            onClick={() => setActiveTab('interview')}
            className={`px-4 py-3 text-label font-semibold flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'interview'
                ? 'border-indigo-600 text-indigo-600 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <BookOpen className="w-4 h-4 text-indigo-600" /> Interview Defense & Tradeoffs
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-white">
          {activeTab === 'architecture' && (
            <div className="space-y-6 text-body">
              {/* Architecture diagram cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
                  <div className="flex items-center gap-2 text-indigo-700 font-semibold text-card-title font-jakarta">
                    <Code className="w-4 h-4 text-indigo-600" /> Presentation Layer
                  </div>
                  <p className="text-slate-600 text-body leading-relaxed">
                    React 19 SPA with Vite, Axios interceptors for JWT, Recharts analytics dashboard, and Tailwind CSS.
                  </p>
                  <ul className="text-slate-700 space-y-1 list-disc list-inside pt-1 font-mono text-data">
                    <li>Strict TypeScript Types</li>
                    <li>Axios Token Interceptors</li>
                    <li>Client-Side Auth Guard Context</li>
                  </ul>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
                  <div className="flex items-center gap-2 text-indigo-700 font-semibold text-card-title font-jakarta">
                    <Cpu className="w-4 h-4 text-indigo-600" /> Spring Boot Core
                  </div>
                  <p className="text-slate-600 text-body leading-relaxed">
                    Layered Controller → Service → Repository with Constructor Injection & SOLID principles.
                  </p>
                  <ul className="text-slate-700 space-y-1 list-disc list-inside pt-1 font-mono text-data">
                    <li>Spring Security + JJWT 0.12</li>
                    <li>@ControllerAdvice Exception Handling</li>
                    <li>DTO Request/Response Mapping</li>
                  </ul>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
                  <div className="flex items-center gap-2 text-indigo-700 font-semibold text-card-title font-jakarta">
                    <Database className="w-4 h-4 text-indigo-600" /> Persistence Layer
                  </div>
                  <p className="text-slate-600 text-body leading-relaxed">
                    MySQL 8.0 with Spring Data JPA, Hibernate, Cascade Types, and Foreign Key constraints.
                  </p>
                  <ul className="text-slate-700 space-y-1 list-disc list-inside pt-1 font-mono text-data">
                    <li>Normalized DB Schema</li>
                    <li>Lazy Loading Associations</li>
                    <li>Per-Account Data Partitioning</li>
                  </ul>
                </div>
              </div>

              {/* Security Details */}
              <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-5 space-y-3">
                <h3 className="text-card-title font-jakarta font-semibold text-indigo-900 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-indigo-600" />
                  Spring Security & JWT Authentication Flow
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-slate-700">
                  <div className="bg-white border border-indigo-200 p-3.5 rounded-lg space-y-1">
                    <div className="font-semibold text-indigo-700 font-jakarta text-label">1. Stateless JWT Filter Chain</div>
                    <p className="text-slate-600 text-body leading-relaxed">
                      Every incoming request passes through <code className="text-indigo-600 font-mono text-data font-semibold">JwtAuthenticationFilter</code>. It parses the Bearer token, validates key signature using HS256 HMAC, and builds the Spring <code className="text-indigo-600 font-mono text-data font-semibold">AuthenticationToken</code> in context.
                    </p>
                  </div>
                  <div className="bg-white border border-indigo-200 p-3.5 rounded-lg space-y-1">
                    <div className="font-semibold text-indigo-700 font-jakarta text-label">2. Account Session Security</div>
                    <p className="text-slate-600 text-body leading-relaxed">
                      User data partitions are scoped strictly by account token. Passwords undergo salt hashing before persistence.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'erd' && (
            <div className="space-y-5 text-body">
              <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3 shadow-xs">
                <h3 className="font-semibold text-card-title font-jakarta text-slate-900 flex items-center gap-2">
                  <Database className="w-5 h-5 text-indigo-600" /> Relational Database Mapping (MySQL 8.0)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-lg space-y-2">
                    <div className="font-semibold text-indigo-700 border-b border-slate-200 pb-1 font-jakarta text-label">
                      USER ➔ PROJECT (1 : N)
                    </div>
                    <p className="text-slate-600 text-body leading-relaxed">
                      One registered user owns many projects. CascadeType.ALL ensures orphan project deletion when account is removed.
                    </p>
                    <div className="bg-slate-900 p-2.5 rounded text-data font-mono text-indigo-300 border border-slate-800">
                      @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
                      <br />
                      private Set&lt;Project&gt; projects;
                    </div>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-lg space-y-2">
                    <div className="font-semibold text-indigo-700 border-b border-slate-200 pb-1 font-jakarta text-label">
                      PROJECT ➔ TASK (1 : N)
                    </div>
                    <p className="text-slate-600 text-body leading-relaxed">
                      Projects group multiple tasks. Each task maintains foreign keys to project_id and user_id.
                    </p>
                    <div className="bg-slate-900 p-2.5 rounded text-data font-mono text-indigo-300 border border-slate-800">
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
            <div className="space-y-4 text-body">
              <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3 shadow-xs">
                <h3 className="font-semibold text-card-title font-jakarta text-slate-900">
                  Key Technical Questions & How FlowDesk Answers Them
                </h3>

                <div className="space-y-3">
                  <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 space-y-1">
                    <div className="font-semibold text-indigo-700 font-jakarta text-label">
                      Q: Why did you use Constructor Injection instead of Field Injection (@Autowired)?
                    </div>
                    <p className="text-slate-700 text-body leading-relaxed">
                      Constructor injection makes dependencies explicit, enforces immutability via <code className="text-indigo-600 font-mono text-data font-semibold">final</code> fields, and prevents Circular Dependencies at startup. It also enables easy unit testing with Mockito without starting Spring ApplicationContext!
                    </p>
                  </div>

                  <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 space-y-1">
                    <div className="font-semibold text-indigo-700 font-jakarta text-label">
                      Q: How do you prevent N+1 Select queries in Hibernate?
                    </div>
                    <p className="text-slate-700 text-body leading-relaxed">
                      By configuring <code className="text-indigo-600 font-mono text-data font-semibold">FetchType.LAZY</code> on <code className="text-indigo-600 font-mono text-data font-semibold">@ManyToOne</code> relationships, and using JPQL JOIN FETCH or DTO projections in Repository query methods when full details are required in a single SQL query.
                    </p>
                  </div>

                  <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 space-y-1">
                    <div className="font-semibold text-indigo-700 font-jakarta text-label">
                      Q: How is Global Exception Handling structured?
                    </div>
                    <p className="text-slate-700 text-body leading-relaxed">
                      Using <code className="text-indigo-600 font-mono text-data font-semibold">@ControllerAdvice</code> class <code className="text-indigo-600 font-mono text-data font-semibold">GlobalExceptionHandler</code>. It catches <code className="text-indigo-600 font-mono text-data font-semibold">MethodArgumentNotValidException</code> for Spring Validation errors and returns standard JSON payload with status codes (400, 404, 403, 500).
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-label text-slate-500">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>Interview Ready Full Stack Architecture</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold cursor-pointer shadow-xs"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
