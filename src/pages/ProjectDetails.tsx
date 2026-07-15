"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../integrations/supabase/client';
import { useAuth } from '../components/AuthProvider';
import { 
  ChevronLeft, Plus, Loader2, Search, Trash2, 
  LayoutGrid, List, ClipboardList, AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import TaskItem from '../components/TaskItem';
import EmptyState from '../components/EmptyState';

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
  
  const [project, setProject] = useState<any>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDeletingProject, setIsDeletingProject] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', priority: 'Medium', due_date: '' });
  const [taskSearch, setTaskSearch] = useState('');
  
  // Task editing state
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  const fetchData = async () => {
    try {
      const { data: projectData, error: pError } = await supabase.from('projects').select('*').eq('id', id).single();
      if (pError) throw pError;
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

  const addTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.title.trim()) return;
    
    const { data, error } = await supabase.from('tasks').insert([{ 
      title: newTask.title, 
      priority: newTask.priority,
      due_date: newTask.due_date || null,
      project_id: id, 
      user_id: user?.id 
    }]).select().single();

    if (!error) {
      setTasks([data, ...tasks]);
      setNewTask({ title: '', priority: 'Medium', due_date: '' });
      await supabase.from('activity_logs').insert([{
        user_id: user?.id,
        project_id: id,
        action: 'created',
        entity_type: 'task',
        entity_name: data.title
      }]);
      toast.success('Task added');
    }
  };

  const toggleTask = async (taskId: string, currentStatus: boolean) => {
    const { error } = await supabase.from('tasks').update({ is_completed: !currentStatus }).eq('id', taskId);
    if (!error) {
      setTasks(tasks.map(t => t.id === taskId ? { ...t, is_completed: !currentStatus } : t));
      const task = tasks.find(t => t.id === taskId);
      if (!currentStatus && task) {
        await supabase.from('activity_logs').insert([{
          user_id: user?.id,
          project_id: id,
          action: 'completed',
          entity_type: 'task',
          entity_name: task.title
        }]);
      }
    }
  };

  const deleteTask = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    const { error } = await supabase.from('tasks').delete().eq('id', taskId);
    if (!error) {
      setTasks(tasks.filter(t => t.id !== taskId));
      toast.success('Task removed');
      if (task) {
        await supabase.from('activity_logs').insert([{
          user_id: user?.id,
          project_id: id,
          action: 'deleted',
          entity_type: 'task',
          entity_name: task.title
        }]);
      }
    }
  };

  const startEditing = (task: Task) => {
    setEditingTaskId(task.id);
    setEditTitle(task.title);
  };

  const saveTaskEdit = async (taskId: string) => {
    if (!editTitle.trim()) return;
    const { error } = await supabase.from('tasks').update({ title: editTitle }).eq('id', taskId);
    if (!error) {
      setTasks(tasks.map(t => t.id === taskId ? { ...t, title: editTitle } : t));
      setEditingTaskId(null);
      toast.success('Task updated');
    }
  };

  const deleteProject = async () => {
    if (!window.confirm('Are you sure you want to delete this project and all its tasks?')) return;
    
    setIsDeletingProject(true);
    try {
      const { error } = await supabase.from('projects').delete().eq('id', id);
      if (error) throw error;
      
      toast.success('Project deleted');
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.message);
      setIsDeletingProject(false);
    }
  };

  const filteredTasks = tasks.filter(t => t.title.toLowerCase().includes(taskSearch.toLowerCase()));

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-[var(--accent)]" size={32} /></div>;

  return (
    <div className="min-h-screen bg-[var(--bg)] pt-24 pb-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Link to="/dashboard" className="inline-flex items-center gap-2 text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors">
            <ChevronLeft size={18} /> Back to Workspace
          </Link>
          <button 
            onClick={deleteProject} 
            disabled={isDeletingProject}
            className="flex items-center gap-2 text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 px-3 py-1.5 rounded-lg transition-colors"
          >
            {isDeletingProject ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
            Delete Project
          </button>
        </div>

        <header className="mb-8 p-6 bg-[var(--surface)] rounded-2xl border border-[var(--border)] shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[var(--bg2)] text-[var(--accent)] uppercase tracking-tight">
              {project?.category}
            </span>
          </div>
          <h1 className="text-3xl font-bold text-[var(--heading)]">{project?.name}</h1>
          <p className="text-[var(--text-muted)] mt-1">{project?.description || 'Focus on the tasks ahead.'}</p>
        </header>

        <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] shadow-sm overflow-hidden">
          <div className="p-6 border-b border-[var(--border)] bg-[var(--bg2)]">
            <form onSubmit={addTask} className="space-y-4">
              <div className="flex gap-2">
                <input 
                  type="text" placeholder="What needs to be done?" 
                  className="flex-1 px-4 py-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] outline-none focus:ring-2 focus:ring-[var(--accent)]"
                  value={newTask.title} onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  required
                />
                <button type="submit" className="btn btn-primary px-6"><Plus size={18} /></button>
              </div>
              <div className="flex flex-wrap gap-4 items-center">
                <div className="flex items-center gap-2">
                  <label className="text-xs font-bold text-[var(--text-muted)] uppercase">Priority:</label>
                  <select 
                    className="bg-transparent text-xs font-medium text-[var(--heading)] outline-none border-b border-[var(--border)]"
                    value={newTask.priority} onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                  >
                    <option>High</option>
                    <option>Medium</option>
                    <option>Low</option>
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-xs font-bold text-[var(--text-muted)] uppercase">Due:</label>
                  <input 
                    type="date"
                    className="bg-transparent text-xs font-medium text-[var(--heading)] outline-none"
                    value={newTask.due_date} onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value })}
                  />
                </div>
              </div>
            </form>
          </div>

          <div className="px-6 py-3 border-b border-[var(--border)] flex items-center justify-between">
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={14} />
              <input 
                type="text" placeholder="Filter tasks..." 
                className="w-full pl-10 pr-4 py-1.5 rounded-lg bg-[var(--bg2)] text-xs outline-none"
                value={taskSearch} onChange={(e) => setTaskSearch(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <button className="p-1.5 text-[var(--accent)] bg-[var(--bg2)] rounded-md"><List size={14} /></button>
              <button className="p-1.5 text-[var(--text-muted)] hover:bg-[var(--bg2)] rounded-md"><LayoutGrid size={14} /></button>
            </div>
          </div>

          <motion.div layout className="divide-y divide-[var(--border)]">
            <AnimatePresence mode='popLayout'>
              {filteredTasks.length > 0 ? (
                filteredTasks.map((task) => (
                  <motion.div 
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, x: -10 }}
                    key={task.id}
                  >
                    <TaskItem 
                      task={task}
                      onToggle={toggleTask}
                      onDelete={deleteTask}
                      onEdit={startEditing}
                      isEditing={editingTaskId === task.id}
                      editTitle={editTitle}
                      onEditChange={setEditTitle}
                      onSave={saveTaskEdit}
                      onCancel={() => setEditingTaskId(null)}
                    />
                  </motion.div>
                ))
              ) : (
                <div className="p-8">
                  <EmptyState 
                    icon={taskSearch ? AlertCircle : ClipboardList}
                    title={taskSearch ? "No tasks found" : "No tasks yet"}
                    description={taskSearch ? "Try a different search term or clear filters." : "Start by adding a task using the form above."}
                  />
                </div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetails;