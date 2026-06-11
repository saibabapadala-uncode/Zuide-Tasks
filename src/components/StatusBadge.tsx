import React from 'react'
import { TaskStatus, Priority } from '@/types'

interface StatusBadgeProps {
  status: TaskStatus
}

interface PriorityBadgeProps {
  priority: Priority
}

const statusConfig: Record<TaskStatus, { label: string; className: string }> = {
  pending:     { label: 'Pending',     className: 'status-pending' },
  in_progress: { label: 'In Progress', className: 'status-in_progress' },
  submitted:   { label: 'Submitted',   className: 'status-submitted' },
  approved:    { label: 'Approved',    className: 'status-approved' },
  rejected:    { label: 'Rejected',    className: 'status-rejected' },
  completed:   { label: 'Completed',   className: 'status-completed' },
}

const priorityConfig: Record<Priority, { label: string; className: string }> = {
  low:      { label: 'Low',      className: 'priority-low' },
  medium:   { label: 'Medium',   className: 'priority-medium' },
  high:     { label: 'High',     className: 'priority-high' },
  critical: { label: 'Critical', className: 'priority-critical' },
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const config = statusConfig[status] || { label: status, className: 'status-pending' }
  return (
    <span className={`badge ${config.className}`}>
      {config.label}
    </span>
  )
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority }) => {
  const config = priorityConfig[priority] || { label: priority, className: 'priority-low' }
  return (
    <span className={`badge ${config.className}`}>
      {config.label}
    </span>
  )
}
