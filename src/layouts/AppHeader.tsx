import React from 'react'
import { Bars3Icon } from '@heroicons/react/24/outline'
import { ThemeSwitcher } from '@/components/ThemeSwitcher'
import { NotificationBell } from '@/components/NotificationBell'
import { useAuthStore } from '@/store'
import { useHistory } from 'react-router-dom'

interface AppHeaderProps {
  onMenuToggle: () => void
  title?: string
}

export const AppHeader: React.FC<AppHeaderProps> = ({ onMenuToggle, title }) => {
  const { user } = useAuthStore()
  const history = useHistory()

  return (
    <header className="h-14 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 flex items-center px-4 gap-3 sticky top-0 z-30">
      <button
        onClick={onMenuToggle}
        className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
      >
        <Bars3Icon className="w-5 h-5" />
      </button>

      {title && (
        <h1 className="text-base font-semibold text-gray-900 dark:text-white truncate flex-1">
          {title}
        </h1>
      )}

      <div className="flex-1" />

      <div className="flex items-center gap-1">
        <ThemeSwitcher />
        <NotificationBell />

        <button
          onClick={() => history.push('/profile')}
          className="flex items-center gap-2 ml-1 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <img
            src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name}`}
            alt={user?.name}
            className="w-7 h-7 rounded-full object-cover bg-gray-100"
          />
          <span className="hidden sm:block text-sm font-medium text-gray-700 dark:text-gray-300 max-w-[120px] truncate">
            {user?.name}
          </span>
        </button>
      </div>
    </header>
  )
}
