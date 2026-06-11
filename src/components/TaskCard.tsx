import React from 'react'
import { useHistory } from 'react-router-dom'
import { CalendarIcon, UserIcon, ClockIcon } from '@heroicons/react/24/outline'
import { format, isPast, isToday } from 'date-fns'
import { Task } from '@/types'
import { StatusBadge, PriorityBadge } from './StatusBadge'
import { motion } from 'framer-motion'

interface TaskCardProps {
  task: Task
}

export const TaskCard: React.FC<TaskCardProps> = ({ task }) => {
  const history = useHistory()
  const dueDate = new Date(task.dueDate)
  const isOverdue = isPast(dueDate) && task.status !== 'completed' && task.status !== 'approved'
  const isDueToday = isToday(dueDate)

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.15 }}
      onClick={() => history.push(`/tasks/${task.id}`)}
      className="card p-4 cursor-pointer hover:shadow-md transition-all"
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex-1 min-w-0">
          <p className="text-xs text-gray-400 font-mono mb-1">{task.taskId}</p>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-2 leading-snug">
            {task.title}
          </h3>
        </div>
        <PriorityBadge priority={task.priority} />
      </div>

      <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-3">
        {task.description}
      </p>

      {task.progress > 0 && (
        <div className="mb-3">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs text-gray-500">Progress</span>
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{task.progress}%</span>
          </div>
          <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary-600 rounded-full transition-all"
              style={{ width: `${task.progress}%` }}
            />
          </div>
        </div>
      )}

      <div className="flex items-center justify-between gap-2 mt-3">
        <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
          <UserIcon className="w-3.5 h-3.5" />
          <span className="truncate max-w-[100px]">{task.assignedToName}</span>
        </div>

        <div className={`flex items-center gap-1 text-xs ${
          isOverdue ? 'text-red-500' :
          isDueToday ? 'text-yellow-600 dark:text-yellow-400' :
          'text-gray-500 dark:text-gray-400'
        }`}>
          <CalendarIcon className="w-3.5 h-3.5" />
          <span>{format(dueDate, 'MMM dd')}</span>
          {isOverdue && <span className="text-red-500 font-medium">!</span>}
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
        <span className="text-xs text-gray-500 truncate max-w-[120px]">{task.projectName}</span>
        <StatusBadge status={task.status} />
      </div>
    </motion.div>
  )
}
