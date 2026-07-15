"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../integrations/supabase/client';
import { useAuth } from '../components/AuthProvider';
import { 
  ChevronLeft, Plus, Loader2, Settings, X, Save, Search, ArrowUpDown 
} from 'lucide-react';
import toast from 'react-hot-toast';
import TaskItem from '../components/TaskItem';

interface Project {
  id: string;
  name: string;
  description: string;
  status: string;
}

interface Task {
  id: string;
  title: string;
  priority: string;
  is_completed: boolean;
  due_date: string | null;
  created_at: string;
}

const ProjectDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditingProject, setIsEditingProject] = useState(false);
  const [editedProject, setEditedProject] = useState({ name: '', description: '' });
  
  const [newTask, setNewTask] = useState('');
  const [newPriority, setNewPriority] = useState('Medium');
  const [newDueDate, setNewDueDate] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  
  const [taskSearch, setTaskSearch] = useState('');
  const [sortBy, setSortBy] = useState<'created' | 'priority' | 'due'>('created');
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingTaskTitle, setEditingTaskTitle] = useState('');
  
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: projectData, error: projectError } = await supabase
          .from('projects')
          .select('*')
          .eq('id', id)
          .single();

        if (projectError) throw projectError;
        setProject(projectData);
        setEditedProject({ name: projectData.name, description: projectData.description || '' });

        const { data: tasksData, error: tasksError } = await supabase
          .from('tasks')
          .select('*')
          .eq('project_id', id);

        if (tasksError) throw tasksError;
        setTasks(tasksData || []);
      } catch (error: any) {
        toast.error(error.message);
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, navigate]);

  const handleUpdateProject = async () => {
    try {
      const { error } = await supabase
        .from('projects')
        .update({ name: editedProject.name, description: editedProject.description })
        .eq('id', id);

      if (error) throw error;
      setProject({ ...project!, ...editedProject });
      setIsEditingProject(false);
      toast.success('Project updated');
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const addTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.trim()) return;

    setIsAdding(true);
    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert([{
          title: newTask,
          priority: newPriority,
          due_date: newDueDate || null,
          project_id: id,
          user_id: user?.id
        }])
        .select()
        .single();

      if (error) throw error;
      
      setTasks([...tasks, data]);
      setNewTask('');
      setNewDueDate('');
      toast.success('Task added');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsAdding(false);
    }
  };

  const toggleTask = async (taskId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ is_completed: !currentStatus })
        .eq('id', taskId);

      if (error) throw error;
      setTasks(tasks.map(t => t.id === taskId ? { ...t, is_completed: !currentStatus } : t));
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);

      if (error) throw error;
      setTasks(tasks.filter(t => t.id !== taskId));
      toast.success('Task removed');
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const saveTaskEdit = async (taskId: string) => {
    if (!editingTaskTitle.trim()) return;
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ title: editingTaskTitle })
        .eq('id', taskId);

      if (error) throw error;
      setTasks(tasks.map(t => t.id === taskId ? { ...t, title: editingTaskTitle } : t));
      setEditingTaskId(null);
      toast.success('Task updated');
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const sortedAndFilteredTasks = useMemo(() => {
    let result = tasks.filter(t => {
      const matchesFilter = filter === 'all' || 
        (filter === 'active' && !t.is_completed) || 
        (filter === 'completed' && t.is_completed);
      const matchesSearch = t.title.toLowerCase().includes(taskSearch.toLowerCase());
      return matchesFilter && matchesSearch;
    });

    return result.sort((a, b) => {
      if (sortBy === 'priority') {
        const pMap: Record<string, number> = { 'High': 3, 'Medium': 2, 'Low': 1 };
        return pMap[b.priority] - pMap[a.priority];
      }
      if (sortBy === 'due') {
        if (!a.due_date) return 1;
        if (!b.due_date) return -1;
        return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
      }
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    });
  }, [tasks, filter, taskSearch, sortBy]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg)]">
        <Loader2 className="animate-spin text-[var(--accent)]" size={32} />
      </div>
    );
  }

  const completedCount = tasks.filter(t => t.is_completed).length;
  const progress = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  return (
    <div className="min-h-screen bg-[var(--bg)] pt-24 pb-12 px-4">
      <div className="max-w-3xl mx-auto">
        <Link to="/dashboard" className="inline-flex items-center gap-2 text-[var(--text-muted)] hover:text-[var(--accent)] mb-6 transition-colors">
          <ChevronLeft size={18} />
          Back to Dashboard
        </Link>

        <header className="mb-8 p-6 bg-[var(--surface)] rounded-2xl border border-[var(--border)] shadow-sm">
          {isEditingProject ? (
            <div className="space-y-4">
              <input 
                className="w-full text-2xl font-bold bg-[var(--bg2)] border border-[var(--border)] rounded-lg px-3 py-1 outline-none focus:ring-2 focus:ring-[var(--accent)]"
                value={editedProject.name}
                onChange={e => setEditedProject({ ...editedProject, name: e.target.value })}
              />
              <textarea 
                className="w-full text-[var(--text-muted)] bg-[var(--bg2)] border border-[var(--border)] rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-[var(--accent)] resize-none"
                value={editedProject.description}
                onChange={e => setEditedProject({ ...editedProject, description: e.target.value })}
                rows={2}
              />
              <div className="flex gap-2">
                <button onClick={handleUpdateProject} className="btn btn-primary flex items-center gap-2 py-1.5 px-4 text-sm">
                  <Save size={16} /> Save
                </button>
                <button onClick={() => setIsEditingProject(false)} className="btn btn-ghost py-1.5 px-4 text-sm">Cancel</button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold text-[var(--heading)]">{project?.name}</h1>
                  <button onClick={() => setIsEditingProject(true)} className="p-1 text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors">
                    <Settings size={18} />
                  </button>
                </div>
                <p className="text-[var(--text-muted)]">{project?.description || 'No description provided.'}</p>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-[var(--heading)] mb-1">{progress}% Done</div>
                <div className="w-32 h-2 bg-[var(--bg2)] rounded-full overflow-hidden border border-[var(--border)]">
                  <div 
                    className={`h-full transition-all duration-500 ${progress === 100 ? 'bg-green-500' : 'bg-[var(--accent)]'}`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </div>
          )}
        </header>

        <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] shadow-sm overflow-hidden mb-8">
          <div className="p-6 border-b border-[var(--border)] bg-[var(--bg2)]">
            <form onSubmit={addTask} className="space-y-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="What needs to be done?"
                  className="flex-1 px-4 py-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--heading)] outline-none focus:ring-2 focus:ring-[var(--accent)]"
                  value={newTask}
                  onChange={(e) => setNewTask(e.target.value)}
                  required
                />
                <button type="submit" disabled={isAdding} className="btn btn-primary px-6">
                  {isAdding ? <Loader2 className="animate-spin" size={18} /> : <Plus size={18} />}
                </button>
              </div>
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Priority</span>
                  <div className="flex gap-1">
                    {['Low', 'Medium', 'High'].map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setNewPriority(p)}
                        className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all ${
                          newPriority === p ? 'bg-[var(--accent)] text-white' : 'bg-[var(--surface)] text-[var(--text-muted)] border border-[var(--border)]'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Due</span>
                  <input
                    type="date"
                    className="px-2 py-1 rounded-md text-[10px] border border-[var(--border)] bg-[var(--surface)]"
                    value={newDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)}
                  />
                </div>
              </div>
            </form>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-3 border-b border-[var(--border)] bg-[var(--surface)] gap-4">
            <div className="flex items-center gap-4">
              {(['all', 'active', 'completed'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`text-xs font-bold uppercase tracking-wider transition-colors ${
                    filter === f ? 'text-[var(--accent)]' : 'text-[var(--text-muted)] hover:text-[var(--heading)]'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={14} />
                <input 
                  type="text"
                  placeholder="Filter..."
                  className="pl-9 pr-3 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--bg2)] text-xs outline-none focus:ring-1 focus:ring-[var(--accent)] w-32 md:w-40"
                  value={taskSearch}
                  onChange={(e) => setTaskSearch(e.target.value)}
                />
              </div>
              <select 
                className="bg-[var(--bg2)] border border-[var(--border)] rounded-lg px-2 py-1.5 text-xs font-bold outline-none cursor-pointer"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
              >
                <option value="created">Sort: Newest</option>
                <option value="priority">Sort: Priority</option>
                <option value="due">Sort: Due Date</option>
              </select>
            </div>
          </div>

          <div className="divide-y divide-[var(--border)]">
            {sortedAndFilteredTasks.length === 0 ? (
              <div className="p-12 text-center text-[var(--text-muted)]">No tasks found.</div>
            ) : (
              sortedAndFilteredTasks.map((task) => (
                <TaskItem 
                  key={task.id}
                  task={task}
                  onToggle={toggleTask}
                  onDelete={deleteTask}
                  onEdit={(t) => { setEditingTaskId(t.id); setEditingTaskTitle(t.title); }}
                  isEditing={editingTaskId === task.id}
                  editTitle={editingTaskTitle}
                  onEditChange={setEditingTaskTitle}
                  onSave={saveTaskEdit}
                  onCancel={() => setEditingTaskId(null)}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetails;