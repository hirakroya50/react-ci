import { CheckCircle2, Circle, Calendar, Edit2, Trash2, X, AlertTriangle } from "lucide-react";

interface Task {
  id: string;
  title: string;
  priority: string;
  is_completed: boolean;
  due_date: string | null;
}

interface TaskItemProps {
  task: Task;
  onToggle: (id: string, status: boolean) => void;
  onDelete: (id: string) => void;
  onEdit: (task: Task) => void;
  isEditing: boolean;
  editTitle: string;
  onEditChange: (val: string) => void;
  onSave: (id: string) => void;
  onCancel: () => void;
}

const TaskItem = ({
  task,
  onToggle,
  onDelete,
  onEdit,
  isEditing,
  editTitle,
  onEditChange,
  onSave,
  onCancel,
}: TaskItemProps) => {
  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && !task.is_completed;

  const getPriorityStyles = (priority: string) => {
    switch (priority) {
      case "High":
        return "text-red-600 bg-red-50 dark:bg-red-950/30 border-red-100 dark:border-red-900/30";
      case "Medium":
        return "text-amber-600 bg-amber-50 dark:bg-amber-950/20 border-amber-100 dark:border-amber-900/30";
      case "Low":
        return "text-blue-600 bg-blue-50 dark:bg-blue-950/20 border-blue-100 dark:border-blue-900/30";
      default:
        return "text-gray-500 bg-gray-50 dark:bg-gray-800 border-gray-100";
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(undefined, { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div className="p-4 flex items-center justify-between group hover:bg-[var(--bg2)] transition-all duration-200">
      <div className="flex items-center gap-4 flex-1">
        <button
          onClick={() => onToggle(task.id, task.is_completed)}
          className="transition-transform active:scale-90 flex-shrink-0"
        >
          {task.is_completed ? (
            <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
              <CheckCircle2 className="text-white" size={14} />
            </div>
          ) : (
            <Circle className="text-[var(--text-muted)] hover:text-[var(--accent)]" size={20} />
          )}
        </button>

        {isEditing ? (
          <div className="flex items-center gap-2 flex-1">
            <input
              autoFocus
              className="flex-1 bg-[var(--surface)] border border-[var(--border)] rounded-xl px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-[var(--accent)]"
              value={editTitle}
              onChange={(e) => onEditChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") onSave(task.id);
                if (e.key === "Escape") onCancel();
              }}
            />
            <div className="flex items-center gap-1">
              <button
                onClick={() => onSave(task.id)}
                className="p-1.5 text-green-500 hover:bg-green-50 rounded-lg transition-colors"
              >
                <CheckCircle2 size={18} />
              </button>
              <button
                onClick={onCancel}
                className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              >
                <X size={18} />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col flex-1 min-w-0" onClick={() => onEdit(task)}>
            <span
              className={`cursor-pointer font-medium truncate ${task.is_completed ? "line-through text-[var(--text-muted)] opacity-60" : "text-[var(--heading)]"}`}
            >
              {task.title}
            </span>
            <div className="flex items-center gap-3 mt-1.5">
              <span
                className={`text-[9px] px-2 py-0.5 rounded-full border font-black uppercase tracking-widest ${getPriorityStyles(task.priority)}`}
              >
                {task.priority}
              </span>
              {task.due_date && (
                <span className={`flex items-center gap-1 text-[10px] font-bold ${isOverdue ? "text-red-500" : "text-[var(--text-muted)]"}`}>
                  {isOverdue ? <AlertTriangle size={10} /> : <Calendar size={10} />}
                  {formatDate(task.due_date)}
                  {isOverdue && <span className="ml-1">Overdue</span>}
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all ml-4">
        {!isEditing && (
          <button
            onClick={() => onEdit(task)}
            className="p-2 text-[var(--text-muted)] hover:text-indigo-600 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-950/30 transition-colors"
          >
            <Edit2 size={16} />
          </button>
        )}
        <button
          onClick={() => onDelete(task.id)}
          className="p-2 text-[var(--text-muted)] hover:text-red-500 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
};

export default TaskItem;