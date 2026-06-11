import React from 'react'

interface LoadingStateProps {
  message?: string
  size?: 'sm' | 'md' | 'lg'
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Loading...',
  size = 'md',
}) => {
  const sizeClasses = {
    sm: 'h-6 w-6 border-2',
    md: 'h-10 w-10 border-3',
    lg: 'h-16 w-16 border-4',
  }

  return (
    <div className="flex flex-col items-center justify-center py-12 gap-4">
      <div
        className={`${sizeClasses[size]} border-primary-600 border-t-transparent rounded-full animate-spin`}
      />
      {message && (
        <p className="text-sm text-gray-500 dark:text-gray-400">{message}</p>
      )}
    </div>
  )
}

export const PageLoader: React.FC = () => (
  <div className="fixed inset-0 flex items-center justify-center bg-white/80 dark:bg-gray-900/80 z-50">
    <div className="flex flex-col items-center gap-4">
      <div className="h-12 w-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Loading Zuide Tasks...</p>
    </div>
  </div>
)

export const SkeletonCard: React.FC = () => (
  <div className="card p-5 animate-pulse">
    <div className="flex items-start gap-3">
      <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-lg" />
      <div className="flex-1">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2" />
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
      </div>
    </div>
  </div>
)
