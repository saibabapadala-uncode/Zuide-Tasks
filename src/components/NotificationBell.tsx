import React, { useEffect, useRef, useState } from 'react'
import { BellIcon, CheckIcon, TrashIcon } from '@heroicons/react/24/outline'
import { motion, AnimatePresence } from 'framer-motion'
import { useNotificationStore } from '@/store'
import { useAuthStore } from '@/store'
import { formatDistanceToNow } from 'date-fns'
import { Notification } from '@/types'

const typeColors: Record<string, string> = {
  new_task:          'bg-blue-500',
  task_approved:     'bg-green-500',
  task_rejected:     'bg-red-500',
  comment_added:     'bg-purple-500',
  deadline_reminder: 'bg-yellow-500',
  announcement:      'bg-indigo-500',
  task_assigned:     'bg-blue-500',
  task_completed:    'bg-green-500',
}

export const NotificationBell: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)
  const { user } = useAuthStore()
  const { notifications, unreadCount, fetchNotifications, markAsRead, markAllAsRead, deleteNotification } =
    useNotificationStore()

  useEffect(() => {
    if (user) fetchNotifications(user.id)
  }, [user])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleMarkAsRead = async (notif: Notification) => {
    if (!notif.isRead) await markAsRead(notif.id)
  }

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
      >
        <BellIcon className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-80 card shadow-xl z-50 overflow-hidden"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-700">
              <h3 className="font-semibold text-sm text-gray-900 dark:text-white">
                Notifications
                {unreadCount > 0 && (
                  <span className="ml-2 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 text-xs px-1.5 py-0.5 rounded-full">
                    {unreadCount} new
                  </span>
                )}
              </h3>
              {unreadCount > 0 && (
                <button
                  onClick={() => user && markAllAsRead(user.id)}
                  className="text-xs text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1"
                >
                  <CheckIcon className="w-3 h-3" />
                  Mark all read
                </button>
              )}
            </div>

            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                  No notifications
                </div>
              ) : (
                notifications.slice(0, 10).map(notif => (
                  <div
                    key={notif.id}
                    onClick={() => handleMarkAsRead(notif)}
                    className={`flex gap-3 px-4 py-3 border-b border-gray-50 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors ${
                      !notif.isRead ? 'bg-primary-50/50 dark:bg-primary-900/10' : ''
                    }`}
                  >
                    <div className={`mt-0.5 w-2 h-2 rounded-full flex-shrink-0 ${typeColors[notif.type] || 'bg-gray-400'}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-800 dark:text-gray-200">{notif.title}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">{notif.message}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                    <button
                      onClick={e => { e.stopPropagation(); deleteNotification(notif.id) }}
                      className="flex-shrink-0 text-gray-300 hover:text-red-400 transition-colors"
                    >
                      <TrashIcon className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {notifications.length > 0 && (
              <div className="px-4 py-2 border-t border-gray-100 dark:border-gray-700 text-center">
                <a href="/notifications" className="text-xs text-primary-600 dark:text-primary-400 hover:underline">
                  View all notifications
                </a>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
