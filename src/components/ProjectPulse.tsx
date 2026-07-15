"use client";

import { motion } from "framer-motion";

interface PulseProps {
  total: number;
  completed: number;
  label: string;
}

const ProjectPulse = ({ total, completed, label }: PulseProps) => {
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between items-end">
        <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
          {label}
        </span>
        <span className="text-sm font-bold text-[var(--heading)]">
          {percentage}%
        </span>
      </div>
      <div className="h-2 w-full bg-[var(--bg2)] rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="h-full bg-gradient-to-r from-[var(--accent)] to-[var(--accent2)] rounded-full"
        />
      </div>
      <div className="flex justify-between text-[10px] text-[var(--text-muted)] font-medium">
        <span>{completed} done</span>
        <span>{total} total</span>
      </div>
    </div>
  );
};

export default ProjectPulse;
