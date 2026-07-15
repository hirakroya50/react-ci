"use client";

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../integrations/supabase/client';
import { useAuth } from '../components/AuthProvider';
import { Plus, Loader2, ArrowRight, Activity, Search, History, LayoutGrid, FolderPlus, AlertCircle, MoreVertical, Edit2, Check, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import ActivityFeed from '../components/ActivityFeed';
import ProjectPulse from '../components/ProjectPulse';
import EmptyState from '../components/EmptyState';

interface Project {
  id: string;
  name: string;
  description: string;
  status: string;
  category: string;
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
  const [newProject, setNewProject] = useState({ name: '', description: '', category: 'Work' });
  
  // Editing state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const fetchStats = async (projectId: string) => {
    const { count: total } = await supabase.from('tasks').select('*', { count: 'exact', head: true }).eq('project_id', projectId);
    const { count: completed } = await supabase.from('tasks').select('*', { count: 'exact', head: true }).eq('project_id', projectId).eq('is_completed', true);
    return { total: total || 0, completed: completed || 0 };
  };

  const fetchData = useCallback(async () => {
    try {
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (projectsError) throw projectsError;

      const projectsWithStats = await Promise.all((projectsData || []).map(async (project) => {
        const stats = await fetchStats(project.id);
        return { ...project, task_stats: stats };
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
  }, []);

  useEffect(() => {
    fetchData();

    // Set up Real-time subscriptions
    const projectsSubscription = supabase
      .channel('public:projects')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, () => {
        fetchData();
      })
      .subscribe();

    const activitySubscription = supabase
      .channel('public:activity_logs')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'activity_logs' }, (payload) => {
        setActivities(prev => [payload.new as any, ...prev].slice(0, 10));
      })
      .subscribe();

    return () => {
      supabase.removeChannel(projectsSubscription);
      supabase.removeChannel(activitySubscription);
    };
  }, [fetchData]);

  const handleAddProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProject.name.trim()) return;

    setIsSubmitting(true);
    try {
      const { data, error } = await supabase
        .from('projects')
        .insert([{ 
          name: newProject.name, 
          description: newProject.description, 
          category: newProject.category,
          user_id: user?.id 
        }])
        .select().single();

      if (error) throw error;
      
      await supabase.from('activity_logs').insert([{
        user_id: user?.id,
        project_id: data.id,
        action: 'created',
        entity_type: 'project',
        entity_name: data.name
      }]);

      toast.success('Project created!');
      setNewProject({ name: '', description: '', category: 'Work' });
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateProject = async (id: string) => {
    if (!editName.trim()) return;
    try {
      const { error } = await supabase
        .from('projects')
        .update({ name: editName })
        .eq('id', id);
      
      if (error) throw error;
      setEditingId(null);
      toast.success('Project updated');
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const filteredProjects = useMemo(() => {
    return projects.filter(p => 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      p.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [projects, searchQuery]);

  const totalStats = useMemo(() => {
    const totalTasks = projects.reduce((acc, p) => acc + (p.task_stats?.total || 0), 0);
    const completedTasks = projects.reduce((acc, p) => acc + (p.task_stats?.completed || 0), 0);
    return { total: totalTasks, completed: completedTasks };
  }, [projects]);

  return (
    <div className="min-h-screen bg-[var(--bg)] pt-20 md:pt-28 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-8">
        <div className="flex-1 min-w-0">
          <header className="mb-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
              <div className="min-w-0">
                <h1 className="text-3xl md:text-4xl font-extrabold text-[var(--heading)] tracking-tight truncate">Workspace</h1>
                <p className="text-[var(--text-muted)] mt-1">Track your progress and manage initiatives.</p>
              </div>
              <div className="relative w-full md:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={18} />
                <input 
                  type="text" placeholder="Filter projects..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-sm focus:ring-2 focus:ring-[var(--accent)] outline-none shadow-sm"
                  value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="col-span-1 md:col-span-2 bg-[var(--surface)] p-6 rounded-2xl border border-[var(--border)] shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <Activity size={18} className="text-[var(--accent)]" />
                  <h3 className="text-xs font-bold text-[var(--heading)] uppercase tracking-widest">Global Progress</h3>
                </div>
                <ProjectPulse total={totalStats.total} completed={totalStats.completed} label="Workspace Completion" />
              </div>
              <div className="bg-gradient-to-br from-[var(--accent)] to-[var(--accent2)] p-6 rounded-2xl shadow-xl text-white flex flex-col justify-between">
                <div>
                  <LayoutGrid size={24} className="mb-4 opacity-80" />
                  <h3 className="text-xs font-bold uppercase tracking-widest opacity-90">Active Projects</h3>
                </div>
                <div className="text-5xl font-black">{projects.length}</div>
              </div>
            </div>

            <div className="bg-[var(--surface)] p-6 rounded-2xl border border-[var(--border)] shadow-sm mb-10">
              <h3 className="text-sm font-bold text-[var(--heading)] mb-4">Launch New Project</h3>
              <form onSubmit={handleAddProject} className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text" placeholder="Project Title"
                  className="flex-1 px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg2)] text-sm outline-none focus:ring-2 focus:ring-[var(--accent)]"
                  value={newProject.name} onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                  required
                />
                <select 
                  className="w-full sm:w-44 px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg2)] text-sm font-medium outline-none focus:ring-2 focus:ring-[var(--accent)]"
                  value={newProject.category} onChange={(e) => setNewProject({ ...newProject, category: e.target.value })}
                >
                  <option>Work</option>
                  <option>Personal</option>
                  <option>Development</option>
                  <option>Design</option>
                </select>
                <button type="submit" disabled={isSubmitting} className="btn btn-primary h-[44px] flex items-center justify-center gap-2 px-8 shadow-lg shadow-indigo-500/20">
                  {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <Plus size={18} />}
                  <span className="font-bold">Create</span>
                </button>
              </form>
            </div>
          </header>

          {loading ? (
            <div className="flex flex-col items-center justify-center p-20 gap-4">
              <Loader2 className="animate-spin text-[var(--accent)]" size={48} />
              <p className="text-sm text-[var(--text-muted)] font-medium">Syncing workspace...</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between px-2">
                <h2 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest">Your Projects</h2>
                <span className="text-[10px] text-[var(--text-muted)] bg-[var(--bg2)] px-2 py-0.5 rounded-full">{filteredProjects.length} results</span>
              </div>
              
              <motion.div layout className="grid gap-4">
                <AnimatePresence mode='popLayout'>
                  {filteredProjects.length > 0 ? (
                    filteredProjects.map((project) => (
                      <motion.div 
                        layout
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        key={project.id} 
                        className="bg-[var(--surface)] p-5 rounded-2xl border border-[var(--border)] flex items-center justify-between group hover:border-[var(--accent)] hover:shadow-xl hover:shadow-indigo-500/5 transition-all cursor-default"
                      >
                        <div className="flex-1 min-w-0 pr-6" onClick={() => !editingId && navigate(`/projects/${project.id}`)}>
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-[9px] font-black px-2 py-0.5 rounded-md bg-[var(--bg2)] text-[var(--accent)] uppercase tracking-wider">
                              {project.category}
                            </span>
                          </div>
                          
                          {editingId === project.id ? (
                            <div className="flex items-center gap-2 mt-1" onClick={(e) => e.stopPropagation()}>
                              <input 
                                autoFocus
                                className="bg-[var(--bg2)] border border-[var(--accent)] rounded-lg px-3 py-1 text-base font-bold outline-none w-full max-w-md"
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleUpdateProject(project.id)}
                              />
                              <button onClick={() => handleUpdateProject(project.id)} className="p-1.5 bg-green-500 text-white rounded-lg hover:bg-green-600">
                                <Check size={16} />
                              </button>
                              <button onClick={() => setEditingId(null)} className="p-1.5 bg-gray-200 text-gray-600 rounded-lg hover:bg-gray-300">
                                <X size={16} />
                              </button>
                            </div>
                          ) : (
                            <h3 className="text-lg font-bold text-[var(--heading)] group-hover:text-[var(--accent)] transition-colors truncate cursor-pointer">
                              {project.name}
                            </h3>
                          )}
                          
                          <div className="flex items-center gap-4 mt-3">
                            <div className="flex-1 max-w-[200px] h-1.5 bg-[var(--bg2)] rounded-full overflow-hidden">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${project.task_stats?.total ? Math.round((project.task_stats?.completed || 0) / project.task_stats.total * 100) : 0}%` }} 
                                className="h-full bg-gradient-to-r from-[var(--accent)] to-[var(--accent2)]"
                              />
                            </div>
                            <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-tight">
                              {project.task_stats?.completed || 0} / {project.task_stats?.total || 0} Tasks
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingId(project.id);
                              setEditName(project.name);
                            }}
                            className="p-2.5 text-[var(--text-muted)] hover:text-[var(--accent)] hover:bg-[var(--bg2)] rounded-xl transition-colors"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button 
                            onClick={() => navigate(`/projects/${project.id}`)}
                            className="p-2.5 text-[var(--text-muted)] hover:text-[var(--accent)] hover:bg-[var(--bg2)] rounded-xl transition-colors"
                          >
                            <ArrowRight size={20} />
                          </button>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <EmptyState 
                      icon={searchQuery ? AlertCircle : FolderPlus}
                      title={searchQuery ? "No matching projects" : "Workspace is empty"}
                      description={searchQuery ? "Try refining your search terms." : "Ready to ship? Kick off your first project today."}
                    />
                  )}
                </AnimatePresence>
              </motion.div>
            </div>
          )}
        </div>

        <aside className="w-full lg:w-80 flex-shrink-0">
          <div className="bg-[var(--surface)] p-6 rounded-2xl border border-[var(--border)] shadow-sm sticky top-24">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <History size={18} className="text-[var(--accent)]" />
                <h2 className="text-xs font-bold text-[var(--heading)] uppercase tracking-widest">Live Activity</h2>
              </div>
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            </div>
            <ActivityFeed activities={activities} />
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Dashboard;