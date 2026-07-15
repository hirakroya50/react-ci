"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../integrations/supabase/client";
import { useAuth } from "../components/AuthProvider";
import {
  Plus,
  Loader2,
  ArrowRight,
  Search,
  History,
  FolderPlus,
  AlertCircle,
  Star,
  Filter,
  Target,
  Sparkles,
  Layers3,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import ActivityFeed from "../components/ActivityFeed";
import ProjectPulse from "../components/ProjectPulse";
import EmptyState from "../components/EmptyState";

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

interface ActivityLog {
  id: string;
  action: string;
  entity_type: string;
  entity_name: string;
  created_at: string;
}

const CATEGORIES = ["All", "Work", "Personal", "Study", "Hobby"];

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [focusTasks, setFocusTasks] = useState<FocusTask[]>([]);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [newProject, setNewProject] = useState({
    name: "",
    description: "",
    category: "Work",
  });

  const fetchStats = async (projectId: string) => {
    const { count: total } = await supabase
      .from("tasks")
      .select("*", { count: "exact", head: true })
      .eq("project_id", projectId);
    const { count: completed } = await supabase
      .from("tasks")
      .select("*", { count: "exact", head: true })
      .eq("project_id", projectId)
      .eq("is_completed", true);
    return { total: total || 0, completed: completed || 0 };
  };

  const fetchData = useCallback(async () => {
    try {
      const { data: projectsData, error: projectsError } = await supabase
        .from("projects")
        .select("*")
        .order("created_at", { ascending: false });

      if (projectsError) throw projectsError;

      const projectsWithStats = await Promise.all(
        (projectsData || []).map(async (project) => {
          const stats = await fetchStats(project.id);
          return { ...project, task_stats: stats };
        }),
      );

      setProjects(projectsWithStats);

      const { data: tasksData } = await supabase
        .from("tasks")
        .select("id, title, priority, projects(name)")
        .eq("is_completed", false)
        .eq("priority", "High")
        .limit(3);

      setFocusTasks(
        (tasksData || []).map((t: any) => ({
          id: t.id,
          title: t.title,
          priority: t.priority,
          project_name: t.projects?.name || "Unknown",
        })),
      );

      const { data: activityData } = await supabase
        .from("activity_logs")
        .select("*")
        .order("created_at", { ascending: false })
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
    const projectsSub = supabase
      .channel("dashboard-sync")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "projects" },
        () => fetchData(),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(projectsSub);
    };
  }, [fetchData]);

  const handleAddProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProject.name.trim()) return;
    setIsSubmitting(true);
    try {
      const { data, error } = await supabase
        .from("projects")
        .insert([{ ...newProject, user_id: user?.id }])
        .select()
        .single();
      if (error) throw error;

      // Log project creation activity
      await supabase.from("activity_logs").insert([
        {
          user_id: user?.id,
          project_id: data.id,
          action: "created",
          entity_type: "project",
          entity_name: data.name,
        },
      ]);

      toast.success("Project launched!");
      setNewProject({ name: "", description: "", category: "Work" });
      fetchData();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      const matchesSearch = p.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesCategory =
        selectedCategory === "All" || p.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [projects, searchQuery, selectedCategory]);

  const globalStats = useMemo(() => {
    const total = projects.reduce(
      (acc, p) => acc + (p.task_stats?.total || 0),
      0,
    );
    const completed = projects.reduce(
      (acc, p) => acc + (p.task_stats?.completed || 0),
      0,
    );
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, percentage };
  }, [projects]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-(--bg) pb-16 pt-24 md:pt-[14.5rem]">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[28rem] bg-[radial-gradient(circle_at_top_left,_var(--panel-glow-strong),_transparent_42%),radial-gradient(circle_at_top_right,_var(--panel-glow),_transparent_42%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-24 mx-auto h-[28rem] max-w-6xl rounded-[3rem] bg-indigo-500/10 blur-3xl" />
      <div className="relative mx-auto flex max-w-7xl flex-col gap-7 px-4 sm:px-6 lg:px-8">
        <header className="relative overflow-hidden rounded-[2rem] border border-[var(--border)] bg-(--surface-glass) p-6 shadow-[var(--shadow-sm)] backdrop-blur-xl md:p-8 lg:p-10">
          <div className="absolute inset-0 bg-[linear-gradient(130deg,rgba(99,102,241,0.14),transparent_45%,rgba(129,140,248,0.07))]" />
          <div className="relative flex flex-col gap-7 xl:flex-row xl:items-end xl:justify-between">
            <div className="max-w-3xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-indigo-300/25 bg-indigo-500/10 px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.26em] text-indigo-400">
                <Sparkles size={14} className="text-indigo-300" />
                Creative workspace
              </div>
              <h1 className="max-w-2xl text-4xl font-black tracking-[-0.045em] text-(--heading) md:text-6xl">
                Build with more signal, less clutter.
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-relaxed text-(--text-muted) md:text-lg">
                Review priorities, launch a new project, and move through your
                work with cleaner spacing and sharper focus.
              </p>
              <div className="mt-6 flex flex-wrap gap-3 text-xs font-bold uppercase tracking-[0.16em] text-(--text-muted)">
                <span className="rounded-full border border-[var(--border)] bg-(--surface-glass-strong) px-3 py-2">
                  {projects.length} active projects
                </span>
                <span className="rounded-full border border-[var(--border)] bg-(--surface-glass-strong) px-3 py-2">
                  {focusTasks.length} priority tasks
                </span>
                <span className="rounded-full border border-[var(--border)] bg-(--surface-glass-strong) px-3 py-2">
                  {globalStats.completed} tasks completed
                </span>
              </div>
            </div>

            <div className="w-full max-w-md rounded-[1.75rem] border border-[var(--border)] bg-(--surface-glass-strong) p-4 shadow-[var(--shadow-sm)] backdrop-blur-xl">
              <div className="mb-3 flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] text-(--text-muted)">
                <Layers3 size={14} className="text-indigo-400" />
                Browse workspace
              </div>
              <label className="relative block">
                <Search
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-(--text-muted)"
                  size={18}
                />
                <input
                  type="text"
                  placeholder="Search projects..."
                  className="w-full rounded-2xl border border-[var(--border)] bg-(--surface) py-4 pl-12 pr-4 text-sm text-(--heading) outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/30"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </label>
              <p className="mt-3 text-sm text-(--text-muted)">
                Filter your space instantly without leaving the dashboard flow.
              </p>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 gap-7 lg:grid-cols-[minmax(0,1fr)_320px] xl:grid-cols-[minmax(0,1fr)_350px]">
          <div className="min-w-0 space-y-8">
            <section className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.8fr)]">
              <div className="rounded-[2rem] border border-[var(--border)] bg-(--surface-glass) p-6 shadow-[var(--shadow-sm)] backdrop-blur-xl md:p-8">
                <div className="mb-6 flex items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 text-amber-400">
                      <Star size={18} className="fill-amber-400" />
                      <h2 className="text-xs font-black uppercase tracking-[0.28em] text-(--heading)">
                        Focus Area
                      </h2>
                    </div>
                    <p className="mt-2 text-sm text-(--text-muted)">
                      Top-priority work surfaced for the next push.
                    </p>
                  </div>
                  <div className="rounded-full border border-[var(--border)] bg-(--surface-glass-strong) px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-(--text-muted)">
                    High priority
                  </div>
                </div>

                {focusTasks.length > 0 ? (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {focusTasks.map((task) => (
                      <div
                        key={task.id}
                        className="group flex items-center justify-between rounded-[1.5rem] border border-[var(--border)] bg-(--surface-glass-strong) p-4 shadow-[var(--shadow-sm)] transition hover:border-indigo-400/50 hover:-translate-y-0.5"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold text-(--heading)">
                            {task.title}
                          </p>
                          <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.24em] text-(--text-muted)">
                            {task.project_name}
                          </p>
                        </div>
                        <ArrowRight
                          size={16}
                          className="text-indigo-300 opacity-70 transition group-hover:translate-x-1 group-hover:opacity-100"
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-[1.5rem] border border-dashed border-[var(--border)] bg-(--surface-glass-strong) p-5 text-center">
                    <p className="text-sm italic text-(--text-muted)">
                      No urgent tasks. You are clear to plan ahead.
                    </p>
                  </div>
                )}
              </div>

              <div className="relative overflow-hidden rounded-[2rem] border border-indigo-400/20 bg-[linear-gradient(160deg,rgba(99,102,241,0.95),rgba(76,29,149,0.88))] p-8 text-white shadow-[0_24px_60px_rgba(79,70,229,0.32)]">
                <div className="absolute -right-12 top-10 h-40 w-40 rounded-full bg-white/12 blur-3xl" />
                <div className="absolute -bottom-16 left-6 h-36 w-36 rounded-full bg-sky-300/15 blur-3xl" />
                <div className="relative flex h-full flex-col justify-between gap-10">
                  <div>
                    <Target size={30} className="mb-6 opacity-70" />
                    <h2 className="text-xs font-black uppercase tracking-[0.28em] text-white/70">
                      Global Progress
                    </h2>
                    <div className="mt-3 text-6xl font-black tracking-[-0.06em]">
                      {globalStats.percentage}%
                    </div>
                    <p className="mt-3 max-w-xs text-sm text-white/75">
                      A clean view of completed work across every active project
                      in your space.
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-[1.25rem] border border-white/10 bg-white/8 p-4">
                      <div className="text-[10px] font-black uppercase tracking-[0.24em] text-white/60">
                        Completed
                      </div>
                      <div className="mt-2 text-2xl font-black">
                        {globalStats.completed}
                      </div>
                    </div>
                    <div className="rounded-[1.25rem] border border-white/10 bg-white/8 p-4">
                      <div className="text-[10px] font-black uppercase tracking-[0.24em] text-white/60">
                        Total
                      </div>
                      <div className="mt-2 text-2xl font-black">
                        {globalStats.total}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-[2rem] border border-[var(--border)] bg-(--surface-glass) p-6 shadow-[var(--shadow-sm)] backdrop-blur-xl md:p-8">
              <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="text-2xl font-black tracking-[-0.04em] text-(--heading)">
                    Launch something new
                  </h2>
                  <p className="text-sm text-(--text-muted)">
                    Create a project from the dashboard without breaking your
                    current workflow.
                  </p>
                </div>
                <div className="text-[11px] font-black uppercase tracking-[0.2em] text-(--text-muted)">
                  Composer
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_180px_160px]">
                <input
                  type="text"
                  placeholder="Launch Project: New Project Name"
                  className="min-w-0 rounded-[1.35rem] border border-[var(--border)] bg-(--surface) px-5 py-4 text-base font-medium text-(--heading) outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/30"
                  value={newProject.name}
                  onChange={(e) =>
                    setNewProject({ ...newProject, name: e.target.value })
                  }
                />
                <select
                  className="rounded-[1.35rem] border border-[var(--border)] bg-(--surface) px-4 py-4 text-sm font-bold text-(--heading) outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/30"
                  value={newProject.category}
                  onChange={(e) =>
                    setNewProject({ ...newProject, category: e.target.value })
                  }
                >
                  {CATEGORIES.filter((category) => category !== "All").map(
                    (category) => (
                      <option key={category}>{category}</option>
                    ),
                  )}
                </select>
                <button
                  type="submit"
                  disabled={isSubmitting || !newProject.name.trim()}
                  onClick={handleAddProject}
                  className="inline-flex items-center justify-center gap-2 rounded-[1.35rem] bg-linear-to-r from-indigo-500 via-indigo-500 to-violet-500 px-6 py-4 text-base font-black text-white shadow-[0_18px_40px_rgba(99,102,241,0.35)] transition hover:-translate-y-0.5 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <Loader2 className="animate-spin" size={20} />
                  ) : (
                    <Plus size={20} />
                  )}
                  Launch
                </button>
              </div>
            </section>

            <section className="rounded-[1.75rem] border border-[var(--border)] bg-(--surface-glass) p-3 shadow-[var(--shadow-sm)] backdrop-blur-xl">
              <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
                <div className="flex items-center gap-2 rounded-full border border-[var(--border)] bg-(--surface-glass-strong) px-4 py-2.5 text-[11px] font-black uppercase tracking-[0.2em] text-(--text-muted)">
                  <Filter size={14} className="shrink-0" />
                  Filters
                </div>
                {CATEGORIES.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`shrink-0 rounded-full px-5 py-2.5 text-xs font-black uppercase tracking-[0.22em] transition-all ${
                      selectedCategory === category
                        ? "bg-linear-to-r from-indigo-500 to-violet-500 text-white shadow-[0_16px_35px_rgba(99,102,241,0.28)]"
                        : "border border-[var(--border)] bg-(--surface-glass-strong) text-(--text-muted) hover:border-indigo-400/50 hover:text-(--heading)"
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </section>

            {loading ? (
              <div className="flex min-h-64 items-center justify-center rounded-[2rem] border border-[var(--border)] bg-(--surface-glass) p-20 shadow-[var(--shadow-sm)] backdrop-blur-xl">
                <Loader2 className="animate-spin text-indigo-400" size={48} />
              </div>
            ) : (
              <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                <AnimatePresence mode="popLayout">
                  {filteredProjects.length > 0 ? (
                    filteredProjects.map((project) => (
                      <motion.div
                        layout
                        initial={{ opacity: 0, scale: 0.97, y: 12 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.97, y: -8 }}
                        key={project.id}
                        onClick={() => navigate(`/projects/${project.id}`)}
                        className="group cursor-pointer rounded-[2rem] border border-[var(--border)] bg-(--surface-strong) p-6 shadow-[var(--shadow-sm)] transition-all hover:-translate-y-1 hover:border-indigo-400/50 hover:shadow-[var(--shadow)] md:p-7"
                      >
                        <div className="mb-6 flex items-start justify-between gap-4">
                          <div className="space-y-3">
                            <span className="inline-flex rounded-full border border-indigo-400/15 bg-indigo-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.24em] text-indigo-400">
                              {project.category}
                            </span>
                            <div>
                              <h3 className="line-clamp-1 text-xl font-black tracking-[-0.03em] text-(--heading) transition-colors group-hover:text-indigo-400">
                                {project.name}
                              </h3>
                              <p className="mt-2 line-clamp-2 text-sm text-(--text-muted)">
                                {project.description?.trim() ||
                                  "A clean project space ready for tasks, milestones, and progress updates."}
                              </p>
                            </div>
                          </div>
                          <div className="rounded-2xl border border-[var(--border)] bg-(--surface-glass-strong) p-3 text-(--text-muted) transition group-hover:border-indigo-400/50 group-hover:text-indigo-400">
                            <ArrowRight
                              size={18}
                              className="transition group-hover:translate-x-0.5"
                            />
                          </div>
                        </div>

                        <div className="mb-5 grid grid-cols-2 gap-3">
                          <div className="rounded-[1.35rem] border border-[var(--border)] bg-(--bg2) px-4 py-3">
                            <div className="text-[10px] font-black uppercase tracking-[0.24em] text-(--text-muted)">
                              Created
                            </div>
                            <div className="mt-2 text-sm font-bold text-(--heading)">
                              {new Date(project.created_at).toLocaleDateString(
                                [],
                                {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                },
                              )}
                            </div>
                          </div>
                          <div className="rounded-[1.35rem] border border-[var(--border)] bg-(--bg2) px-4 py-3">
                            <div className="text-[10px] font-black uppercase tracking-[0.24em] text-(--text-muted)">
                              Completion
                            </div>
                            <div className="mt-2 text-sm font-bold text-(--heading)">
                              {project.task_stats?.completed || 0} /{" "}
                              {project.task_stats?.total || 0}
                            </div>
                          </div>
                        </div>

                        <ProjectPulse
                          total={project.task_stats?.total || 0}
                          completed={project.task_stats?.completed || 0}
                          label="Project pulse"
                        />
                      </motion.div>
                    ))
                  ) : (
                    <div className="col-span-full">
                      <EmptyState
                        icon={
                          searchQuery || selectedCategory !== "All"
                            ? AlertCircle
                            : FolderPlus
                        }
                        title={
                          searchQuery || selectedCategory !== "All"
                            ? "No results"
                            : "Your space is empty"
                        }
                        description={
                          searchQuery || selectedCategory !== "All"
                            ? "Try adjusting your filters or search terms."
                            : "Start your journey by launching a project above."
                        }
                      />
                    </div>
                  )}
                </AnimatePresence>
              </section>
            )}
          </div>

          <aside className="w-full shrink-0 lg:w-[320px] xl:w-[360px]">
            <div className="sticky top-28 overflow-hidden rounded-[2rem] border border-[var(--border)] bg-(--surface-glass) p-6 shadow-[var(--shadow-sm)] backdrop-blur-xl md:p-8">
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(129,140,248,0.08),transparent_30%)]" />
              <div className="relative">
                <div className="mb-8 flex items-center gap-3">
                  <div className="rounded-2xl border border-[var(--border)] bg-(--surface-glass-strong) p-3 text-indigo-400">
                    <History size={20} />
                  </div>
                  <div>
                    <h2 className="text-xs font-black uppercase tracking-[0.28em] text-(--heading)">
                      Activity Feed
                    </h2>
                    <p className="mt-1 text-sm text-(--text-muted)">
                      Recent project and task movement in one place.
                    </p>
                  </div>
                </div>
                <ActivityFeed activities={activities} />
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
