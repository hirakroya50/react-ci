"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../integrations/supabase/client';
import { useAuth } from '../components/AuthProvider';
import { ChevronLeft, Plus, CheckCircle2, Circle, Trash2, Loader2, Flag } from 'lucide-react';
import toast from 'react-hot-toast';

interface Project {
  id: string;
  name: string;
  description: string;
}

interface Task {
  id: string;
  title: string;
  priority: string;
  is_completed: boolean;
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
  const [isAdding, setIsAdding] = useState(false);

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
          project_id: id,
          user_id: user?.id
        }])
        .select()
        .single();

      if (error) throw error;
      
      setTasks([...tasks, data]);
      setNewTask('');
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
      case 'High': return 'text-red-500 bg-red-50';
      case 'Medium': return 'text-amber-500 bg-amber-50';
      case 'Low': return 'text-blue-500 bg-blue-50';
      default: return 'text-gray-500 bg-gray-50';
    }
  };

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
            <h1 className="text-3xl font-bold text-[var(--heading)] mb-2">{project?.name}</h1>
            <p className="text-[var(--text-muted)]">{project?.description || 'No description provided.'}</p>
          </div>
          <div className="text-right">
            <div className="text-sm font-medium text-[var(--text-muted)] mb-1">{progress}% Complete</div>
            <div className="w-32 h-2 bg-[var(--bg2)] rounded-full overflow-hidden border border-[var(--border)]">
              <div 
                className="h-full bg-green-500 transition-all duration-500" 
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </header>

        <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] shadow-sm overflow-hidden">
          <div className="p-6 border-b border-[var(--border)] bg-[var(--bg2)]">
            <form onSubmit={addTask} className="space-y-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="What needs to be done?"
                  className="flex-1 px-4 py-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--heading)] focus:ring-2 focus:ring-[var(--accent)] outline-none"
                  value={newTask}
                  onChange={(e) => setNewTask(e.target.value)}
                />
                <button
                  type="submit"
                  disabled={isAdding}
                  className="btn btn-primary px-4"
                >
                  {isAdding ? <Loader2 className="animate-spin" size={18} /> : <Plus size={18} />}
                </button>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Priority:</span>
                <div className="flex gap-1">
                  {['Low', 'Medium', 'High'].map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setNewPriority(p)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                        newPriority === p 
                        ? 'bg-[var(--accent)] text-white' 
                        : 'bg-[var(--surface)] text-[var(--text-muted)] border border-[var(--border)] hover:border-[var(--accent)]'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            </form>
          </div>

          <div className="divide-y divide-[var(--border)]">
            {tasks.length === 0 ? (
              <div className="p-12 text-center text-[var(--text-muted)]">
                No tasks yet. Start by adding one above!
              </div>
            ) : (
              tasks.map((task) => (
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
                      <span className={`text-[10px] w-fit px-1.5 py-0.5 rounded uppercase font-bold mt-1 ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
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