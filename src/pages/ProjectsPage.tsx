import React, { useEffect, useState } from 'react';
import { apiClient } from '../services/api';
import { Project } from '../types';
import {
  FolderKanban,
  Plus,
  Archive,
  Trash2,
  Edit2,
  CheckCircle2,
  X,
  Loader2,
  Layers,
} from 'lucide-react';

export const ProjectsPage: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showArchived, setShowArchived] = useState(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'Backend Architecture',
    color: '#4f46e5',
  });

  const categories = [
    'Backend Architecture',
    'Frontend Engineering',
    'DevOps & Infra',
    'Database Design',
    'Product Management',
    'General',
  ];

  const colorOptions = [
    '#4f46e5', // Primary Indigo
    '#10b981', // Emerald Green
    '#f59e0b', // Amber Gold
    '#2563eb', // Royal Blue
    '#7c3aed', // Purple Violet
    '#059669', // Forest Green
  ];

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get<Project[]>(`/projects?archived=${showArchived}`);
      setProjects(res.data);
    } catch (err) {
      console.error('Failed to load projects:', err);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [showArchived]);

  const handleOpenCreateModal = () => {
    setEditingProject(null);
    setFormData({
      name: '',
      description: '',
      category: 'Backend Architecture',
      color: '#4f46e5',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (proj: Project) => {
    setEditingProject(proj);
    setFormData({
      name: proj.name,
      description: proj.description,
      category: proj.category,
      color: proj.color,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    try {
      if (editingProject) {
        await apiClient.put(`/projects/${editingProject.id}`, formData);
      } else {
        await apiClient.post('/projects', formData);
      }
      setIsModalOpen(false);
      fetchProjects();
    } catch (err) {
      console.error('Error saving project', err);
    }
  };

  const handleToggleArchive = async (id: string) => {
    try {
      await apiClient.patch(`/projects/${id}/archive`);
      fetchProjects();
    } catch (err) {
      console.error('Error archiving project', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this project and all its tasks?')) return;
    try {
      await apiClient.delete(`/projects/${id}`);
      fetchProjects();
    } catch (err) {
      console.error('Error deleting project', err);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 p-6 rounded-2xl shadow-xs">
        <div>
          <h1 className="text-card-title md:text-section-title font-jakarta font-bold text-slate-900 flex items-center gap-2">
            <FolderKanban className="w-6 h-6 text-indigo-600" /> Project Workspaces
          </h1>
          <p className="text-body text-slate-600 mt-1">
            Organize tasks into categorized project modules mapped to Java Spring Boot repositories.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowArchived(!showArchived)}
            className={`px-3.5 py-2 rounded-xl text-label transition-all flex items-center gap-1.5 cursor-pointer font-medium ${
              showArchived
                ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 font-semibold'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Archive className="w-3.5 h-3.5" />
            {showArchived ? 'Showing Archived' : 'Show Archived'}
          </button>
          <button
            onClick={handleOpenCreateModal}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-label font-semibold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> New Project
          </button>
        </div>
      </div>

      {/* Projects Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh] text-slate-400 gap-3">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
          <span className="text-label font-medium uppercase tracking-wider text-slate-500 font-mono">Loading Projects...</span>
        </div>
      ) : projects.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-3 shadow-xs">
          <FolderKanban className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-card-title font-jakarta font-semibold text-slate-900">No projects found</h3>
          <p className="text-body text-slate-500 max-w-md mx-auto">
            {showArchived
              ? 'No archived projects exist.'
              : 'Create your first project workspace to organize your tasks & milestones.'}
          </p>
          {!showArchived && (
            <button
              onClick={handleOpenCreateModal}
              className="mt-2 inline-flex items-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-label font-semibold shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Create Project
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((proj) => {
            const taskCount = proj.taskCount ?? 0;
            const completedTaskCount = proj.completedTaskCount ?? 0;
            const progress = taskCount > 0 ? Math.round((completedTaskCount / taskCount) * 100) : 0;

            return (
              <div
                key={proj.id}
                className="bg-white border border-slate-200 hover:border-slate-300 rounded-2xl p-5 space-y-4 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <span
                        className="px-2.5 py-0.5 rounded text-data font-medium"
                        style={{
                          backgroundColor: `${proj.color || '#4f46e5'}15`,
                          color: proj.color || '#4f46e5',
                          border: `1px solid ${proj.color || '#4f46e5'}30`,
                        }}
                      >
                        {proj.category}
                      </span>
                      <h3 className="text-card-title font-jakarta font-semibold text-slate-900 leading-snug">
                        {proj.name}
                      </h3>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEditModal(proj)}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                        title="Edit Project"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleToggleArchive(proj.id)}
                        className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                        title={proj.isArchived ? 'Unarchive' : 'Archive'}
                      >
                        <Archive className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(proj.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Delete Project"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <p className="text-body text-slate-600 line-clamp-2 leading-relaxed">
                    {proj.description || 'No description provided.'}
                  </p>
                </div>

                {/* Progress Bar & Stats */}
                <div className="space-y-2 pt-3 border-t border-slate-100">
                  <div className="flex items-center justify-between text-label text-slate-600 font-mono">
                    <span>Task Completion</span>
                    <span className="text-indigo-600 font-semibold">
                      {completedTaskCount} / {taskCount} ({progress}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200">
                    <div
                      className="h-full bg-indigo-600 transition-all duration-500 rounded-full"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Project Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md p-6 space-y-5 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-card-title font-jakarta font-semibold text-slate-900 flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-600" />
                {editingProject ? 'Edit Project Workspace' : 'Create Project Workspace'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-label text-slate-700 font-medium">Project Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Spring Boot Microservices"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-body text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-label text-slate-700 font-medium">Category Tag</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-body text-slate-900 focus:outline-none focus:border-indigo-500 focus:bg-white font-mono"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-label text-slate-700 font-medium">Theme Color</label>
                <div className="flex items-center gap-3">
                  {colorOptions.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setFormData({ ...formData, color: c })}
                      className={`w-7 h-7 rounded-full transition-transform cursor-pointer ${
                        formData.color === c ? 'scale-125 ring-2 ring-indigo-600 ring-offset-2' : 'hover:scale-110'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-label text-slate-700 font-medium">Description</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Outline high-level deliverables and architecture scope..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-body text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-label font-medium text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-label font-semibold shadow-xs cursor-pointer font-sans"
                >
                  {editingProject ? 'Save Changes' : 'Create Workspace'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
