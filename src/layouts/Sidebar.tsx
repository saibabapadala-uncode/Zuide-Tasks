import React, { useState } from 'react'
import { useLocation, useHistory } from 'react-router-dom'
import {
  HomeIcon,
  ClipboardDocumentListIcon,
  BellIcon,
  UserIcon,
  ChartBarIcon,
  UsersIcon,
  Cog6ToothIcon,
  ArrowLeftOnRectangleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  RectangleGroupIcon,
} from '@heroicons/react/24/outline'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from '@/store'
import { useNotificationStore } from '@/store'

interface NavItem {
  path: string
  label: string
  icon: React.ElementType
  roles?: string[]
  badge?: number
}

const navItems: NavItem[] = [
  { path: '/dashboard',      label: 'Dashboard',   icon: HomeIcon },
  { path: '/tasks',          label: 'My Tasks',    icon: ClipboardDocumentListIcon },
  { path: '/projects',       label: 'Projects',    icon: RectangleGroupIcon },
  { path: '/notifications',  label: 'Notifications', icon: BellIcon },
  { path: '/reports',        label: 'Reports',     icon: ChartBarIcon },
  { path: '/profile',        label: 'Profile',     icon: UserIcon },
  { path: '/admin',          label: 'Admin',       icon: UsersIcon, roles: ['admin', 'manager'] },
  { path: '/settings',       label: 'Settings',    icon: Cog6ToothIcon },
]

interface SidebarProps {
  isOpen: boolean
  onToggle: () => void
  isMobile?: boolean
  onClose?: () => void
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle, isMobile, onClose }) => {
  const location = useLocation()
  const history = useHistory()
  const { user, logout } = useAuthStore()
  const { unreadCount } = useNotificationStore()

  const handleNav = (path: string) => {
    history.push(path)
    if (isMobile && onClose) onClose()
  }

  const handleLogout = () => {
    logout()
    history.replace('/login')
  }

  const filteredItems = navItems.filter(item =>
    !item.roles || (user && item.roles.includes(user.role))
  )

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={`flex items-center gap-3 px-4 py-5 border-b border-gray-200 dark:border-gray-700 ${!isOpen && !isMobile ? 'justify-center' : ''}`}>
        <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center flex-shrink-0">
          <span className="text-white font-bold text-sm">Z</span>
        </div>
        <AnimatePresence>
          {(isOpen || isMobile) && (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              className="overflow-hidden whitespace-nowrap"
            >
              <span className="font-bold text-gray-900 dark:text-white text-sm">Zuide Tasks</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Nav items */}
      <nav className="flex-1 py-4 px-2 space-y-0.5 overflow-y-auto">
        {filteredItems.map(item => {
          const isActive = location.pathname.startsWith(item.path)
          const badge = item.path === '/notifications' ? unreadCount : undefined
          return (
            <button
              key={item.path}
              onClick={() => handleNav(item.path)}
              title={!isOpen && !isMobile ? item.label : undefined}
              className={`sidebar-link w-full ${isActive ? 'active' : ''} ${!isOpen && !isMobile ? 'justify-center px-2' : ''}`}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              <AnimatePresence>
                {(isOpen || isMobile) && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="truncate flex-1 text-left"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
              {badge && badge > 0 && (
                <span className={`bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium flex-shrink-0 ${isOpen || isMobile ? 'h-4 min-w-4 px-1' : 'h-4 w-4 absolute top-1 right-1'}`}>
                  {badge > 9 ? '9+' : badge}
                </span>
              )}
            </button>
          )
        })}
      </nav>

      {/* User & collapse */}
      <div className="border-t border-gray-200 dark:border-gray-700 p-3 space-y-2">
        {(isOpen || isMobile) && user && (
          <div className="flex items-center gap-2 px-2 py-2">
            <img
              src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`}
              alt={user.name}
              className="w-8 h-8 rounded-full object-cover bg-gray-100 flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">{user.name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate capitalize">{user.role}</p>
            </div>
          </div>
        )}

        <button
          onClick={handleLogout}
          className={`sidebar-link w-full text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 ${!isOpen && !isMobile ? 'justify-center px-2' : ''}`}
        >
          <ArrowLeftOnRectangleIcon className="w-5 h-5 flex-shrink-0" />
          {(isOpen || isMobile) && <span>Logout</span>}
        </button>

        {!isMobile && (
          <button
            onClick={onToggle}
            className={`sidebar-link w-full ${!isOpen ? 'justify-center px-2' : ''}`}
          >
            {isOpen ? (
              <>
                <ChevronLeftIcon className="w-4 h-4" />
                <span>Collapse</span>
              </>
            ) : (
              <ChevronRightIcon className="w-4 h-4" />
            )}
          </button>
        )}
      </div>
    </div>
  )

  if (isMobile) {
    return (
      <>
        <AnimatePresence>
          {isOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/40 z-40"
                onClick={onClose}
              />
              <motion.aside
                initial={{ x: -280 }}
                animate={{ x: 0 }}
                exit={{ x: -280 }}
                transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                className="fixed left-0 top-0 bottom-0 w-64 bg-white dark:bg-gray-900 shadow-xl z-50"
              >
                {sidebarContent}
              </motion.aside>
            </>
          )}
        </AnimatePresence>
      </>
    )
  }

  return (
    <aside
      className={`hidden lg:flex flex-col bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 ${isOpen ? 'w-56' : 'w-16'}`}
    >
      {sidebarContent}
    </aside>
  )
}
