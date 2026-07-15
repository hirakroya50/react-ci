"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../integrations/supabase/client';
import { useAuth } from '../components/AuthProvider';
import { ChevronLeft, Plus, CheckCircle2, Circle, Trash2, Loader2, Calendar, Filter } from 'lucide-react';
import toast from 'react-hot-toast';

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
  const [newTask, setNewTask] = useState('');
  const [newPriority, setNewPriority] = useState('Medium');
  const [newDueDate, setNewDueDate] = useState('');
  const [isAdding, setIsAdding] = useState(false);
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

        const { data: tasksData, error: tasksError } = await supabase
          .from('tasks')
          .select('*')
          .eq('project_id', id)
          .order('created_at', { ascending: true });

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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'text-red-500 bg-red-50 dark:bg-red-950/20';
      case 'Medium': return 'text-amber-500 bg-amber-50 dark:bg-amber-950/20';
      case 'Low': return 'text-blue-500 bg-blue-50 dark:bg-blue-950/20';
      default: return 'text-gray-500 bg-gray-50 dark:bg-gray-800';
    }
  };

  const filteredTasks = tasks.filter(t => {
    if (filter === 'active') return !t.is_completed;
    if (filter === 'completed') return t.is_completed;
    return true;
  });

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

        <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-[var(--heading)]">{project?.name}</h1>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${project?.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                {project?.status}
              </span>
            </div>
            <p className="text-[var(--text-muted)]">{project?.description || 'No description provided.'}</p>
          </div>
          <div className="text-right">
            <div className="text-sm font-medium text-[var(--text-muted)] mb-1">{progress}% Complete</div>
            <div className="w-32 h-2 bg-[var(--bg2)] rounded-full overflow-hidden border border-[var(--border)]">
              <div 
                className={`h-full transition-all duration-500 ${progress === 100 ? 'bg-green-500' : 'bg-[var(--accent)]'}`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </header>

        <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] shadow-sm overflow-hidden mb-8">
          <div className="p-6 border-b border-[var(--border)] bg-[var(--bg2)]">
            <form onSubmit={addTask} className="space-y-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Task title..."
                  className="flex-1 px-4 py-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--heading)] focus:ring-2 focus:ring-[var(--accent)] outline-none"
                  value={newTask}
                  onChange={(e) => setNewTask(e.target.value)}
                  required
                />
                <button
                  type="submit"
                  disabled={isAdding}
                  className="btn btn-primary px-6"
                >
                  {isAdding ? <Loader2 className="animate-spin" size={18} /> : <Plus size={18} />}
                </button>
              </div>
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase">Priority</span>
                  <div className="flex gap-1">
                    {['Low', 'Medium', 'High'].map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setNewPriority(p)}
                        className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all ${
                          newPriority === p 
                          ? 'bg-[var(--accent)] text-white' 
                          : 'bg-[var(--surface)] text-[var(--text-muted)] border border-[var(--border)]'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase">Due Date</span>
                  <input
                    type="date"
                    className="px-2 py-1 rounded-md text-[10px] font-medium border border-[var(--border)] bg-[var(--surface)] text-[var(--heading)] focus:ring-1 focus:ring-[var(--accent)] outline-none"
                    value={newDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)}
                  />
                </div>
              </div>
            </form>
          </div>

          <div className="flex items-center justify-between px-6 py-3 border-b border-[var(--border)] bg-[var(--surface)]">
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
            <div className="text-[10px] font-bold text-[var(--text-muted)] uppercase">
              {filteredTasks.length} Tasks
            </div>
          </div>

          <div className="divide-y divide-[var(--border)]">
            {filteredTasks.length === 0 ? (
              <div className="p-12 text-center text-[var(--text-muted)]">
                {tasks.length === 0 ? "No tasks yet." : "No tasks match this filter."}
              </div>
            ) : (
              filteredTasks.map((task) => (
                <div key={task.id} className="p-4 flex items-center justify-between group hover:bg-[var(--bg2)] transition-colors">
                  <div className="flex items-center gap-3 flex-1">
                    <button 
                      onClick={() => toggleTask(task.id, task.is_completed)}
                      className="transition-transform active:scale-90"
                    >
                      {task.is_completed ? (
                        <CheckCircle2 className="text-green-500" size={20} />
                      ) : (
                        <Circle className="text-[var(--text-muted)]" size={20} />
                      )}
                    </button>
                    <div className="flex flex-col">
                      <span className={task.is_completed ? 'line-through text-[var(--text-muted)]' : 'text-[var(--heading)]'}>
                        {task.title}
                      </span>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-[9px] w-fit px-1.5 py-0.5 rounded uppercase font-bold ${getPriorityColor(task.priority)}`}>
                          {task.priority}
                        </span>
                        {task.due_date && (
                          <span className="flex items-center gap-1 text-[9px] font-bold text-[var(--text-muted)]">
                            <Calendar size={10} />
                            {new Date(task.due_date).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteTask(task.id)}
                    className="p-2 text-[var(--text-muted)] hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetails;