import React from 'react'
import { FunnelIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { TaskFilters as ITaskFilters, TaskStatus, Priority } from '@/types'

interface TaskFiltersProps {
  filters: ITaskFilters
  onChange: (filters: ITaskFilters) => void
  onClear: () => void
}

const statusOptions: { value: TaskStatus; label: string }[] = [
  { value: 'pending',     label: 'Pending' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'submitted',   label: 'Submitted' },
  { value: 'approved',    label: 'Approved' },
  { value: 'rejected',    label: 'Rejected' },
  { value: 'completed',   label: 'Completed' },
]

const priorityOptions: { value: Priority; label: string }[] = [
  { value: 'critical', label: 'Critical' },
  { value: 'high',     label: 'High' },
  { value: 'medium',   label: 'Medium' },
  { value: 'low',      label: 'Low' },
]

export const TaskFilters: React.FC<TaskFiltersProps> = ({ filters, onChange, onClear }) => {
  const activeCount = [
    filters.status?.length,
    filters.priority?.length,
    filters.dueDateFrom,
    filters.dueDateTo,
  ].filter(Boolean).length

  const toggleStatus = (status: TaskStatus) => {
    const current = filters.status || []
    const updated = current.includes(status)
      ? current.filter(s => s !== status)
      : [...current, status]
    onChange({ ...filters, status: updated.length ? updated : undefined })
  }

  const togglePriority = (priority: Priority) => {
    const current = filters.priority || []
    const updated = current.includes(priority)
      ? current.filter(p => p !== priority)
      : [...current, priority]
    onChange({ ...filters, priority: updated.length ? updated : undefined })
  }

  return (
    <div className="card p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
          <FunnelIcon className="w-4 h-4" />
          Filters
          {activeCount > 0 && (
            <span className="bg-primary-600 text-white text-xs px-1.5 py-0.5 rounded-full">
              {activeCount}
            </span>
          )}
        </div>
        {activeCount > 0 && (
          <button onClick={onClear} className="text-xs text-gray-500 hover:text-red-500 flex items-center gap-1">
            <XMarkIcon className="w-3.5 h-3.5" />
            Clear
          </button>
        )}
      </div>

      <div>
        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider">Status</p>
        <div className="flex flex-wrap gap-2">
          {statusOptions.map(opt => (
            <button
              key={opt.value}
              onClick={() => toggleStatus(opt.value)}
              className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                filters.status?.includes(opt.value)
                  ? 'bg-primary-600 border-primary-600 text-white'
                  : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-primary-400'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider">Priority</p>
        <div className="flex flex-wrap gap-2">
          {priorityOptions.map(opt => (
            <button
              key={opt.value}
              onClick={() => togglePriority(opt.value)}
              className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                filters.priority?.includes(opt.value)
                  ? 'bg-primary-600 border-primary-600 text-white'
                  : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-primary-400'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider">Due Date Range</p>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs text-gray-500 mb-1 block">From</label>
            <input
              type="date"
              value={filters.dueDateFrom || ''}
              onChange={e => onChange({ ...filters, dueDateFrom: e.target.value || undefined })}
              className="input-field text-xs h-8"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">To</label>
            <input
              type="date"
              value={filters.dueDateTo || ''}
              onChange={e => onChange({ ...filters, dueDateTo: e.target.value || undefined })}
              className="input-field text-xs h-8"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
