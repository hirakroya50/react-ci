"use client";

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../integrations/supabase/client';
import { useAuth } from '../components/AuthProvider';
import { Plus, Trash2, Loader2, ArrowRight, CheckCircle2 } from 'lucide-react';
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

  const fetchProjects = async () => {
    try {
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (projectsError) throw projectsError;

      // Fetch task counts for each project
      const projectsWithStats = await Promise.all((projectsData || []).map(async (project) => {
        const { count: total, error: totalError } = await supabase
          .from('tasks')
          .select('*', { count: 'exact', head: true })
          .eq('project_id', project.id);

        const { count: completed, error: completedError } = await supabase
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

  const handleDeleteProject = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this project?')) return;
    
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

  return (
    <div className="min-h-screen bg-[var(--bg)] pt-24 pb-12 px-4">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold text-[var(--heading)]">My Projects</h1>
            <p className="text-[var(--text-muted)]">Manage your workspace and track progress.</p>
          </div>
          <div className="hidden md:block text-right">
            <span className="text-2xl font-bold text-[var(--accent)]">{projects.length}</span>
            <p className="text-xs uppercase font-bold text-[var(--text-muted)]">Total Projects</p>
          </div>
        </header>

        {/* Create Project Form */}
        <div className="bg-[var(--surface)] p-6 rounded-xl border border-[var(--border)] shadow-sm mb-8 transition-all hover:shadow-md">
          <form onSubmit={handleAddProject} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-[var(--text-muted)] uppercase">Project Name</label>
                <input
                  type="text"
                  placeholder="e.g. Website Redesign"
                  className="w-full px-4 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg2)] text-[var(--heading)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                  value={newProject.name}
                  onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-[var(--text-muted)] uppercase">Description</label>
                <input
                  type="text"
                  placeholder="What is this project about?"
                  className="w-full px-4 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg2)] text-[var(--heading)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                  value={newProject.description}
                  onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary flex items-center justify-center gap-2 px-6"
            >
              {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <Plus size={18} />}
              Create Project
            </button>
          </form>
        </div>

        {/* Project List */}
        {loading ? (
          <div className="flex flex-col items-center justify-center p-24 gap-4">
            <Loader2 className="animate-spin text-[var(--accent)]" size={40} />
            <p className="text-[var(--text-muted)] animate-pulse">Loading your projects...</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {projects.length === 0 ? (
              <div className="text-center p-16 bg-[var(--bg2)] rounded-xl border border-dashed border-[var(--border)]">
                <div className="w-16 h-16 bg-[var(--surface)] rounded-full flex items-center justify-center mx-auto mb-4 border border-[var(--border)]">
                  <Plus className="text-[var(--text-muted)]" size={32} />
                </div>
                <h3 className="text-[var(--heading)] font-semibold mb-1">No projects yet</h3>
                <p className="text-[var(--text-muted)]">Create your first project to start managing tasks.</p>
              </div>
            ) : (
              projects.map((project) => {
                const total = project.task_stats?.total || 0;
                const completed = project.task_stats?.completed || 0;
                const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
                
                return (
                  <div 
                    key={project.id}
                    onClick={() => navigate(`/projects/${project.id}`)}
                    className="bg-[var(--surface)] p-5 rounded-xl border border-[var(--border)] flex flex-col md:flex-row md:items-center justify-between group hover:border-[var(--accent)] transition-all cursor-pointer hover:shadow-lg relative overflow-hidden"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-[var(--heading)] group-hover:text-[var(--accent)] transition-colors">{project.name}</h3>
                        {progress === 100 && total > 0 && <CheckCircle2 className="text-green-500" size={16} />}
                      </div>
                      {project.description && <p className="text-sm text-[var(--text-muted)] mb-3">{project.description}</p>}
                      
                      <div className="flex items-center gap-4">
                        <div className="flex-1 max-w-[200px]">
                          <div className="flex justify-between text-[10px] font-bold text-[var(--text-muted)] uppercase mb-1">
                            <span>Progress</span>
                            <span>{progress}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-[var(--bg2)] rounded-full overflow-hidden border border-[var(--border)]">
                            <div 
                              className={`h-full transition-all duration-700 ${progress === 100 ? 'bg-green-500' : 'bg-[var(--accent)]'}`}
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </div>
                        <span className="text-[10px] uppercase font-bold text-[var(--text-muted)]">
                          {completed}/{total} Tasks
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 mt-4 md:mt-0 border-t md:border-t-0 border-[var(--border)] pt-4 md:pt-0">
                      <button 
                        onClick={(e) => handleDeleteProject(e, project.id)}
                        className="p-2.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                        title="Delete Project"
                      >
                        <Trash2 size={18} />
                      </button>
                      <div className="p-2.5 bg-[var(--bg2)] text-[var(--accent)] rounded-xl group-hover:bg-[var(--accent-glow)] transition-all">
                        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
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