"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../integrations/supabase/client';
import { useAuth } from '../components/AuthProvider';
import { ChevronLeft, Plus, Loader2, Settings, X, Save, Search, CheckCircle2, Circle, Trash2, Calendar, Edit2, FileText } from 'lucide-react';
import toast from 'react-hot-toast';

interface Task {
  id: string;
  title: string;
  description: string;
  priority: string;
  is_completed: boolean;
  due_date: string | null;
  created_at: string;
}

const ProjectDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [project, setProject] = useState<any>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTask, setNewTask] = useState('');
  const [taskSearch, setTaskSearch] = useState('');

  const fetchData = async () => {
    try {
      const { data: projectData } = await supabase.from('projects').select('*').eq('id', id).single();
      setProject(projectData);

      const { data: tasksData } = await supabase.from('tasks').select('*').eq('project_id', id).order('created_at', { ascending: false });
      setTasks(tasksData || []);
    } catch (error: any) {
      toast.error('Project not found');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [id]);

  const logActivity = async (action: string, type: string, name: string) => {
    await supabase.from('activity_logs').insert([{
      user_id: user?.id,
      project_id: id,
      action,
      entity_type: type,
      entity_name: name
    }]);
  };

  const addTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.trim()) return;
    const { data, error } = await supabase.from('tasks').insert([{ title: newTask, project_id: id, user_id: user?.id }]).select().single();
    if (!error) {
      setTasks([data, ...tasks]);
      setNewTask('');
      await logActivity('created', 'task', data.title);
      toast.success('Task added');
    }
  };

  const toggleTask = async (task: Task) => {
    const { error } = await supabase.from('tasks').update({ is_completed: !task.is_completed }).eq('id', task.id);
    if (!error) {
      setTasks(tasks.map(t => t.id === task.id ? { ...t, is_completed: !task.is_completed } : t));
      if (!task.is_completed) await logActivity('completed', 'task', task.title);
    }
  };

  const deleteTask = async (task: Task) => {
    const { error } = await supabase.from('tasks').delete().eq('id', task.id);
    if (!error) {
      setTasks(tasks.filter(t => t.id !== task.id));
      await logActivity('deleted', 'task', task.title);
      toast.success('Task removed');
    }
  };

  const filteredTasks = tasks.filter(t => t.title.toLowerCase().includes(taskSearch.toLowerCase()));

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-[var(--accent)]" size={32} /></div>;

  return (
    <div className="min-h-screen bg-[var(--bg)] pt-24 pb-12 px-4">
      <div className="max-w-3xl mx-auto">
        <Link to="/dashboard" className="inline-flex items-center gap-2 text-[var(--text-muted)] hover:text-[var(--accent)] mb-6 transition-colors">
          <ChevronLeft size={18} /> Back to Dashboard
        </Link>

        <header className="mb-8 p-6 bg-[var(--surface)] rounded-2xl border border-[var(--border)] shadow-sm">
          <h1 className="text-3xl font-bold text-[var(--heading)]">{project?.name}</h1>
          <p className="text-[var(--text-muted)] mt-1">{project?.description || 'No description provided.'}</p>
        </header>

        <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] shadow-sm overflow-hidden">
          <div className="p-6 border-b border-[var(--border)] bg-[var(--bg2)]">
            <form onSubmit={addTask} className="flex gap-2">
              <input 
                type="text" placeholder="Add a new task..." 
                className="flex-1 px-4 py-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] outline-none focus:ring-2 focus:ring-[var(--accent)]"
                value={newTask} onChange={(e) => setNewTask(e.target.value)}
              />
              <button type="submit" className="btn btn-primary px-6"><Plus size={18} /></button>
            </form>
          </div>

          <div className="px-6 py-3 border-b border-[var(--border)] bg-[var(--surface)]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={14} />
              <input 
                type="text" placeholder="Filter tasks..." 
                className="w-full pl-10 pr-4 py-1.5 rounded-lg bg-[var(--bg2)] text-xs outline-none"
                value={taskSearch} onChange={(e) => setTaskSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="divide-y divide-[var(--border)]">
            {filteredTasks.map((task) => (
              <div key={task.id} className="p-4 flex items-center justify-between group hover:bg-[var(--bg2)] transition-colors">
                <div className="flex items-center gap-3">
                  <button onClick={() => toggleTask(task)} className="transition-transform active:scale-90">
                    {task.is_completed ? <CheckCircle2 className="text-green-500" size={20} /> : <Circle className="text-[var(--text-muted)]" size={20} />}
                  </button>
                  <span className={`${task.is_completed ? 'line-through text-[var(--text-muted)]' : 'text-[var(--heading)]'}`}>{task.title}</span>
                </div>
                <button onClick={() => deleteTask(task)} className="p-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetails;