"use client";

import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
}

const EmptyState = ({ icon: Icon, title, description, action }: EmptyStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-[var(--surface)] border border-dashed border-[var(--border)] rounded-2xl">
      <div className="p-4 rounded-full bg-[var(--bg2)] text-[var(--accent)] mb-4">
        <Icon size={32} />
      </div>
      <h3 className="text-lg font-bold text-[var(--heading)] mb-1">{title}</h3>
      <p className="text-sm text-[var(--text-muted)] max-w-xs mb-6">{description}</p>
      {action && action}
    </div>
  );
};

export default EmptyState;