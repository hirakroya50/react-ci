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
    <div className="flex flex-col gap-2.5">
      <div className="flex justify-between items-end">
        <span className="text-[10px] font-bold uppercase tracking-[0.24em] text-(--text-muted)">
          {label}
        </span>
        <span className="text-sm font-bold text-(--heading)">
          {percentage}%
        </span>
      </div>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-black/10 dark:bg-white/5">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="h-full rounded-full bg-linear-to-r from-(--accent) via-(--accent2) to-sky-400"
        />
      </div>
      <div className="flex justify-between text-[10px] font-medium text-(--text-muted)">
        <span>{completed} done</span>
        <span>{total} total</span>
      </div>
    </div>
  );
};

export default ProjectPulse;
