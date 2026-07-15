"use client";

import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../integrations/supabase/client';
import { useAuth } from '../components/AuthProvider';
import { Plus, Loader2, ArrowRight, Activity, Search, History, LayoutGrid, FolderPlus, AlertCircle } from 'lucide-react';
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

  const handleAddProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProject.name) return;

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
      fetchData();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
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
    <div className="min-h-screen bg-[var(--bg)] pt-24 pb-12 px-4">
      <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-8">
        <div className="flex-1">
          <header className="mb-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
              <div>
                <h1 className="text-3xl font-bold text-[var(--heading)]">Workspace</h1>
                <p className="text-[var(--text-muted)]">Efficiency overview and project tracking.</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative md:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={16} />
                  <input 
                    type="text" placeholder="Search workspace..."
                    className="w-full pl-10 pr-4 py-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-sm focus:ring-2 focus:ring-[var(--accent)] outline-none"
                    value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="col-span-1 md:col-span-2 bg-[var(--surface)] p-6 rounded-2xl border border-[var(--border)] shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <Activity size={18} className="text-[var(--accent)]" />
                  <h3 className="text-sm font-bold text-[var(--heading)] uppercase tracking-wider">Overall Health</h3>
                </div>
                <ProjectPulse total={totalStats.total} completed={totalStats.completed} label="Total Workspace Progress" />
              </div>
              <div className="bg-gradient-to-br from-[var(--accent)] to-[var(--accent2)] p-6 rounded-2xl shadow-lg text-white">
                <div className="flex items-center gap-2 mb-4">
                  <LayoutGrid size={18} />
                  <h3 className="text-sm font-bold uppercase tracking-wider">Projects</h3>
                </div>
                <div className="text-4xl font-black mb-1">{projects.length}</div>
                <div className="text-xs font-medium opacity-80">Total active projects in workspace</div>
              </div>
            </div>

            <div className="bg-[var(--surface)] p-6 rounded-2xl border border-[var(--border)] shadow-sm mb-8">
              <h3 className="text-sm font-bold text-[var(--heading)] mb-4">Quick Create</h3>
              <form onSubmit={handleAddProject} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <input
                  type="text" placeholder="Project Name"
                  className="md:col-span-2 px-4 py-2 rounded-xl border border-[var(--border)] bg-[var(--bg2)] text-sm outline-none focus:ring-2 focus:ring-[var(--accent)]"
                  value={newProject.name} onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                  required
                />
                <select 
                  className="px-4 py-2 rounded-xl border border-[var(--border)] bg-[var(--bg2)] text-sm outline-none focus:ring-2 focus:ring-[var(--accent)]"
                  value={newProject.category} onChange={(e) => setNewProject({ ...newProject, category: e.target.value })}
                >
                  <option>Work</option>
                  <option>Personal</option>
                  <option>Side Project</option>
                  <option>Learning</option>
                </select>
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
            <motion.div layout className="grid gap-4">
              <AnimatePresence mode='popLayout'>
                {filteredProjects.length > 0 ? (
                  filteredProjects.map((project) => (
                    <motion.div 
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      key={project.id} 
                      onClick={() => navigate(`/projects/${project.id}`)}
                      className="bg-[var(--surface)] p-5 rounded-2xl border border-[var(--border)] flex items-center justify-between group hover:border-[var(--accent)] cursor-pointer hover:shadow-md transition-all"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[var(--bg2)] text-[var(--text-muted)] uppercase tracking-tight">
                            {project.category}
                          </span>
                          <h3 className="font-bold text-[var(--heading)] group-hover:text-[var(--accent)] transition-colors">{project.name}</h3>
                        </div>
                        <div className="flex items-center gap-4 mt-2">
                          <div className="w-24 h-1 bg-[var(--bg2)] rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-[var(--accent)] transition-all duration-1000" 
                              style={{ width: `${project.task_stats?.total ? Math.round((project.task_stats?.completed || 0) / project.task_stats.total * 100) : 0}%` }} 
                            />
                          </div>
                          <span className="text-[10px] font-bold text-[var(--text-muted)]">
                            {project.task_stats?.completed || 0}/{project.task_stats?.total || 0} tasks
                          </span>
                        </div>
                      </div>
                      <ArrowRight size={18} className="text-[var(--text-muted)] group-hover:translate-x-1 transition-transform" />
                    </motion.div>
                  ))
                ) : (
                  <EmptyState 
                    icon={searchQuery ? AlertCircle : FolderPlus}
                    title={searchQuery ? "No projects match your search" : "No projects found"}
                    description={searchQuery ? "Try searching for a different term." : "Ready to start shipping? Create your first project above."}
                  />
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </div>

        <aside className="w-full lg:w-72">
          <div className="bg-[var(--surface)] p-6 rounded-2xl border border-[var(--border)] shadow-sm sticky top-24">
            <div className="flex items-center gap-2 mb-6">
              <History size={18} className="text-[var(--accent)]" />
              <h2 className="text-sm font-bold text-[var(--heading)] uppercase tracking-wider">Feed</h2>
            </div>
            <ActivityFeed activities={activities} />
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Dashboard;