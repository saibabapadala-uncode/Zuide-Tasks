import React from 'react'
import { useHistory } from 'react-router-dom'
import { format, isPast, isToday } from 'date-fns'
import { Task } from '@/types'
import { StatusBadge, PriorityBadge } from './StatusBadge'

interface TaskCardProps { task: Task }

export const TaskCard: React.FC<TaskCardProps> = ({ task }) => {
  const history = useHistory()
  const dueDate  = new Date(task.dueDate)
  const isOverdue  = isPast(dueDate) && task.status !== 'completed' && task.status !== 'approved'
  const isDueToday = isToday(dueDate)
  const initials   = task.assignedToName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()

  return (
    <div
      onClick={() => history.push(`/tasks/${task.id}`)}
      className="card-hover p-4 cursor-pointer group bg-white dark:bg-[#18181b]"
    >
      {/* Project tag + priority */}
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider truncate max-w-[160px]">
          {task.projectName}
        </span>
        <PriorityBadge priority={task.priority} />
      </div>

      {/* Title */}
      <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-100 line-clamp-2 leading-relaxed tracking-tight group-hover:text-indigo-650 dark:group-hover:text-indigo-400 transition-colors">
        {task.title}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between gap-2 mt-3.5 pt-3 border-t border-zinc-100 dark:border-zinc-800/80">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-5.5 h-5.5 bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-100/50 dark:border-indigo-900/30 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-[9px] font-bold text-indigo-600 dark:text-indigo-400">{initials}</span>
          </div>
          <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 truncate">{task.assignedToName}</span>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className={`text-[10px] font-bold uppercase tracking-wider ${isOverdue ? 'text-rose-500' : isDueToday ? 'text-amber-500 dark:text-amber-400' : 'text-zinc-400'}`}>
            {format(dueDate, 'MMM d')}
          </span>
          <StatusBadge status={task.status} />
        </div>
      </div>
    </div>
  )
}

