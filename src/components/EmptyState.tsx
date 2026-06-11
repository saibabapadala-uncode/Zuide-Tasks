import React from 'react'
import { InboxIcon } from '@heroicons/react/24/outline'

interface EmptyStateProps {
  title?: string
  description?: string
  icon?: React.ElementType
  action?: {
    label: string
    onClick: () => void
  }
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No items found',
  description = 'There are no items to display at this time.',
  icon: Icon = InboxIcon,
  action,
}) => (
  <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
      <Icon className="w-8 h-8 text-gray-400" />
    </div>
    <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">{title}</h3>
    <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs">{description}</p>
    {action && (
      <button
        onClick={action.onClick}
        className="mt-4 btn-primary text-sm"
      >
        {action.label}
      </button>
    )}
  </div>
)
