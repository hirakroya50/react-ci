import {
  Clock,
  CheckCircle2,
  PlusCircle,
  Trash2,
  Layout,
  ClipboardList,
} from "lucide-react";

interface Activity {
  id: string;
  action: string;
  entity_type: string;
  entity_name: string;
  created_at: string;
}

const ActivityFeed = ({ activities }: { activities: Activity[] }) => {
  const getIcon = (action: string, type: string) => {
    if (action === "completed")
      return <CheckCircle2 size={14} className="text-green-500" />;
    if (action === "created")
      return <PlusCircle size={14} className="text-blue-500" />;
    if (action === "deleted")
      return <Trash2 size={14} className="text-red-500" />;
    return type === "project" ? (
      <Layout size={14} />
    ) : (
      <ClipboardList size={14} />
    );
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="space-y-4!">
      {activities.length === 0 ? (
        <p className="rounded-2xl! border! border-white/6! bg-white/[0.02]! px-4! py-5! text-sm italic text-(--text-muted)!">
          No recent activity.
        </p>
      ) : (
        activities.map((activity) => (
          <div
            key={activity.id}
            className="group flex items-start gap-4! rounded-2xl! border! border-white/6! bg-white/[0.02]! p-3! transition-colors hover:bg-white/[0.04]!"
          >
            <div className="mt-0.5! rounded-2xl! border! border-white/8! bg-(--surface-glass-strong)! p-2.5! text-(--heading)! shadow-sm! transition-transform group-hover:scale-105!">
              {getIcon(activity.action, activity.entity_type)}
            </div>
            <div className="flex-1 min-w-0!">
              <p className="text-sm leading-snug text-(--heading)!">
                <span className="font-bold capitalize">{activity.action}</span>{" "}
                {activity.entity_type}{" "}
                <span className="block truncate font-medium text-(--accent) md:inline">
                  "{activity.entity_name}"
                </span>
              </p>
              <div className="mt-1.5! flex items-center gap-1! text-[10px] text-(--text-muted)!">
                <Clock size={10} />
                {formatTime(activity.created_at)}
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default ActivityFeed;
