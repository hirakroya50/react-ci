"use client";

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../integrations/supabase/client';
import { useAuth } from '../components/AuthProvider';
import { Plus, Loader2, ArrowRight, Search, History, LayoutGrid, FolderPlus, AlertCircle, Star, Filter, Target } from 'lucide-react';
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

interface FocusTask {
  id: string;
  title: string;
  project_name: string;
  priority: string;
}

const CATEGORIES = ["All", "Work", "Personal", "Study", "Hobby"];

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [focusTasks, setFocusTasks] = useState<FocusTask[]>([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [newProject, setNewProject] = useState({ name: '', description: '', category: 'Work' });

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

      const { data: tasksData } = await supabase
        .from('tasks')
        .select('id, title, priority, projects(name)')
        .eq('is_completed', false)
        .eq('priority', 'High')
        .limit(3);
      
      setFocusTasks((tasksData || []).map((t: any) => ({
        id: t.id,
        title: t.title,
        priority: t.priority,
        project_name: t.projects?.name || 'Unknown'
      })));

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
    const projectsSub = supabase.channel('dashboard-sync').on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, () => fetchData()).subscribe();
    return () => { supabase.removeChannel(projectsSub); };
  }, [fetchData]);

  const handleAddProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProject.name.trim()) return;
    setIsSubmitting(true);
    try {
      const { data, error } = await supabase.from('projects').insert([{ ...newProject, user_id: user?.id }]).select().single();
      if (error) throw error;
      
      // Log project creation activity
      await supabase.from('activity_logs').insert([{
        user_id: user?.id,
        project_id: data.id,
        action: 'created',
        entity_type: 'project',
        entity_name: data.name
      }]);

      toast.success('Project launched!');
      setNewProject({ name: '', description: '', category: 'Work' });
      fetchData();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredProjects = useMemo(() => {
    return projects.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === "All" || p.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [projects, searchQuery, selectedCategory]);

  const globalStats = useMemo(() => {
    const total = projects.reduce((acc, p) => acc + (p.task_stats?.total || 0), 0);
    const completed = projects.reduce((acc, p) => acc + (p.task_stats?.completed || 0), 0);
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, percentage };
  }, [projects]);

  return (
    <div className="min-h-screen bg-[var(--bg)] pt-20 md:pt-28 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8">
        <div className="flex-1 min-w-0">
          <header className="mb-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
              <div className="min-w-0">
                <h1 className="text-3xl md:text-5xl font-black text-[var(--heading)] tracking-tighter">Workspace</h1>
                <p className="text-[var(--text-muted)] text-lg mt-1">Ready to ship something amazing today?</p>
              </div>
              <div className="relative w-full md:w-80">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={18} />
                <input 
                  type="text" placeholder="Search projects..."
                  className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-[var(--border)] bg-[var(--surface)] text-sm focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm"
                  value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              <div className="md:col-span-2 bg-[var(--surface)] p-6 md:p-8 rounded-3xl border border-[var(--border)] shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <Star size={20} className="text-amber-500 fill-amber-500" />
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[var(--heading)]">Focus Area</h3>
                  </div>
                  <div className="text-[10px] font-bold text-[var(--text-muted)] uppercase">High Priority Tasks</div>
                </div>
                {focusTasks.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {focusTasks.map(task => (
                      <div key={task.id} className="flex items-center justify-between p-4 rounded-2xl bg-[var(--bg2)] border border-[var(--border)] group hover:border-indigo-500 transition-colors">
                        <div className="min-w-0">
                          <p className="font-bold text-[var(--heading)] truncate text-sm">{task.title}</p>
                          <p className="text-[10px] font-medium text-[var(--text-muted)] uppercase tracking-wide mt-1">{task.project_name}</p>
                        </div>
                        <ArrowRight size={14} className="text-indigo-400 opacity-0 group-hover:opacity-100 transition-all" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center border border-dashed border-[var(--border)] rounded-2xl">
                    <p className="text-sm text-[var(--text-muted)] italic">No urgent tasks. You're all caught up!</p>
                  </div>
                )}
              </div>
              <div className="bg-indigo-600 p-8 rounded-3xl shadow-xl shadow-indigo-500/20 text-white flex flex-col justify-between overflow-hidden relative">
                <div className="relative z-10">
                  <Target size={32} className="mb-6 opacity-40" />
                  <h3 className="text-xs font-black uppercase tracking-widest opacity-80">Global Progress</h3>
                  <div className="text-5xl font-black mt-2 tracking-tighter">{globalStats.percentage}%</div>
                  <p className="text-[10px] font-bold mt-2 opacity-70 uppercase tracking-widest">{globalStats.completed} / {globalStats.total} Tasks Finished</p>
                </div>
                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-6 mb-12">
              <div className="flex-1 bg-[var(--surface)] p-6 rounded-3xl border border-[var(--border)] shadow-sm">
                <div className="flex flex-col sm:flex-row gap-4">
                  <input
                    type="text" placeholder="Launch Project: New Project Name"
                    className="flex-1 px-5 py-3.5 rounded-2xl border border-[var(--border)] bg-[var(--bg2)] text-base font-medium outline-none focus:ring-2 focus:ring-indigo-500"
                    value={newProject.name} onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                  />
                  <select
                    className="px-4 py-3.5 rounded-2xl border border-[var(--border)] bg-[var(--bg2)] text-sm font-bold text-[var(--heading)] outline-none cursor-pointer"
                    value={newProject.category} onChange={(e) => setNewProject({ ...newProject, category: e.target.value })}
                  >
                    {CATEGORIES.filter(c => c !== "All").map(cat => <option key={cat}>{cat}</option>)}
                  </select>
                  <button type="submit" disabled={isSubmitting || !newProject.name.trim()} onClick={handleAddProject} className="btn btn-primary px-8 py-3.5 rounded-2xl font-black text-base shadow-lg disabled:opacity-50">
                    {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <Plus size={20} />}
                    Launch
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2 no-scrollbar">
              <Filter size={16} className="text-[var(--text-muted)] mr-2 shrink-0" />
              {CATEGORIES.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-5 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all shrink-0 ${
                    selectedCategory === category 
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' 
                      : 'bg-[var(--surface)] text-[var(--text-muted)] border border-[var(--border)] hover:border-indigo-400'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </header>

          {loading ? (
            <div className="flex justify-center p-20"><Loader2 className="animate-spin text-indigo-600" size={48} /></div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <AnimatePresence mode='popLayout'>
                {filteredProjects.length > 0 ? (
                  filteredProjects.map((project) => (
                    <motion.div 
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      key={project.id} 
                      onClick={() => navigate(`/projects/${project.id}`)}
                      className="bg-[var(--surface)] p-6 rounded-3xl border border-[var(--border)] group hover:border-indigo-600 cursor-pointer hover:shadow-xl transition-all"
                    >
                      <div className="flex items-center justify-between mb-6">
                        <span className="text-[10px] font-black px-3 py-1 rounded-full bg-[var(--bg2)] text-indigo-600 uppercase tracking-widest">
                          {project.category}
                        </span>
                        <ArrowRight size={20} className="text-[var(--text-muted)] group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
                      </div>
                      
                      <h3 className="text-xl font-bold text-[var(--heading)] group-hover:text-indigo-600 transition-colors mb-4 line-clamp-1">{project.name}</h3>
                      
                      <div className="space-y-3">
                        <ProjectPulse total={project.task_stats?.total || 0} completed={project.task_stats?.completed || 0} label="Status" />
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="col-span-full">
                    <EmptyState 
                      icon={searchQuery || selectedCategory !== "All" ? AlertCircle : FolderPlus}
                      title={searchQuery || selectedCategory !== "All" ? "No results" : "Your space is empty"}
                      description={searchQuery || selectedCategory !== "All" ? "Try adjusting your filters or search terms." : "Start your journey by launching a project above."}
                    />
                  </div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>

        <aside className="w-full lg:w-80 flex-shrink-0">
          <div className="bg-[var(--surface)] p-8 rounded-3xl border border-[var(--border)] shadow-sm sticky top-28">
            <div className="flex items-center gap-3 mb-8">
              <History size={20} className="text-indigo-600" />
              <h2 className="text-xs font-black text-[var(--heading)] uppercase tracking-[0.2em]">Activity Feed</h2>
            </div>
            <ActivityFeed activities={activities} />
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Dashboard;