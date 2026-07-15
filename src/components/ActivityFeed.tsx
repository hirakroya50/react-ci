import React from 'react';
import { Clock, CheckCircle2, PlusCircle, Trash2, Layout, ClipboardList } from 'lucide-react';

interface Activity {
  id: string;
  action: string;
  entity_type: string;
  entity_name: string;
  created_at: string;
}

const ActivityFeed = ({ activities }: { activities: Activity[] }) => {
  const getIcon = (action: string, type: string) => {
    if (action === 'completed') return <CheckCircle2 size={14} className="text-green-500" />;
    if (action === 'created') return <PlusCircle size={14} className="text-blue-500" />;
    if (action === 'deleted') return <Trash2 size={14} className="text-red-500" />;
    return type === 'project' ? <Layout size={14} /> : <ClipboardList size={14} />;
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-4">
      {activities.length === 0 ? (
        <p className="text-xs text-[var(--text-muted)] italic">No recent activity.</p>
      ) : (
        activities.map((activity) => (
          <div key={activity.id} className="flex items-start gap-3 group">
            <div className="mt-0.5 p-1.5 rounded-full bg-[var(--bg2)] group-hover:bg-[var(--surface)] border border-[var(--border)] transition-colors">
              {getIcon(activity.action, activity.entity_type)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-[var(--heading)] leading-snug">
                <span className="font-bold capitalize">{activity.action}</span> {activity.entity_type}{' '}
                <span className="font-medium text-[var(--accent)] truncate block md:inline">"{activity.entity_name}"</span>
              </p>
              <div className="flex items-center gap-1 mt-0.5 text-[10px] text-[var(--text-muted)]">
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