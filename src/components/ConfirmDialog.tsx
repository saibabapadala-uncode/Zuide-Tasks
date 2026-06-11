import React from 'react'
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import { motion, AnimatePresence } from 'framer-motion'

interface ConfirmDialogProps {
  isOpen: boolean
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'danger' | 'warning' | 'info'
  onConfirm: () => void
  onCancel: () => void
  isLoading?: boolean
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
  onConfirm,
  onCancel,
  isLoading,
}) => {
  const variantClasses = {
    danger: 'bg-red-600 hover:bg-red-700 text-white',
    warning: 'bg-yellow-500 hover:bg-yellow-600 text-white',
    info: 'bg-primary-600 hover:bg-primary-700 text-white',
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onCancel}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative card p-6 w-full max-w-sm"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                variant === 'danger' ? 'bg-red-100 dark:bg-red-900/30' :
                variant === 'warning' ? 'bg-yellow-100 dark:bg-yellow-900/30' :
                'bg-blue-100 dark:bg-blue-900/30'
              }`}>
                <ExclamationTriangleIcon className={`w-5 h-5 ${
                  variant === 'danger' ? 'text-red-600 dark:text-red-400' :
                  variant === 'warning' ? 'text-yellow-600 dark:text-yellow-400' :
                  'text-blue-600 dark:text-blue-400'
                }`} />
              </div>
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">{title}</h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">{message}</p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={onCancel}
                disabled={isLoading}
                className="btn-secondary text-sm"
              >
                {cancelLabel}
              </button>
              <button
                onClick={onConfirm}
                disabled={isLoading}
                className={`text-sm font-medium py-2 px-4 rounded-lg transition-colors ${variantClasses[variant]}`}
              >
                {isLoading ? 'Processing...' : confirmLabel}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
