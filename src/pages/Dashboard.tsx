"use client";

import { useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';
import { useAuth } from '../components/AuthProvider';
import { Plus, Trash2, Edit2, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface Project {
  id: string;
  name: string;
  description: string;
  status: string;
  created_at: string;
}

const Dashboard = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newProject, setNewProject] = useState({ name: '', description: '' });

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProjects(data || []);
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

  const handleDeleteProject = async (id: string) => {
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
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-[var(--heading)]">My Projects</h1>
          <p className="text-[var(--text-muted)]">Manage your workspace and tasks.</p>
        </header>

        {/* Create Project Form */}
        <div className="bg-[var(--surface)] p-6 rounded-xl border border-[var(--border)] shadow-sm mb-8">
          <form onSubmit={handleAddProject} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Project Name"
                className="w-full px-4 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg2)] text-[var(--heading)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                value={newProject.name}
                onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                required
              />
              <input
                type="text"
                placeholder="Description (optional)"
                className="w-full px-4 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg2)] text-[var(--heading)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                value={newProject.description}
                onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary flex items-center justify-center gap-2"
            >
              {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <Plus size={18} />}
              Add Project
            </button>
          </form>
        </div>

        {/* Project List */}
        {loading ? (
          <div className="flex justify-center p-12">
            <Loader2 className="animate-spin text-[var(--accent)]" size={32} />
          </div>
        ) : (
          <div className="grid gap-4">
            {projects.length === 0 ? (
              <div className="text-center p-12 bg-[var(--bg2)] rounded-xl border border-dashed border-[var(--border)]">
                <p className="text-[var(--text-muted)]">No projects yet. Create your first one above!</p>
              </div>
            ) : (
              projects.map((project) => (
                <div 
                  key={project.id}
                  className="bg-[var(--surface)] p-5 rounded-xl border border-[var(--border)] flex items-center justify-between group hover:border-[var(--accent)] transition-colors"
                >
                  <div>
                    <h3 className="font-semibold text-[var(--heading)]">{project.name}</h3>
                    {project.description && <p className="text-sm text-[var(--text-muted)]">{project.description}</p>}
                    <span className="text-[10px] uppercase font-bold text-[var(--accent)] mt-2 inline-block">
                      {new Date(project.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleDeleteProject(project.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;