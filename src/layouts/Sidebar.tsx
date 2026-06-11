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
    <div className="flex flex-col h-full bg-white dark:bg-[#09090b]">
      {/* Logo */}
      <div className={`flex items-center gap-3 px-4 py-5 border-b border-zinc-100 dark:border-zinc-800/80 ${!isOpen && !isMobile ? 'justify-center' : ''}`}>
        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
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
              <span className="font-bold text-zinc-900 dark:text-zinc-50 text-sm tracking-tight">Zuide Tasks</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Nav items */}
      <nav className="flex-1 py-4 px-2.5 space-y-1 overflow-y-auto">
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
              <item.icon className="w-4.5 h-4.5 flex-shrink-0" />
              <AnimatePresence>
                {(isOpen || isMobile) && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="truncate flex-1 text-left text-xs font-semibold"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
              {badge && badge > 0 && (
                <span className={`bg-rose-600 text-white text-[10px] rounded-full flex items-center justify-center font-bold flex-shrink-0 ${isOpen || isMobile ? 'h-4 min-w-4 px-1' : 'h-3.5 w-3.5 absolute top-1 right-1'}`}>
                  {badge > 9 ? '9+' : badge}
                </span>
              )}
            </button>
          )
        })}
      </nav>

      {/* User & collapse */}
      <div className="border-t border-zinc-100 dark:border-zinc-800/80 p-3 space-y-1.5 bg-white dark:bg-[#09090b]">
        {(isOpen || isMobile) && user && (
          <div className="flex items-center gap-2.5 px-2 py-2 rounded-xl bg-zinc-50/50 dark:bg-zinc-900/40 border border-zinc-100/50 dark:border-zinc-800/30">
            <img
              src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`}
              alt={user.name}
              className="w-8 h-8 rounded-full object-cover bg-zinc-100 border border-zinc-200/50 dark:border-zinc-850 flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-zinc-900 dark:text-zinc-50 truncate leading-none">{user.name}</p>
              <p className="text-[10px] text-zinc-400 dark:text-zinc-500 truncate capitalize mt-1 leading-none">{user.role}</p>
            </div>
          </div>
        )}

        <button
          onClick={handleLogout}
          className={`sidebar-link w-full text-rose-500 hover:bg-rose-50/50 dark:hover:bg-rose-950/20 hover:text-rose-600 ${!isOpen && !isMobile ? 'justify-center px-2' : ''}`}
        >
          <ArrowLeftOnRectangleIcon className="w-4.5 h-4.5 flex-shrink-0" />
          {(isOpen || isMobile) && <span className="text-xs font-semibold">Logout</span>}
        </button>

        {!isMobile && (
          <button
            onClick={onToggle}
            className={`sidebar-link w-full text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 ${!isOpen ? 'justify-center px-2' : ''}`}
          >
            {isOpen ? (
              <>
                <ChevronLeftIcon className="w-4 h-4" />
                <span className="text-xs font-semibold">Collapse</span>
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
                className="fixed inset-0 bg-zinc-950/60 backdrop-blur-[2px] z-40"
                onClick={onClose}
              />
              <motion.aside
                initial={{ x: -280 }}
                animate={{ x: 0 }}
                exit={{ x: -280 }}
                transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                className="fixed left-0 top-0 bottom-0 w-64 bg-white dark:bg-[#09090b] shadow-xl z-50 border-r border-zinc-200/50 dark:border-zinc-800/80"
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
      className={`hidden lg:flex flex-col bg-white dark:bg-[#09090b] border-r border-zinc-200/50 dark:border-zinc-800/80 transition-all duration-300 ${isOpen ? 'w-56' : 'w-16'}`}
    >
      {sidebarContent}
    </aside>
  )
}

