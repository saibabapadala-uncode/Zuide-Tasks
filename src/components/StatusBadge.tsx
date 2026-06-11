import React from 'react'
import { TaskStatus, Priority } from '@/types'

interface StatusBadgeProps  { status: TaskStatus }
interface PriorityBadgeProps { priority: Priority }

const statusConfig: Record<TaskStatus, { label: string; className: string; dot: string }> = {
  pending:     { label: 'Pending',     className: 'status-pending',     dot: 'bg-amber-500' },
  in_progress: { label: 'In Progress', className: 'status-in_progress', dot: 'bg-indigo-500' },
  submitted:   { label: 'Submitted',   className: 'status-submitted',   dot: 'bg-violet-500' },
  approved:    { label: 'Approved',    className: 'status-approved',    dot: 'bg-emerald-500' },
  rejected:    { label: 'Rejected',    className: 'status-rejected',    dot: 'bg-rose-500' },
  completed:   { label: 'Completed',   className: 'status-completed',   dot: 'bg-emerald-500' },
}

const priorityConfig: Record<Priority, { label: string; className: string }> = {
  low:      { label: 'Low',      className: 'priority-low' },
  medium:   { label: 'Medium',   className: 'priority-medium' },
  high:     { label: 'High',     className: 'priority-high' },
  critical: { label: 'Critical', className: 'priority-critical' },
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const c = statusConfig[status] ?? statusConfig.pending
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide uppercase leading-none ${c.className}`}>
      <span className={`w-1 h-1 rounded-full flex-shrink-0 ${c.dot}`} />
      {c.label}
    </span>
  )
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority }) => {
  const c = priorityConfig[priority] ?? priorityConfig.low
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide uppercase leading-none ${c.className}`}>
      {c.label}
    </span>
  )
}

