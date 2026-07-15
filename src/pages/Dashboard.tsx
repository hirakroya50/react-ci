"use client";

import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../integrations/supabase/client';
import { useAuth } from '../components/AuthProvider';
import { Plus, Trash2, Loader2, ArrowRight, CheckCircle2, Archive, Activity, Search, History } from 'lucide-react';
import toast from 'react-hot-toast';
import ActivityFeed from '../components/ActivityFeed';

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
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [newProject, setNewProject] = useState({ name: '', description: '' });
  const [view, setView] = useState<'active' | 'archived'>('active');

  const fetchData = async () => {
    try {
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (projectsError) throw projectsError;

      const projectsWithStats = await Promise.all((projectsData || []).map(async (project) => {
        const { count: total } = await supabase.from('tasks').select('*', { count: 'exact', head: true }).eq('project_id', project.id);
        const { count: completed } = await supabase.from('tasks').select('*', { count: 'exact', head: true }).eq('project_id', project.id).eq('is_completed', true);
        return { ...project, task_stats: { total: total || 0, completed: completed || 0 } };
      }));

      setProjects(projectsWithStats);

      const { data: activityData } = await supabase
        .from('activity_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
      
      setActivities(activityData || []);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const logActivity = async (projectId: string, action: string, type: string, name: string) => {
    await supabase.from('activity_logs').insert([{
      user_id: user?.id,
      project_id: projectId,
      action,
      entity_type: type,
      entity_name: name
    }]);
  };

  const handleAddProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProject.name) return;

    setIsSubmitting(true);
    try {
      const { data, error } = await supabase
        .from('projects')
        .insert([{ name: newProject.name, description: newProject.description, user_id: user?.id }])
        .select().single();

      if (error) throw error;
      
      await logActivity(data.id, 'created', 'project', data.name);
      toast.success('Project created!');
      setNewProject({ name: '', description: '' });
      fetchData();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProject = async (e: React.MouseEvent, id: string, name: string) => {
    e.stopPropagation();
    if (!confirm('Permanently delete this project?')) return;
    try {
      const { error } = await supabase.from('projects').delete().eq('id', id);
      if (error) throw error;
      toast.success('Project deleted');
      setProjects(projects.filter(p => p.id !== id));
      // Refresh activity log
      const { data } = await supabase.from('activity_logs').select('*').order('created_at', { ascending: false }).limit(10);
      setActivities(data || []);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const filteredProjects = useMemo(() => {
    return projects.filter(p => p.status === view && (p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.description.toLowerCase().includes(searchQuery.toLowerCase())));
  }, [projects, view, searchQuery]);

  return (
    <div className="min-h-screen bg-[var(--bg)] pt-24 pb-12 px-4">
      <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-8">
        <div className="flex-1">
          <header className="mb-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
              <div>
                <h1 className="text-3xl font-bold text-[var(--heading)]">Workspace</h1>
                <p className="text-[var(--text-muted)]">Manage your active projects.</p>
              </div>
              <div className="relative md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={16} />
                <input 
                  type="text" placeholder="Search projects..."
                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-sm focus:ring-2 focus:ring-[var(--accent)] outline-none"
                  value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="bg-[var(--surface)] p-6 rounded-2xl border border-[var(--border)] shadow-sm mb-8">
              <h3 className="text-sm font-bold text-[var(--heading)] mb-4">Quick Create</h3>
              <form onSubmit={handleAddProject} className="flex flex-col md:flex-row gap-4">
                <input
                  type="text" placeholder="Project Name"
                  className="flex-1 px-4 py-2 rounded-xl border border-[var(--border)] bg-[var(--bg2)] text-sm outline-none focus:ring-2 focus:ring-[var(--accent)]"
                  value={newProject.name} onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                  required
                />
                <button type="submit" disabled={isSubmitting} className="btn btn-primary flex items-center justify-center gap-2 px-6">
                  {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : <Plus size={16} />}
                  Create
                </button>
              </form>
            </div>
          </header>

          {loading ? (
            <div className="flex justify-center p-20"><Loader2 className="animate-spin text-[var(--accent)]" size={40} /></div>
          ) : (
            <div className="grid gap-4">
              {filteredProjects.map((project) => {
                const total = project.task_stats?.total || 0;
                const progress = total > 0 ? Math.round((project.task_stats?.completed || 0) / total * 100) : 0;
                return (
                  <div 
                    key={project.id} onClick={() => navigate(`/projects/${project.id}`)}
                    className="bg-[var(--surface)] p-5 rounded-2xl border border-[var(--border)] flex items-center justify-between group hover:border-[var(--accent)] cursor-pointer hover:shadow-md transition-all"
                  >
                    <div className="flex-1">
                      <h3 className="font-bold text-[var(--heading)] group-hover:text-[var(--accent)] transition-colors">{project.name}</h3>
                      <div className="flex items-center gap-4 mt-2">
                        <div className="w-24 h-1.5 bg-[var(--bg2)] rounded-full overflow-hidden">
                          <div className="h-full bg-[var(--accent)] transition-all" style={{ width: `${progress}%` }} />
                        </div>
                        <span className="text-[10px] font-bold text-[var(--text-muted)]">{progress}%</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={(e) => handleDeleteProject(e, project.id, project.name)} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                        <Trash2 size={18} />
                      </button>
                      <ArrowRight size={18} className="text-[var(--text-muted)] group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <aside className="w-full lg:w-72">
          <div className="bg-[var(--surface)] p-6 rounded-2xl border border-[var(--border)] shadow-sm sticky top-24">
            <div className="flex items-center gap-2 mb-6">
              <History size={18} className="text-[var(--accent)]" />
              <h2 className="text-sm font-bold text-[var(--heading)] uppercase tracking-wider">Activity</h2>
            </div>
            <ActivityFeed activities={activities} />
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Dashboard;