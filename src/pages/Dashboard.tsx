"use client";

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../integrations/supabase/client';
import { useAuth } from '../components/AuthProvider';
import { Plus, Trash2, Loader2, ArrowRight, CheckCircle2, Archive, Activity } from 'lucide-react';
import toast from 'react-hot-toast';

interface Project {
  id: string;
  name: string;
  description: string;
  status: string;
  created_at: string;
  task_stats?: {
    total: number;
    completed: number;
  };
}

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newProject, setNewProject] = useState({ name: '', description: '' });
  const [view, setView] = useState<'active' | 'archived'>('active');

  const fetchProjects = async () => {
    try {
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (projectsError) throw projectsError;

      const projectsWithStats = await Promise.all((projectsData || []).map(async (project) => {
        const { count: total } = await supabase
          .from('tasks')
          .select('*', { count: 'exact', head: true })
          .eq('project_id', project.id);

        const { count: completed } = await supabase
          .from('tasks')
          .select('*', { count: 'exact', head: true })
          .eq('project_id', project.id)
          .eq('is_completed', true);

        return {
          ...project,
          task_stats: {
            total: total || 0,
            completed: completed || 0
          }
        };
      }));

      setProjects(projectsWithStats);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleAddProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProject.name) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('projects')
        .insert([{ 
          name: newProject.name, 
          description: newProject.description,
          user_id: user?.id 
        }]);

      if (error) throw error;
      
      toast.success('Project created!');
      setNewProject({ name: '', description: '' });
      fetchProjects();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleProjectStatus = async (e: React.MouseEvent, id: string, currentStatus: string) => {
    e.stopPropagation();
    const newStatus = currentStatus === 'active' ? 'archived' : 'active';
    try {
      const { error } = await supabase
        .from('projects')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;
      
      toast.success(`Project ${newStatus === 'active' ? 'activated' : 'archived'}`);
      setProjects(projects.map(p => p.id === id ? { ...p, status: newStatus } : p));
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleDeleteProject = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm('Permanently delete this project?')) return;
    
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast.success('Project deleted');
      setProjects(projects.filter(p => p.id !== id));
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const filteredProjects = projects.filter(p => p.status === view);

  return (
    <div className="min-h-screen bg-[var(--bg)] pt-24 pb-12 px-4">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold text-[var(--heading)]">Workspace</h1>
            <p className="text-[var(--text-muted)]">Organize your projects and ship faster.</p>
          </div>
          
          <div className="flex bg-[var(--bg2)] p-1 rounded-xl border border-[var(--border)]">
            <button 
              onClick={() => setView('active')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${view === 'active' ? 'bg-[var(--surface)] text-[var(--accent)] shadow-sm' : 'text-[var(--text-muted)] hover:text-[var(--heading)]'}`}
            >
              <Activity size={14} /> Active
            </button>
            <button 
              onClick={() => setView('archived')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${view === 'archived' ? 'bg-[var(--surface)] text-[var(--accent)] shadow-sm' : 'text-[var(--text-muted)] hover:text-[var(--heading)]'}`}
            >
              <Archive size={14} /> Archived
            </button>
          </div>
        </header>

        {view === 'active' && (
          <div className="bg-[var(--surface)] p-6 rounded-2xl border border-[var(--border)] shadow-sm mb-8">
            <form onSubmit={handleAddProject} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="New project name..."
                  className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg2)] text-[var(--heading)] focus:ring-2 focus:ring-[var(--accent)] outline-none"
                  value={newProject.name}
                  onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                  required
                />
                <input
                  type="text"
                  placeholder="Short description..."
                  className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg2)] text-[var(--heading)] focus:ring-2 focus:ring-[var(--accent)] outline-none"
                  value={newProject.description}
                  onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn btn-primary w-full md:w-auto flex items-center justify-center gap-2 px-8"
              >
                {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <Plus size={18} />}
                Create Project
              </button>
            </form>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center p-24">
            <Loader2 className="animate-spin text-[var(--accent)]" size={40} />
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredProjects.length === 0 ? (
              <div className="text-center p-16 bg-[var(--bg2)] rounded-2xl border border-dashed border-[var(--border)]">
                <p className="text-[var(--text-muted)]">No {view} projects found.</p>
              </div>
            ) : (
              filteredProjects.map((project) => {
                const total = project.task_stats?.total || 0;
                const completed = project.task_stats?.completed || 0;
                const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
                
                return (
                  <div 
                    key={project.id}
                    onClick={() => navigate(`/projects/${project.id}`)}
                    className="bg-[var(--surface)] p-6 rounded-2xl border border-[var(--border)] flex flex-col md:flex-row md:items-center justify-between group hover:border-[var(--accent)] transition-all cursor-pointer hover:shadow-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-bold text-lg text-[var(--heading)] group-hover:text-[var(--accent)] transition-colors">{project.name}</h3>
                        {progress === 100 && total > 0 && <CheckCircle2 className="text-green-500" size={18} />}
                      </div>
                      {project.description && <p className="text-sm text-[var(--text-muted)] mb-4">{project.description}</p>}
                      
                      <div className="flex items-center gap-6">
                        <div className="flex-1 max-w-[240px]">
                          <div className="w-full h-2 bg-[var(--bg2)] rounded-full overflow-hidden border border-[var(--border)]">
                            <div 
                              className={`h-full transition-all duration-700 ${progress === 100 ? 'bg-green-500' : 'bg-[var(--accent)]'}`}
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </div>
                        <span className="text-[10px] uppercase font-black text-[var(--text-muted)]">
                          {completed}/{total} Tasks ({progress}%)
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 mt-6 md:mt-0 pt-6 md:pt-0 border-t md:border-t-0 border-[var(--border)]">
                      <button 
                        onClick={(e) => toggleProjectStatus(e, project.id, project.status)}
                        className={`p-2 rounded-xl transition-all ${view === 'active' ? 'text-gray-400 hover:text-amber-500 hover:bg-amber-50' : 'text-amber-500 hover:text-green-600 hover:bg-green-50'}`}
                        title={view === 'active' ? 'Archive Project' : 'Restore Project'}
                      >
                        {view === 'active' ? <Archive size={20} /> : <Activity size={20} />}
                      </button>
                      <button 
                        onClick={(e) => handleDeleteProject(e, project.id)}
                        className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                        title="Delete Project"
                      >
                        <Trash2 size={20} />
                      </button>
                      <div className="ml-2 p-2 bg-[var(--bg2)] text-[var(--accent)] rounded-xl group-hover:bg-[var(--accent-glow)] transition-all">
                        <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;