import { CheckCircle2, Circle, Calendar, Edit2, Trash2, X } from "lucide-react";

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
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High":
        return "text-red-500 bg-red-50 dark:bg-red-950/20";
      case "Medium":
        return "text-amber-500 bg-amber-50 dark:bg-amber-950/20";
      case "Low":
        return "text-blue-500 bg-blue-50 dark:bg-blue-950/20";
      default:
        return "text-gray-500 bg-gray-50 dark:bg-gray-800";
    }
  };

  return (
    <div className="p-4 flex items-center justify-between group hover:bg-[var(--bg2)] transition-colors">
      <div className="flex items-center gap-3 flex-1">
        <button
          onClick={() => onToggle(task.id, task.is_completed)}
          className="transition-transform active:scale-90"
        >
          {task.is_completed ? (
            <CheckCircle2 className="text-green-500" size={20} />
          ) : (
            <Circle className="text-[var(--text-muted)]" size={20} />
          )}
        </button>

        {isEditing ? (
          <div className="flex items-center gap-2 flex-1">
            <input
              autoFocus
              className="flex-1 bg-[var(--surface)] border border-[var(--border)] rounded px-2 py-1 text-sm outline-none focus:ring-1 focus:ring-[var(--accent)]"
              value={editTitle}
              onChange={(e) => onEditChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") onSave(task.id);
                if (e.key === "Escape") onCancel();
              }}
            />
            <button
              onClick={() => onSave(task.id)}
              className="p-1 text-green-500 hover:bg-green-50 rounded"
            >
              <CheckCircle2 size={16} />
            </button>
            <button
              onClick={onCancel}
              className="p-1 text-red-500 hover:bg-red-50 rounded"
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <div className="flex flex-col flex-1" onClick={() => onEdit(task)}>
            <span
              className={`cursor-pointer ${task.is_completed ? "line-through text-[var(--text-muted)]" : "text-[var(--heading)]"}`}
            >
              {task.title}
            </span>
            <div className="flex items-center gap-2 mt-1">
              <span
                className={`text-[9px] w-fit px-1.5 py-0.5 rounded uppercase font-bold ${getPriorityColor(task.priority)}`}
              >
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
        )}
      </div>

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
        {!isEditing && (
          <button
            onClick={() => onEdit(task)}
            className="p-2 text-[var(--text-muted)] hover:text-[var(--accent)] rounded-lg hover:bg-[var(--surface)]"
          >
            <Edit2 size={16} />
          </button>
        )}
        <button
          onClick={() => onDelete(task.id)}
          className="p-2 text-[var(--text-muted)] hover:text-red-500 rounded-lg hover:bg-[var(--surface)]"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
};

export default TaskItem;
